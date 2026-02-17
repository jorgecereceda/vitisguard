# Historia de Usuario

## ID
HU-003

## Título
Gestión de Parcelas y Alertas Personalizadas (CRUD)

## Descripción
**Como** Viticultor de Txakoli 
**Quiero** ver, registrar, editar y eliminar los datos de mis parcelas (nombre, ubicación y Denominacion de origen.).
**Para**  Tener un control organizado de mis cultivos y recibir alertas específicas según la zona de cada viñedo.

## Criterios de Aceptación

### Escenario 1: Listar las parcelas
```gherkin
Dado que el viticultor se encuentra en la sección "My Vineyards"
Cuando se cargue el componente
Entonces el sistema debe listar las parcelas mediante una petición GET.
```

### Escenario 2: Listar las parcelas
```gherkin
Dado que no existan parcelas registradas
Cuando se cargue el componente
Entonces el sistema debe mostrar que no hay datos para mostrar y un boton para agregar parcelas.
```

### Escenario 3: Registro de una nueva parcela
```gherkin
Dado que el viticultor se encuentra en la sección "My Vineyards"
Cuando completa el formulario con el nombre de la parcela y selecciona su Denominacion de origen (Getaria, Bizkaia o Araba)
Entonces el sistema debe guardar los datos en el servidor (Json-Server) mediante una petición POST Y la nueva parcela debe aparecer inmediatamente en la lista de parcelas.
```

### Escenario 4: Editar una nueva parcela
```gherkin
Dado que el viticultor se encuentra en la sección "My Vineyards"
Cuando seleccione editar una parcela
Entonces el sistema debe guardar los datos en el servidor (Json-Server) mediante una petición PUT Y los cambios en la parcela deben aparecer inmediatamente en la lista de parcelas.
```

### Escenario 5: Eliminación de una parcela existente
```gherkin
Dado que el viticultor tiene parcelas registradas en su panel.
Cuando pulsa el botón "Delete" en una de las parcelas.
Entonces el sistema debe realizar una petición DELETE al servidor y el elemento debe desaparecer de la interfaz sin necesidad de recargar la página.
```

## Notas
**Backend:** Se requiere tener activo el json-server --watch db.json.
**Tecnología:** Uso de v-for para iterar sobre la lista de parcelas y v-model para el formulario.
**Validación:** No se deben permitir nombres de parcelas vacíos.

## Estimación
L (Talla Grande - requiere configuración de CRUD completo).

## Prioridad
Alta (Requisito obligatorio de gestión de datos propios).

## Tareas
| Código | Nombre | Responsable |
|--------|--------|-------------|
| **TK-003-01** | Configuración del archivo `db.json` con la estructura inicial de parcelas | Equipo Dev |
| **TK-003-02** | Implementación del servicio de API para CRUD (Get, Post, Put, Delete) | Equipo Dev |
| **TK-003-03** | Creación del componente de formulario `AddParcelForm.vue` (Molecule) | Equipo Dev |
| **TK-003-04** | Desarrollo de la vista `VineyardsView.vue` para listar y gestionar ítems | Equipo Dev |
