# Common Fixes and Technical Issues

This document contains solutions to common problems encountered during development and maintenance of Framer components.

## Export Conflicts in Framer Components

### Problem: "A module cannot have multiple default exports"

This TypeScript error occurs when a component has conflicting export statements. Framer requires a specific export pattern.

### Root Causes:
1. **Multiple default exports**: Having both `export default function ComponentName()` and `export default ComponentName`
2. **Mixed export patterns**: Combining named exports with default exports incorrectly
3. **IDE autofix conflicts**: Sometimes IDE autofix can create duplicate exports

### Solution Pattern:
```typescript
// ✅ CORRECT - Single default export as function declaration
export default function ComponentName(props: ComponentProps) {
  // Component implementation
}

// ✅ CORRECT - Property controls after component
addPropertyControls(ComponentName, {
  // controls here
})

// ✅ CORRECT - Display name (optional)
ComponentName.displayName = "ComponentName"

// ❌ WRONG - Don't add these:
// export { ComponentName }           // Named export conflict
// export default ComponentName       // Duplicate default export
```

### Recent Fix Applied:
**DynamicGraph Component (2025-01-29)**
- **Issue**: Had both `export default function DynamicGraph()` and `export default DynamicGraph`
- **Fix**: Removed duplicate `export default DynamicGraph` statement
- **Fix**: Removed conflicting `export { DynamicGraph }` named export
- **Result**: Clean single default export, component works in Framer

## Component Layout Simplification

### DynamicGraph Layout Changes (2025-01-29)

**Problem**: Component had complex left/right pane layout with transaction boxes that users wanted removed.

**Changes Made**:
1. **Removed transaction box functionality**:
   - Removed `TransactionBoxData` interface
   - Removed `transactionBoxes`, `leftPaneWidth`, `variant` props
   - Removed `transactionTextStyles` configuration
   - Removed `renderTransactionBoxes()` function
   - Removed transaction box computation logic

2. **Simplified layout structure**:
   - Removed desktop/mobile variant switching
   - Removed left pane / right pane split layout
   - Chart now takes full available width and height
   - Maintained header (title, subtitle, chart type buttons)
   - Maintained footer (refresh status)

3. **Cleaned property controls**:
   - Removed Framer controls for removed features
   - Kept essential chart configuration options
   - Simplified property panel in Framer

**Result**: Clean, focused chart component without transaction boxes, better performance, simpler codebase.

## Best Practices for Framer Components

### Export Structure
- Always use `export default function ComponentName()` pattern
- Never mix named exports with default exports for the main component
- Add property controls after component definition
- Avoid duplicate export statements

### Layout Simplification
- Remove unused features to reduce complexity
- Focus on core functionality
- Maintain clean property controls
- Test component after major changes

### TypeScript Compliance
- Ensure single default export per component
- Use proper interface definitions
- Maintain type safety throughout changes
- Verify component compiles without errors

## Troubleshooting Checklist

When encountering export errors:
1. ✅ Check for multiple `export default` statements
2. ✅ Look for conflicting named exports
3. ✅ Verify proper function declaration syntax
4. ✅ Ensure property controls are added correctly
5. ✅ Test component in Framer after changes

When simplifying component layouts:
1. ✅ Remove unused interfaces and types
2. ✅ Clean up property controls
3. ✅ Update default props
4. ✅ Test core functionality still works
5. ✅ Verify responsive behavior