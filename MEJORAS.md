# Resumen de mejoras

## Errores corregidos

| # | Problema encontrado | Corrección |
|---|---|---|
| 1 | Los comentarios `//* ...` dentro del JSX se mostraban como **texto** (en celular provocan el error "Text strings must be rendered within a <Text>") | Convertidos a `{/* ... */}` en `ventas.tsx` y `productos.tsx` |
| 2 | La barra de pestañas apuntaba a rutas inexistentes (`index`, `explorar`, `ganancias`) | Ahora usa `productos` y `ventas`; el cliente ve "Productos / Carrito" y el admin "Inventario / Reportes" |
| 3 | Íconos de las pestañas: solo existían 4 en el mapeo de Android/web y los inactivos tenían el mismo color del fondo | Mapeo completo y colores visibles en modo claro y oscuro |
| 4 | La sesión no se guardaba: había que iniciar sesión cada vez que se abría la app | Sesión persistente con AsyncStorage + refresco automático del token |
| 5 | Productos y ventas se cargaban **antes** de iniciar sesión y no se actualizaban después | Se cargan al iniciar sesión y se limpian al cerrarla |
| 6 | Las fotos se guardaban como ruta local del teléfono (`file://`): otros usuarios no las veían | Se suben a Supabase Storage y se guarda la URL pública |
| 7 | El carrito permitía agregar más unidades que el stock | Validación contra el stock en vivo |
| 8 | Al borrar el número de cantidad en el carrito, el producto se eliminaba | Corregido |
| 9 | Compra no atómica: se descontaba stock producto por producto y, si fallaba el recibo, el stock quedaba descontado; dos compras simultáneas podían vender el mismo stock | Función SQL `realizar_compra` (transacción única con bloqueo de filas y precios tomados del servidor) |
| 10 | Código de producto duplicado al eliminar y crear productos (se contaban solo los activos) | Se calcula el máximo real contra la base de datos |
| 11 | Recibos nuevos no mostraban el carnet en el buscador de reportes | El evento en tiempo real ahora trae el perfil |
| 12 | "Bs. Bs." duplicado en la factura; gráfico titulado "por mes" que mostraba ventas sueltas | Corregidos; el gráfico agrupa por día |
| 13 | HTML del recibo con datos sin escapar (nombre de producto/cliente podía inyectar HTML) | `escapeHtml` en todos los campos |
| 14 | El filtro por fechas existía en el código pero no tenía interfaz | Selector de fecha "Desde / Hasta" en reportes |
| 15 | El tema nunca cambiaba (faltaba el proveedor) | `ThemeProvider` real + botón ☀️/🌙 + recuerda la preferencia |

## Seguridad

- URL y clave de Supabase en `.env` (no en el código); `.env` está en `.gitignore`.
- `supabase/setup.sql`: RLS en `profiles`, `products` y `transactions`; el rol **nunca** viene de la app (trigger en el servidor); solo el admin modifica productos y sube imágenes.
- Rutas protegidas con `Stack.Protected`: sin sesión no se accede a las pestañas.

## Calidad de código

- Estado global tipado (`Profile`, `Product`, `Transaction`) en lugar de `any`.
- Mensajes de error claros en español (`utils/errores.ts`).
- Funciones de formato reutilizables (`utils/formato.ts`).
- Validaciones de formularios (correo, carnet, precios, cantidades) y bloqueo de doble toque en compras y guardado.
- Eliminados archivos de la plantilla que no se usaban (modal, parallax, hello-wave, etc.) y `console.log` de depuración.
- README con arquitectura, diagrama entidad-relación y guía de instalación.
