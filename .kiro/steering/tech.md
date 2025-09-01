# Technology Stack

## Core Technologies
- **TypeScript**: Strict typing enabled, ES2020 target
- **React**: 18+ with hooks pattern (useState, useEffect, useMemo, useCallback)
- **Framer**: Native integration with property controls and ControlType system
- **Recharts**: Primary charting library for data visualization

## Key Dependencies
- **framer-motion**: Animation and motion effects
- **openai**: AI-powered data analysis capabilities
- **recharts**: Chart components (ResponsiveContainer, LineChart, BarChart, etc.)

## Development Workflow

### Testing & Development
- Components are **copied directly into Framer** for testing and usage
- No build process required - Framer handles TypeScript compilation
- Development happens by editing components and testing in Framer's canvas
- Use Framer's built-in error reporting and console for debugging

### TypeScript Configuration
- **Module System**: ES modules (`"type": "module"`)
- **JSX**: React JSX transform
- **Strict Mode**: Enabled with consistent casing enforcement
- **Target**: ES2020 with DOM libraries
- **File Extensions**: Framer only supports `.tsx` files - all TypeScript files must use `.tsx` extension

## Architecture Patterns

### Component Structure
- Export default function components with TypeScript interfaces
- Use `addPropertyControls` from Framer for UI configuration
- Implement proper prop destructuring with defaults
- Follow React hooks best practices (useState, useEffect, useMemo, useCallback)
- **Single File Architecture**: Include all utilities, types, and helper functions within the main component file
- **CRITICAL**: Every Framer component MUST end with `export default ComponentName` - this is required for Framer's build system

### Data Flow
- Google Sheets API integration with both public CSV and private API access
- Custom CSV parsing for public sheets
- Automatic data type detection (numeric, date, categorical)
- Intelligent chart type suggestion based on data structure

### Error Handling
- Graceful fallbacks for API failures
- Loading states and retry functionality
- Clear error messages for users
- Data validation before visualization

## Code Style Conventions
- Use TypeScript interfaces for all prop definitions
- Implement proper error boundaries and loading states
- Follow React functional component patterns
- Use descriptive variable names and clear function signatures
- **Self-Contained Components**: All utilities and helper functions must be included within the component file
- **No External Imports**: Components should not import from other component files (React and Framer imports are allowed)

## Framer-Specific Requirements

### Export Requirements
- **MANDATORY**: Every component file must end with `export default ComponentName`
- **Build Errors**: Missing default export causes `[MISSING_EXPORT] Error: "default" is not exported` 
- **Component Function**: Define component as `function ComponentName(props) { ... }`
- **Property Controls**: Add `addPropertyControls(ComponentName, { ... })` after component definition
- **Final Export**: Always end file with `export default ComponentName`

### Common Export Patterns
```typescript
// ✅ CORRECT - This works in Framer
function MyComponent(props) {
  return <div>Content</div>
}

addPropertyControls(MyComponent, {
  // property controls here
})

export default MyComponent

// ❌ WRONG - This causes build errors
export function MyComponent(props) {
  return <div>Content</div>
}
// Missing: export default MyComponent
```