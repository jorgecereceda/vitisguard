# Historia de Usuario

## ID
US-002

## Título
Dashboard Integral de Monitoreo y Alerta Temprana

## Descripción
**Como** Viticultor de Txakoli
**Quiero** visualizar un panel con datos de temperatura, humedad (suelo/aire), precipitaciones, evapotranspiración, nubes, heladas y golpes de calor
**Para** recibir alertas automáticas de riesgo de enfermedades como el Mildiú o la Botrytis, riego, o condiciones adversas y tomar medidas preventivas que protejan mi cosecha.

## Criterios de Aceptación

### Escenario 1: Visualización de métricas críticas
```gherkin
Dado que el usuario ha iniciado sesión
Cuando carga la vista principal (Dashboard)
Entonces debe ver tarjetas con datos en tiempo real de:
  - Temperatura y Humedad Ambiental 
  - Temperatura y Humedad del Suelo 
  - Evapotranspiración 
  - Precipitación y Cobertura de Nubes 
  - Horas de sol y detección de Heladas Fuertes o Golpes de Calor 
Y los datos deben provenir de la API de Open-Meteo, el sistema debe dejar de mostrar el estado de carga inicial gestionado por <Suspense />.
```

### Escenario 2: Activación de alertas por condiciones meteorológicas y riesgo de enfermedad
```gherkin
Dado que se reciben de la API datos meteorológicos como temperatura y humedad del suelo, temperatura y humedad ambiental, evapotranspiración, precipitación, cobertura de nubes, horas de sol o heladas tempranas, y que estos cumplen condiciones de riesgo para enfermedades fúngicas (ej. alta humedad y temperaturas moderadas)
Cuando el sistema procesa los parámetros recibidos
Entonces se debe mostrar una alerta visual indicando "Riesgo de Enfermedad detectado" y/o "Riesgo por Condiciones Meteorológicas Adversas", especificando el tipo de riesgo identificado (Mildiú, Botrytis, Oídio o Excoriosis) y proporcionando una recomendación específica (ej. aumentar la aireación en espalderas o ajustar el riego)
```

### Escenario 3: Activación de Alertas por condiciones meteorológicas adversas
```gherkin
Dado que los datos de la API detectan riesgos como heladas tempranas, tormentas o calor extremo
Cuando el componente procesa los datos
Entonces se muestra la alerta: "Riesgo por condiciones meteorológicas adversas" y se especifica el fenómeno detectado (ej. Helada inminente o exceso de pluviosidad) y se ofrece una recomendación específica (ej. cubrir lote, activar drenaje preventivo o regar para refrescar)
```

## Notas
* **Lógica de Alerta:** Las alertas por enfermedad deben activarse especialmente en "años con datos historicos muy humedos".
* **Requerimiento Técnico:** Se utilizarán las etiquetas `<suspense/>` para gestionar la espera de datos asíncronos de la API.
* **Responsive:** El Dashboard debe adaptarse a dispositivos móviles, tablets y escritorio.
**API Fuente:** Se utilizará https://open-meteo.com/en/docs.
**Reactividad:** Es obligatorio el uso de ref y reactive para la actualización automática de los datos.
**Estilo:** Se debe aplicar la metodología BEM para el diseño de las tarjetas de datos.

## Estimación
L (Talla Grande).

## Prioridad
Alta.

## Tareas
| Código | Nombre | Responsable |
|--------|--------|-------------|
| **TK-003-01** | Configuración de la conexión asíncrona a la API Open-Meteo en `services/` | Equipo Dev |
| **TK-002-02** | Implementación de peticiones a Open-Meteo para métricas de suelo y aire| Equipo Dev |
| **TK-003-03** | Creación del Composable `useWeather.ts` para gestionar la lógica de fetching | Equipo Dev |
| **TK-003-04** | Diseño de componentes atómicos (`DataCard`) siguiendo Atomic Design | Equipo Dev |
| **TK-002-05** | Desarrollo de la lógica de negocio para detectar umbrales de Mildiú y Botrytis | Equipo Dev |
| **TK-002-06** | Sistema de recomendaciones dinámicas basadas en el estado del cultivo | Equipo Dev |
| **TK-003-07** | Implementación de la vista `DashboardView.vue` con soporte para `<Suspense />` | Equipo Dev |
