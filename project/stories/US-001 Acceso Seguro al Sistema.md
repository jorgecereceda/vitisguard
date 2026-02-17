# Historia de Usuario

## ID
US-001

## Título
Acceso Seguro al Sistema (Login) y Registro de Usuario

## Descripción
**Como** Viticultor interesado en proteger mi cultivo de Hondarrabi Zuri
**Quiero** poder registrarme y autenticarme en la plataforma
**Para** acceder de manera privada a las métricas de mis parcelas y recibir alertas personalizadas

## Criterios de Aceptación

### Escenario 1: Registro de nuevo usuario
```gherkin
Dado que el viticultor no tiene una cuenta
Cuando introduce su nombre, email y una contraseña segura en el formulario de registro
Entonces sus datos se almacenan en el sistema (Json-Server) 
Y se le redirige automáticamente a la pantalla de Login.
```

### Escenario 2: Inicio de sesión exitoso
```gherkin
Dado que el usuario ya está registrado
Cuando introduce sus credenciales correctas
Entonces el sistema valida los datos contra el servidor 
Y lo redirige al Dashboard principal de VitisGuard.
```

### Escenario 3: Inicio de sesión Falla
```gherkin
Dado que el usuario intenta loguearse
Cuando deja campos vacíos o introduce un formato de email incorrecto
Entonces el sistema muestra mensajes de error en inglés (ej: "Email is required", contraseña incorrecta, usuario no existe...)
```

## Notas
* Se utilizará Pinia para gestionar el estado global de la sesión del usuario (`isLoggedIn`, `userData`)
* Las contraseñas en el servidor fake (`db.json`) deben manejarse siguiendo las buenas prácticas de seguridad mencionadas en el proyecto.
* los datos a registrar son: name, email, password

## Estimación
M (Talla Media)

## Prioridad
Alta (Bloqueante para el resto de funcionalidades)

## Tareas
| Código | Nombre | Responsable |
|--------|--------|-------------|
| TK-001-01 | Diseño de la interfaz de Login/Registro en Figma (Responsive) | Equipo Dev |
| TK-001-02 | Implementación de los formularios con validaciones en Vue 3 | Equipo Dev |
| TK-001-03 | Creación del Store de autenticación con Pinia | Equipo Dev |
| TK-001-04 | Servicio de conexión con Json-Server para persistencia de usuarios | Equipo Dev |
| TK-001-05 | Sincronizar pinia con LocalStorage para la persistencia de datos y sessison | Equipo Dev |