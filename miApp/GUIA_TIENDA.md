# Sistema de Tienda de Barrio - Guía de Uso

## 📱 Estructura de la Aplicación

### Flujo de Autenticación

La aplicación comienza en una pantalla de selección de usuario:

1. **Seleccionar Rol** (`select-role.tsx`)
   - Cliente: Para usuarios finales
   - Administrador: Para gestión de la tienda

2. **Pantalla de Login** (`login-user.tsx` o `login-admin.tsx`)
   - Email
   - Contraseña
   - Puedes usar cualquier email/password válido (es una demostración)

### Pantallas Principales (después del login)

Los tres tabs están disponibles para ambos roles:

1. **Inicio** - Página principal
2. **Explorar** - Catálogo o funcionalidades
3. **Ganancias** - Reportes o estadísticas

Cada pantalla incluye:
- **Header personalizado** con nombre del usuario
- **Botón Salir** para cerrar sesión

## 🛠️ Estructura de Archivos

### Contexto
```
context/
└── AuthContext.tsx        # Gestiona estado de autenticación
```

### Pantallas de Autenticación
```
app/auth/
├── _layout.tsx           # Navigation layout para auth
├── select-role.tsx       # Seleccionar tipo de usuario
├── login-user.tsx        # Login para clientes
└── login-admin.tsx       # Login para administradores
```

### Pantallas Principales
```
app/(tabs)/
├── _layout.tsx           # Navigation layout para tabs
├── index.tsx            # Inicio
├── explorar.tsx         # Explorar
└── ganancias.tsx        # Ganancias
```

### Componentes
```
components/
└── tab-header.tsx       # Header con logout para cada tab
```

## 🔐 Sistema de Autenticación

### Contexto (AuthContext)
- **useAuth()**: Hook para acceder al contexto
- **login(email, password, role)**: Inicia sesión
- **logout()**: Cierra sesión
- **isSignedIn**: Booleano que indica si está autenticado
- **user**: Datos del usuario actual

### Almacenamiento
- Usa AsyncStorage para persistencia
- Los datos se guardan localmente en el dispositivo

## 📝 Ejemplos de Uso

### Acceder al contexto en un componente:
```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, logout } = useAuth();
  
  return (
    <Text>Hola {user?.name}</Text>
  );
}
```

### Hacer logout:
```typescript
const handleLogout = async () => {
  await logout();
  router.replace('/auth/select-role');
};
```

## 🚀 Próximas Mejoras Sugeridas

1. **Conectar con Backend**: Implementar autenticación real
2. **Validaciones**: Agregar más validaciones en los formularios
3. **Diferencias por Rol**: Mostrar diferentes funcionalidades para usuario/admin
4. **Base de Datos**: Integrar Firestore o similar
5. **Notificaciones**: Agregar push notifications

## ⚙️ Dependencias Instaladas

- `@react-native-async-storage/async-storage`: Para almacenamiento local
