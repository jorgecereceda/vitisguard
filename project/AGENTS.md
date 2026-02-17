# AGENTS.md - Instructions for AI Agents Working in This Repository

## Project Overview
This is a Vue.js project following a structured, documentation-driven development approach. The project uses Vite as the build tool and follows specific conventions for code organization, testing, and workflow.

## Essential Commands

### Build and Development
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build locally
npm run preview
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run single test file (example)
npm test math.test.js

# Run tests with coverage
npm test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Lint and fix auto-fixable issues
npm run lint:fix

# Format code
npm run format

# Type checking (if TypeScript)
npm run type-check
```

## Code Style Guidelines

### Naming Conventions
- **Variables/Constants**: `camelCase` (`userCount`). Constants: `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- **Functions/Methods**: `camelCase` (`calculateTotal()`, `getUserById()`)
- **Classes/Components**: `PascalCase` (`UserProfile`, `LoginService`)
- **Files/Folders**: `kebab-case` (`user-service.js`, `components/`)
- **Booleans**: Use prefixes `is`, `has`, `should` (`isLoading`, `hasPermission`)
- **Language**: All code (variables, functions, classes) must be in English

### Import Organization
```javascript
// 1. External libraries (Vue, etc.)
import { ref, computed } from 'vue'
import axios from 'axios'

// 2. Internal utilities and services
import { formatPrice } from '@/lib/utils'
import { apiService } from '@/services/api'

// 3. Components
import UserProfile from '@/components/UserProfile.vue'
```

### File Structure Rules
- **Maximum file size**: 300-400 lines. Split if longer
- **Maximum function size**: 20-30 lines. Single responsibility principle
- **Unit tests**: Co-located with source files (`math.test.js` next to `math.js`)
- **Integration/E2E tests**: In `/tests/` directory at project root

### Code Quality Standards
- **No console.log in production**: Use proper logging system
- **No magic numbers**: Use named constants
- **DRY principle**: Extract duplicated logic into functions
- **Comments**: Explain the "why" (intent/reasoning), not the "what" (obvious code)

## Project Structure
```
proyecto/
├── public/           # Static assets (favicon, robots.txt)
├── src/              # Source code
│   ├── components/   # Independent modules (header.js, modal.js)
│   ├── lib/          # Third-party code or complex utilities
│   ├── services/     # External API logic (api.js)
│   ├── styles/       # Referenced stylesheets
│   ├── main.js       # Application entry point
│   ├── style.css     # Main stylesheet
│   └── index.html    # HTML entry point (processed/build from here)
├── tests/            # E2E and integration tests
│   ├── integration/  # Integration tests
│   ├── e2e/         # End-to-end tests
│   └── fixtures/    # Test data
├── package.json      # Dependencies and scripts
└── vite.config.js   # Vite configuration
```

## Testing Strategy

### Unit Tests
- **Location**: Same folder as the module being tested
- **Naming**: `<module-name>.test.js` (e.g., `calculator.test.js`)
- **Framework**: Follow existing patterns in the codebase

### Integration/E2E Tests
- **Location**: `/tests/integration/` and `/tests/e2e/`
- **Naming**: Descriptive names (e.g., `checkout.flow.e2e.js`)
- **Purpose**: Validate user stories and acceptance criteria

### Test Execution Workflow
1. Run related E2E tests for each task completion
2. Run full E2E suite when user story is complete
3. All tests must pass before considering work done

## Development Workflow

### User Story Process
1. **Analysis**: Read user story and acceptance criteria in `/stories/`
2. **Decomposition**: Break into logical tasks (human-defined)
3. **Task Cycle**:
   - Analyze task requirements
   - Design code and tests approach
   - Validate design with human
   - Implement following `coding_style.md`
   - Create co-located unit tests
   - Create integration tests in `/tests/integration/`
   - Run task-related E2E tests
   - Get human validation

### Validation Requirements
- Single task: Run related E2E tests only
- Complete user story: Run full E2E suite
- No task is "Done" until tests pass

## Performance and Compatibility

### Browser Support
- Chrome 90+, Firefox 88+, Safari 14+
- No Internet Explorer support

### Performance Targets
- Load time: < 3 seconds on 3G connection
- Bundle size: < 500KB initial, < 2MB total

## Security Guidelines
- Dependencies: Only packages with monthly security audits
- No logging of PII (emails, documents)
- Follow secure coding practices

## Documentation Standards
- **Format**: Markdown with practical examples
- **Language**: Documentation in Spanish (as per existing files)
- **Code**: English only (variables, functions, comments)
- **Decisions**: Justified with reference to requirements

## Critical Restrictions
- Do not read/modify files outside project directory
- Do not modify environment variables without consultation
- Do not change file structure without approval
- Do not introduce unapproved dependencies
- Do not skip defined testing processes
- Do not create over-engineered solutions

## Error Handling
- Use consistent error handling patterns
- Provide meaningful error messages
- Log errors appropriately (no PII)
- Handle edge cases gracefully

## When in Doubt
1. **Ask first**: Don't assume, ask for clarification
2. **Document decisions**: Explain reasoning
3. **Suggest improvements**: Propose updating instructions
4. **Follow hierarchy**: instructions.md > specific instructions > best practices

## Commit and Deployment
- **Build**: `npm run build` creates `/dist/` folder
- **Preview**: `npm run preview` for local verification
- **Deploy**: Only `/dist/` content, never source files
- **Commits**: Only when explicitly requested by human

This file serves as the primary reference for AI agents working in this repository. Always consult these guidelines first, then refer to specific instruction files in `/instructions/` for detailed guidance on particular areas.