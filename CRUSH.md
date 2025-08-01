# WaniKani Generator - Development Guide

## Build/Test Commands
```bash
npm install          # Install dependencies
npm start           # Start development server
npm run build       # Build for production
npm test            # Run all tests
npm test -- --watch # Run tests in watch mode
npm run lint        # Lint code
npm run lint:fix    # Fix linting issues
npm run typecheck   # Type checking (if using TypeScript)
```

## Code Style Guidelines

### Project Structure
- `/src` - Source code
- `/tests` or `/__tests__` - Test files
- `/api` - API related modules
- `/components` - Reusable components (if using framework)

### Naming Conventions
- Files: kebab-case (`wanikani-api.js`, `practice-generator.js`)
- Functions/variables: camelCase (`fetchVocabulary`, `apiKey`)
- Constants: SCREAMING_SNAKE_CASE (`WANIKANI_API_BASE_URL`)
- Classes: PascalCase (`PracticeSessionManager`)

### Code Standards
- Use meaningful variable names (`vocabularyWords` not `data`)
- Handle API errors gracefully with try/catch blocks
- Store sensitive data (API keys) in environment variables (.env)
- Use async/await for API calls instead of callbacks
- Add JSDoc comments for public functions
- Keep functions focused and under 20 lines when possible
- Use TypeScript if possible for better type safety with WaniKani API responses