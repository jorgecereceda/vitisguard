# Historia de Usuario

## ID
US-004

## Título
Registrar historial de alertas

## Descripción
**Como** sistema
**Quiero** registrar las posibles alertas de enfermedades, riesgo climatico y riego, de hace un año (como ya se generan en el modulo de alertas) que se hubieran podido generar un año atras usando los datos historicos de la API open-meteo.
**Para** Tener una estimacion estadistica de como pueden ser el año actual, el mes o el dia actual.

## Criterios de Aceptación

### Escenario 1: Listar historial de alertas
```gherkin
Dado que el usuario se encuentra en la sección "Historial de alertas"
Cuando se cargue el componente
Entonces el sistema debe listar el historial de alertas mediante una petición GET.
```

### Escenario 2: Sino existen alertas registradas
```gherkin
Dado que no existan hisotrial de alertas registradas
Cuando se cargue el componente
Entonces el sistema debe mostrar que no hay datos para mostrar.
```

### Escenario 3: Registro de una nueva alerta
```gherkin
Dado que el sistema genera una alerta por enfermedad, riesgo climatico, o riego (en el modulo alertas)
Cuando se detecta
Entonces el sistema debe guardar los datos en el servidor (Json-Server) mediante una petición POST Y la nueva alerta debe aparecer inmediatamente en la lista de alertas.
```

### Escenario 4: Estadisticas del historial de alertas
```gherkin
Dado que el usuario se encuentra en la sección "Historial de alertas"
Cuando carga el componente
Entonces el sistema debe mostrar datos estadisticos historicos en tarjetas como olas de calor pasadas, heladas pasadas, sequias pasadas, lluvias pasadas. riesgo de enfermedad pasados para ciertas fechas.
```

## Notas
**Backend:** Se requiere tener activo el json-server --watch db.json.

## Estimación
L (Talla Grande).

## Prioridad
Alta (Requisito obligatorio de gestión de datos propios).

## Tareas
| Código | Nombre | Responsable |
|--------|--------|-------------|
| **TK-003-01** | Configuración del archivo `db.json` con la estructura inicial del historial de alertas pasadas | Equipo Dev |
| **TK-003-02** | Implementación del servicio de API para CRUD (Get, Post, Delete) | Equipo Dev |
| **TK-003-03** | Creación de los componentes para mostrar las estadisticas historicas en tarjetas basado en atomic design | Equipo Dev |
| **TK-003-04** | Creación de los componentes para listar el historial de alertas en tarjetas basado en atomic design | Equipo Dev |
| **TK-003-05** | Desarrollo de la vista `AlertHistoryView.vue` para listar y consultar historial de alertas | Equipo Dev |