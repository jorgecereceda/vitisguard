# 🌿 VitisGuard

[![Vue](https://img.shields.io/badge/Vue-3-42b883?style=flat&logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646cffa?style=flat&logo=vite)](https://vitejs.dev)
[![Pinia](https://img.shields.io/badge/Pinia-2.0+-ffd859?style=flat)](https://pinia.vuejs.org)
[![Vitest](https://img.shields.io/badge/Vitest-1.0+-6e9f18?style=flat)](https://vitest.dev)
[![Cypress](https://img.shields.io/badge/Cypress-13-17202c?style=flat&logo=cypress)](https://www.cypress.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema de monitorización meteorológica avanzada para viñedos, desarrollado con prácticas ágiles y tecnología de vanguardia.

## 🎓 Proyecto Educacional

[![Bootcamp](https://img.shields.io/badge/Bootcamp-Full%20Stack%20Web-FF6B35?style=flat)](https://)

Este proyecto fue desarrollado como **actividad formativa** en el bootcamp de **Full Stack Web**, demostrando la aplicación práctica de tecnologías modernas de desarrollo frontend.

## 🌟 Equipo de Desarrollo

| Rol | Nombre | GitHub |
|-----|--------|--------|
| Scrum Master | Yoandres La Cruz | [Perfil de GitHub](https://github.com/ylcruzdev) |
| Product Owner | Jorge Cereceda | [Perfil de GitHub](https://github.com/jorgecereceda) |
| Desarrollador | Juan Carlos Gil | [Perfil de GitHub](https://github.com/JuanCarlos0977) |
| Desarrollador | Santiago Patiño | [Perfil de GitHub](https://github.com/SANTPT) |

## 🔧 Metodología de Trabajo

### Metodología Ágil
Este proyecto se desarrolla utilizando **Scrum** como marco de trabajo ágil, fomentando la entrega iterativa y la adaptación continua a las necesidades del producto.

### Pair Programming
Trabajamos en **pair programming**, dos desarrolladores trabajan conjuntamente en el mismo código, compartiendo conocimientos y mejorando la calidad del software.

### Integración con IA: OpenCode
Incorporamos **OpenCode** como asistente de IA para:
- Acelerar el desarrollo de funcionalidades
- Revisar y mejorar código existente
- Automatizar tareas repetitivas
- Mantener altos estándares de calidad

## ✨ Características del Proyecto

- **Monitorización Meteorológica en Tiempo Real**: Datos actualizados de temperatura, humedad, precipitación y más.
- **Detección de Enfermedades**: Sistema predictivo para identificar riesgos de:
  - Mildiú (Plasmopara viticola)
  - Botrytis (Botrytis cinerea)
  - Oídio (Erysiphe necator)
  - Excoriosis (Phomopsis viticola)
- **Recomendaciones de Riego**: Análisis inteligente basado en humedad del suelo y evapotranspiración.
- **Alertas en Tiempo Real**: Notificaciones proactivas sobre condiciones climáticas extremas.
- **Diseño Responsivo**: Interfaz adaptativa para escritorio y dispositivos móviles.

## 🛠️ Tech Stack

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| Vue 3 | Framework progresivo |
| TypeScript | Tipado estático |
| Vite | Build tool ultra-rápido |
| Pinia | Gestión de estado |
| Vue Router | Navegación |
| Atomic Design | Metodología de componentes |

### Testing
| Tecnología | Propósito |
|------------|-----------|
| Vitest | Tests unitarios |
| Cypress | Tests E2E |

### Estándares de Código
- ESLint + Oxlint
- Conventional Commits
- Strict TypeScript

## 📁 Estructura del Proyecto

```
vitisguard/
├── src/
│   ├── assets/          # Imágenes, fuentes y estilos globales
│   ├── components/       # Componentes Vue (Atomic Design)
│   │   ├── atoms/        # Elementos básicos (Botones, Inputs)
│   │   ├── molecules/    # Componentes compuestos (Cards)
│   │   └── organisms/    # Componentes complejos (Headers)
│   ├── composables/      # Lógica reutilizable (Vue Composables)
│   ├── router/          # Configuración de rutas
│   ├── services/        # Integraciones API
│   ├── stores/          # Estado global (Pinia)
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── utils/           # Utilidades y funciones helper
│   ├── views/           # Vistas principales
│   ├── App.vue          # Componente raíz
│   └── main.ts          # Punto de entrada
├── public/              # Archivos estáticos públicos
├── tests/               # Configuraciones de testing
└── package.json        # Dependencias y scripts
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+
- npm 9+

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone <repository-url>

# Navegar al directorio del proyecto
cd vitisguard

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run preview` | Vista previa de producción |
| `npm run build` | Compilar para producción |
| `npm run build-only` | Compilar sin type-check |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Ejecutar todos los linters |
| `npm run lint:oxlint` | Ejecutar Oxlint con auto-fix |
| `npm run lint:eslint` | Ejecutar ESLint con auto-fix |
| `npm run format` | Formatear código con Oxfmt |
| `npm run test:unit` | Ejecutar tests unitarios |
| `npm run test:e2e` | Ejecutar tests E2E |
| `npm run test:e2e:dev` | Ejecutar tests E2E en modo desarrollo |

## 🧪 Ejecutar Tests

```bash
# Tests unitarios
npm run test:unit

# Tests E2E
npm run test:e2e

# Tests E2E en modo desarrollo
npm run test:e2e:dev

# Ejecutar un test específico
npx vitest run src/__tests__/App.spec.ts
```

## 📝 Convenciones de Código

### Nombrado
| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Variables/Constantes | camelCase | `userCount`, `isLoading` |
| Constantes globales | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Funciones/Métodos | camelCase | `calculateTotal()` |
| Componentes Vue | PascalCase | `UserProfile` |
| Archivos | kebab-case | `user-service.ts` |
| Booleanos | `is`/`has`/`should` | `isLoading` |

### Formato
- **Indentación**: 2 espacios
- **Punto y coma**: No
- **Comillas**: Simples
- **Líneas máx.**: 100 caracteres
- **Fin de línea**: LF

## 🔄 Flujo de Trabajo

1. **Crear rama**: `git checkout -b feature/nueva-funcionalidad`
2. **Desarrollar**: Implementar cambios con pair programming
3. **Tests**: Ejecutar `npm run test:unit` y `npm run lint`
4. **Commits**: Usar Conventional Commits
5. **Pull Request**: Revisión por pares antes de merge

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. Fork el repositorio
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commitea tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para detalles.

---

Desarrollado con ❤️ por el equipo VitisGuard © 2026
