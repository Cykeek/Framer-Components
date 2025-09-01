# Test Organization Guidelines

## Test Directory Structure

All test files should be organized in the `/tests` directory, separate from component code. This maintains clean separation and makes it easier to manage test files.

```
tests/
├── ComponentName.test.tsx              # Unit tests
├── ComponentName.integration.test.tsx  # Integration tests
├── ComponentName.performance.test.tsx  # Performance benchmarks
├── ComponentName.framer.test.tsx       # Framer-specific tests
└── ComponentName.e2e.test.tsx          # End-to-end tests (if needed)
```

## Test File Types

### Unit Tests (`*.test.tsx`)
- Test individual functions and component behavior in isolation
- Mock external dependencies and WebGL contexts
- Focus on component rendering, prop handling, and basic interactions
- Test error handling and edge cases

### Integration Tests (`*.integration.test.tsx`)
- Test component behavior in realistic scenarios
- Test interactions between multiple components
- Validate real-time property updates and complex state changes
- Test browser compatibility and responsive behavior

### Performance Tests (`*.performance.test.tsx`)
- Benchmark rendering performance and frame rates
- Test memory usage and resource cleanup
- Validate performance with multiple component instances
- Test adaptive quality systems and performance optimization

### Framer Tests (`*.framer.test.tsx`)
- Test Framer-specific functionality and property controls
- Validate behavior in Framer canvas environment
- Test single-file architecture compatibility
- Verify Framer integration features like variants and animations

## Jest Configuration

Update `jest.config.cjs` to point to the tests directory:

```javascript
testMatch: [
  '<rootDir>/tests/**/*.test.{ts,tsx}',
  '<rootDir>/tests/**/*.spec.{ts,tsx}',
  '<rootDir>/tests/**/*.integration.test.{ts,tsx}',
  '<rootDir>/tests/**/*.framer.test.{ts,tsx}',
  '<rootDir>/tests/**/*.performance.test.{ts,tsx}'
],

collectCoverageFrom: [
  'components/**/*.{ts,tsx}',
  '!components/**/*.d.ts',
  '!tests/**/*.{ts,tsx}' // Exclude test files from coverage
],
```

## Package.json Scripts

Add specific test scripts for different test types:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/.*\\.test\\.(ts|tsx)$",
    "test:integration": "jest --testPathPattern=tests/.*\\.integration\\.test\\.(ts|tsx)$",
    "test:performance": "jest --testPathPattern=tests/.*\\.performance\\.test\\.(ts|tsx)$",
    "test:framer": "jest --testPathPattern=tests/.*\\.framer\\.test\\.(ts|tsx)$",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Import Paths

When importing components in test files, use relative paths from the tests directory:

```typescript
// In tests/ComponentName.test.tsx
import ComponentName from '../components/ComponentName'

// Not from the same directory
import ComponentName from './ComponentName' // ❌ Wrong
```

## Benefits

1. **Clean Separation**: Component code and test code are clearly separated
2. **Better Organization**: Easy to find and manage all test files in one location
3. **Improved Build Performance**: Test files don't interfere with component builds
4. **Clearer Coverage Reports**: Coverage reports focus on actual component code
5. **Easier CI/CD**: Test files can be easily excluded from production builds

## Migration

When moving existing test files:

1. Move all `*.test.tsx` files from `components/` to `tests/`
2. Update import paths in test files to use `../components/`
3. Update Jest configuration to point to new test directory
4. Update package.json test scripts
5. Update any documentation or README files that reference test locations