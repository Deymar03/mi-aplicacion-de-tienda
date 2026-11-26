-- =====================================================================
--  TIENDA DE BARRIO · Configuración de seguridad y lógica en Supabase
-- =====================================================================
--  Cómo usarlo:
--    1. Abre tu proyecto en https://supabase.com → SQL Editor → New query.
--    2. Pega TODO este archivo y pulsa "Run". Se puede ejecutar varias veces.
--    3. Convierte a tu usuario en administrador (al final del archivo).
--
--  Qué hace:
--    · Row Level Security (RLS): cada usuario solo ve lo que le corresponde.
--    · Trigger que crea el perfil al registrarse SIEMPRE con rol 'user'
--      (nadie puede auto-asignarse el rol admin desde la app).
--    · Función `realizar_compra`: compra atómica (valida stock, descuenta
--      inventario y crea el recibo en una sola transacción).
--    · Bucket de Storage `product-images` para las fotos de productos.
--    · Realtime activado para `products` y `transactions`.
--
--  Supuestos sobre tus tablas actuales (ya existentes):
--    profiles(id, name, carnet, role)
--    products(id, nombre, categoria, descripcion, codigo_producto, marca,
--             unidad_medida, imagen_url, precio_compra, precio_venta,
--             stock, activo, created_at)
--    transactions(id, user_id, usuario_nombre, items, total, metodo_pago,
--                 subtotal, total_items, status, receipt_id, created_at)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Función auxiliar: ¿el usuario actual es administrador?
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ---------------------------------------------------------------------
-- 2. Perfil automático al registrarse (rol siempre 'user')
-- ---------------------------------------------------------------------
-- IMPORTANTE: si ya tenías un trigger sobre auth.users que crea el perfil,
-- revísalo con la consulta de abajo y elimínalo si copia el rol desde
-- los metadatos (eso permitiría que alguien se registre como admin):
--
--   select tgname from pg_trigger
--   where tgrelid = 'auth.users'::regclass and not tgisinternal;
--
--   drop trigger "nombre_del_trigger_viejo" on auth.users;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, carnet, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'carnet', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.products     enable row level security;
alter table public.transactions enable row level security;

-- profiles: cada uno ve su perfil; el admin ve todos (para los reportes).
-- No hay políticas de insert/update/delete: nadie puede cambiar roles desde la app.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- products: todos los usuarios con sesión leen; solo el admin modifica.
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select to authenticated
  using (true);

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  for delete to authenticated
  using (public.is_admin());

-- transactions: el cliente ve sus compras; el admin ve todas.
-- No hay política de insert: las compras se crean SOLO con realizar_compra().
drop policy if exists "transactions_select" on public.transactions;
create policy "transactions_select" on public.transactions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());


-- ---------------------------------------------------------------------
-- 4. Restricciones de integridad en productos
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_stock_no_negativo') then
    alter table public.products
      add constraint products_stock_no_negativo check (stock >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_precios_validos') then
    alter table public.products
      add constraint products_precios_validos
      check (precio_compra >= 0 and precio_venta >= 0) not valid;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 5. Compra atómica: realizar_compra
-- ---------------------------------------------------------------------
-- Recibe: p_items = [{ "producto_id": "...", "cantidad": 2 }, ...]
-- Usa los precios REALES de la base de datos (el cliente no puede manipular el total),
-- bloquea las filas para evitar sobreventa y devuelve el recibo creado.
create sequence if not exists public.receipt_seq;

create or replace function public.realizar_compra(p_items jsonb, p_metodo text default 'Efectivo')
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_nombre  text;
  v_item    jsonb;
  v_prod    public.products%rowtype;
  v_cant    int;
  v_items   jsonb := '[]'::jsonb;
  v_total   numeric := 0;
  v_lineas  int := 0;
  v_tx      public.transactions;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesión para comprar';
  end if;

  if p_metodo not in ('Efectivo', 'QR') then
    raise exception 'Método de pago inválido';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  select name into v_nombre from public.profiles where id = v_user;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cant := (v_item ->> 'cantidad')::int;
    if v_cant is null or v_cant <= 0 then
      raise exception 'Cantidad inválida';
    end if;

    -- "for update" bloquea el producto hasta terminar: evita que dos compras simultáneas vendan el mismo stock.
    select * into v_prod
    from public.products
    where id::text = (v_item ->> 'producto_id')
      and activo is not false
    for update;

    if not found then
      raise exception 'Uno de los productos ya no está disponible';
    end if;

    if v_prod.stock < v_cant then
      raise exception 'Stock insuficiente de %', v_prod.nombre;
    end if;

    update public.products set stock = stock - v_cant where id = v_prod.id;

    v_total  := v_total + v_cant * v_prod.precio_venta;
    v_lineas := v_lineas + 1;

    -- Se guarda una copia del producto tal como estaba al vender (para recibos e historial).
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'cantidad', v_cant,
      'precioUnitario', v_prod.precio_venta,
      'producto', jsonb_build_object(
        'id', v_prod.id,
        'nombre', v_prod.nombre,
        'categoria', v_prod.categoria,
        'descripcion', v_prod.descripcion,
        'codigoProducto', v_prod.codigo_producto,
        'marca', v_prod.marca,
        'unidadMedida', v_prod.unidad_medida,
        'imagenUrl', v_prod.imagen_url,
        'precioCompra', v_prod.precio_compra,
        'precioVenta', v_prod.precio_venta
      )
    ));
  end loop;

  insert into public.transactions
    (user_id, usuario_nombre, items, total, metodo_pago, subtotal, total_items, status, receipt_id)
  values
    (v_user, coalesce(v_nombre, 'Cliente'), v_items, v_total, p_metodo, v_total, v_lineas, 'completado',
     'REC-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.receipt_seq')::text, 4, '0'))
  returning * into v_tx;

  return v_tx;
end;
$$;

revoke all on function public.realizar_compra(jsonb, text) from public, anon;
grant execute on function public.realizar_compra(jsonb, text) to authenticated;


-- ---------------------------------------------------------------------
-- 6. Storage: bucket público para las fotos de productos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_admin" on storage.objects;
create policy "product_images_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_update_admin" on storage.objects;
create policy "product_images_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_delete_admin" on storage.objects;
create policy "product_images_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());


-- ---------------------------------------------------------------------
-- 7. Realtime para products y transactions
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['products', 'transactions'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 8. Crear tu administrador (ejecuta esto aparte, con TU correo)
-- ---------------------------------------------------------------------
-- update public.profiles
--    set role = 'admin'
--  where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
