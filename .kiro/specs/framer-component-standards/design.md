# Framer Component Standards - Design Document

## Overview

This design establishes a comprehensive framework for creating Framer-compatible React components that build successfully and provide consistent developer experience. The design addresses the critical export requirements, file structure standards, and common pitfalls that cause build failures.

## Architecture

### Component Structure Pattern

```
Component File Structure:
┌─────────────────────────────────────┐
│ 1. Imports (React, Framer, external)│
├─────────────────────────────────────┤
│ 2. TypeScript Interfaces           │
├─────────────────────────────────────┤
│ 3. Helper Functions & Utilities     │
├─────────────────────────────────────┤
│ 4. Component Function (named)       │
├─────────────────────────────────────┤
│ 5. Property Controls Configuration  │
├─────────────────────────────────────┤
│ 6. Default Export (MANDATORY)       │
└─────────────────────────────────────┘
```

### Export System Design

The export system follows a strict pattern to ensure Framer compatibility:

1. **Named Function Declaration**: Components use `function ComponentName()` syntax
2. **Property Controls**: Added via `addPropertyControls(ComponentName, {...})`
3. **Default Export**: Final line must be `export default ComponentName`

## Components and Interfaces

### Core Component Template

```typescript
// Template structure for all Framer components
import React from "react"
import { addPropertyControls, ControlType } from "framer"

// Props interface
interface ComponentNameProps {
  // prop definitions
}

// Helper functions (if needed)
const helperFunction = () => {
  // utility logic
}

// Main component function
function ComponentName(props: ComponentNameProps) {
  // component logic
  return <div>Component JSX</div>
}

// Property controls
addPropertyControls(ComponentName, {
  // control definitions
})

// MANDATORY: Default export
export default ComponentName
```

### Build System Integration

The design ensures compatibility with Framer's build system:

- **Module Resolution**: Framer expects default exports for component loading
- **Property Controls**: Must reference the named function for proper binding
- **Error Handling**: Missing exports trigger specific error messages that guide developers

## Data Models

### Component Metadata

```typescript
interface ComponentMetadata {
  name: string
  hasDefaultExport: boolean
  hasPropertyControls: boolean
  isFramerCompatible: boolean
  exportPattern: 'correct' | 'missing_default' | 'wrong_syntax'
}
```

### Build Validation

```typescript
interface BuildValidation {
  componentName: string
  exportStatus: 'valid' | 'invalid'
  errorType?: 'missing_export' | 'wrong_function_type' | 'missing_controls'
  suggestions: string[]
}
```

## Error Handling

### Common Error Patterns

1. **Missing Default Export**
   - Error: `[MISSING_EXPORT] Error: "default" is not exported`
   - Solution: Add `export default ComponentName`

2. **Wrong Export Syntax**
   - Error: Component not found in Framer
   - Solution: Use named function, not arrow function export

3. **Property Controls Mismatch**
   - Error: Controls not appearing in Framer
   - Solution: Ensure `addPropertyControls` references correct function name

### Error Prevention Strategy

- **Template Enforcement**: Provide standard templates
- **Linting Rules**: Custom ESLint rules for Framer patterns
- **Build Validation**: Pre-deployment checks for export patterns
- **Documentation**: Clear examples of correct vs incorrect patterns

## Testing Strategy

### Component Validation Tests

1. **Export Structure Tests**
   - Verify default export exists
   - Validate function naming
   - Check property controls binding

2. **Build Integration Tests**
   - Test component loading in Framer environment
   - Validate property controls functionality
   - Ensure no build errors

3. **Template Compliance Tests**
   - Verify components follow standard structure
   - Check for self-contained architecture
   - Validate TypeScript interfaces

### Automated Validation

```typescript
// Example validation function
function validateFramerComponent(componentCode: string): BuildValidation {
  const hasDefaultExport = /export default \w+/.test(componentCode)
  const hasNamedFunction = /function \w+\(/.test(componentCode)
  const hasPropertyControls = /addPropertyControls\(/.test(componentCode)
  
  return {
    componentName: extractComponentName(componentCode),
    exportStatus: hasDefaultExport && hasNamedFunction ? 'valid' : 'invalid',
    errorType: !hasDefaultExport ? 'missing_export' : undefined,
    suggestions: generateSuggestions(componentCode)
  }
}
```

## Implementation Guidelines

### Development Workflow

1. **Component Creation**
   - Start with approved template
   - Follow naming conventions
   - Implement required structure

2. **Property Controls**
   - Define after component function
   - Reference named function correctly
   - Include comprehensive controls

3. **Export Validation**
   - Always end with default export
   - Use named functions for better debugging
   - Validate before committing

### Quality Assurance

- **Code Review Checklist**: Verify export patterns
- **Automated Testing**: Build validation in CI/CD
- **Documentation Updates**: Keep examples current
- **Template Maintenance**: Update templates with best practices

This design ensures that all Framer components follow consistent patterns, build successfully, and provide reliable functionality for end users.