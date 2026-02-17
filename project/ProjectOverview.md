# Project Overview - VitisGuard - Sistema de Alerta Temprana para Hondarrabi Zuri

## 1. Visión del Proyecto
VitisGuard es una Single Page Application (SPA) diseñada para optimizar el control en el cultivo de la uva Hondarrabi Zuri en las tres denominaciones de origen de Txakoli (Getaria, Bizkaia, Araba). La aplicación consume datos meteorológicos en tiempo real de una API para ofrecer un sistema de alerta temprana sobre riesgos de enfermedades fúngicas y recomendaciones de riego inteligente, o medidas preventivas para mantener el cultivo frente a cambios metereologicos. Panel de control que cruza datos de temperatura, precipitación, rayos uv, nubes y humedad para predecir condiciones de riesgo y prevencion y gestionar el cultivo de forma eficiente.

## 2. Especificaciones Técnicas (Stack Tecnológico)
Siguiendo los requerimientos del documento guía, el proyecto se construirá con:

- **Frontend:** Vue 3 con Vite y Composition API.
- **Gestión de Estado:** Pinia (para datos meteorológicos compartidos).
- **Enrutado:** Vue Router para vistas
- **Comunicación:**
  - **APIs Externas:** Fetch/Axios para datos meteorológicos reales.
  - **Backend Simulado:** JSON-Server para la gestión de un CRUD de alertas personalizadas por el usuario.
- **Calidad de Código:** Testing con Jest/Cypress (mínimo 5 tests).
- **Diseño:** Mobile-first, responsive (2 breakpoints) y prototipado en Figma.

## 3. Arquitectura de Datos y Componentes
Se aplicará la filosofía de Atomic Web Design y Modularización.

### Funcionalidades Core:
- **Dashboard Meteorológico:** Visualización de temperatura y humedad mediante componentes reactivos (ref, reactive).
- **Sistema de Alertas:** Lógica para mostrar riesgos de Mildiú o Botrytis según umbrales térmicos.
- **Gestión de Parcelas (CRUD):** El viticultor podrá añadir, editar y eliminar registros de sus propias parcelas usando el servidor local.
- **Asincronía:** Uso de <Suspense /> para gestionar la carga de datos de la API.

## 4. Organización del Equipo (Metodología Agile)
- **Framework:** SCRUM con sprints de 2 semanas.
- **Roles:** 1 Scrum Master, 1 product owner y 2 Developers (equipo autónomo de 4).
- **Ceremonias:** 
  - Daily cada 2 días con el Product Owner.
  - Sprint Review final con demo técnica y funcional (45 min).
- **Herramientas:** Jira/Trello para el tablero Kanban y GitHub para control de versiones (flujo de ramas main, developer, feature).

## 5. Criterios de Éxito y Calidad
- **Naming:** Todo el código (variables, funciones, comentarios) estrictamente en inglés.
- **Accesibilidad:** Cumplimiento de estándares de legibilidad y diseño UX/UI.
- **Despliegue:** Build de producción alojado en Netlify o similar.
- **Documentación de IA:** Registro del uso de agentes de IA en el proceso de desarrollo.