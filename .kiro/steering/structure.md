# Project Structure

## Directory Organization

```
/
├── components/          # Main Framer components
├── examples/           # Demo components and usage examples
├── tests/              # Test files (unit, integration, performance, Framer)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── .github/            # GitHub workflows and templates
├── .kiro/              # Kiro AI assistant configuration
└── .vscode/            # VS Code settings
```

## Component Architecture

### `/components/`
Primary Framer components that can be used directly in Framer projects:

- **DynamicGraph.tsx**: Main chart component with Google Sheets integration (full-width chart layout, transaction boxes removed)
- **FeatureCard.tsx**: Reusable feature display card
- **ContactCard.tsx**: Contact information display component
- **Accordion.tsx**: Collapsible content sections
- **HoverImageSection.tsx**: Interactive image hover effects
- **GoogleSheetsSetup.tsx**: Configuration helper component
- **authentication.tsx**: Authentication utilities

### `/examples/`
Demo implementations showing component usage:

- **DynamicGraphDemo.tsx**: Demonstrates chart component features
- **FeatureCardDemo.tsx**: Shows feature card variations
- **AccordionDemo.tsx**: Accordion component examples

### `/types/`
TypeScript definitions:

- **framer.d.ts**: Framer-specific type definitions and property controls

### `/tests/`
Test files organized by component and test type:

- **ComponentName.test.tsx**: Unit tests for individual components
- **ComponentName.integration.test.tsx**: Integration tests for complex scenarios
- **ComponentName.performance.test.tsx**: Performance benchmarks and optimization tests
- **ComponentName.framer.test.tsx**: Framer-specific integration tests

### `/utils/`
Shared utility functions:

- **dataUtils.tsx**: Google Sheets API integration and data processing
- **sampleData.tsx**: Sample data generators for testing and demos

## File Naming Conventions

- **Components**: PascalCase with `.tsx` extension (e.g., `DynamicGraph.tsx`)
- **Tests**: PascalCase with test type suffix (e.g., `DynamicGraph.test.tsx`, `DynamicGraph.integration.test.tsx`)
- **Utilities**: PascalCase with `.tsx` extension (e.g., `DataUtils.tsx`) - Framer only supports .tsx files
- **Types**: camelCase with `.d.ts` extension (e.g., `framer.d.ts`)
- **Examples**: PascalCase with `Demo` suffix (e.g., `FeatureCardDemo.tsx`)

## Framer File Extension Requirements

**IMPORTANT**: Framer only supports `.tsx` file extensions. All TypeScript files must use `.tsx` extension, even utility files that don't contain JSX. This is a Framer platform requirement.

## Single File Component Architecture

**CRITICAL**: For Framer components, always use a single file solution:
- **All utilities, types, and helper functions** should be included within the main component file
- **No separate utility files** - everything must be self-contained
- **No imports between component files** - each component should be completely independent
- **Copy-paste ready** - users should be able to copy one file into Framer and have it work immediately

## Component Structure Pattern

Each component follows this structure:
1. **Imports**: React, Framer, and external dependencies
2. **Interfaces**: TypeScript prop definitions
3. **Component Function**: Named function (not arrow function for better debugging)
4. **Property Controls**: Framer property controls configuration
5. **Default Export**: **MANDATORY** - `export default ComponentName`
6. **Styling**: Inline styles or styled components

### Required Export Pattern
```typescript
// 1. Imports
import React from "react"
import { addPropertyControls, ControlType } from "framer"

// 2. Interfaces
interface MyComponentProps {
  title: string
}

// 3. Component Function
function MyComponent(props: MyComponentProps) {
  return <div>{props.title}</div>
}

// 4. Property Controls
addPropertyControls(MyComponent, {
  title: { type: ControlType.String, defaultValue: "Hello" }
})

// 5. Default Export - CRITICAL FOR FRAMER
export default MyComponent
```

## Key Architectural Principles

- **Single File Solution**: Each Framer component should be completely self-contained in one .tsx file
- **Integrated Utilities**: All helper functions, types, and utilities should be included within the main component file
- **Type Safety**: Full TypeScript coverage with strict typing
- **Framer Integration**: Native property controls for all configurable options
- **No External Dependencies**: Components should not rely on separate utility files or imports
- **Copy-Paste Ready**: Users should be able to copy a single file into Framer and have it work immediately