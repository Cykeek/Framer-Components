# Design Document

## Overview

The ReactBitsGridDistortion component will be a new Framer-compatible component that implements the specific visual effects and interaction patterns inspired by the ReactBits grid distortion example. This component will use WebGL shaders to create smooth, organic distortion effects that respond to mouse movement, while maintaining the single-file architecture required for Framer integration.

The design focuses on creating a more sophisticated distortion algorithm compared to the existing GridDistortion component, with emphasis on fluid, natural-looking deformations that create an engaging interactive experience.

## Architecture

### Component Structure
```
ReactBitsGridDistortion
├── React Component (TypeScript)
├── WebGL Context Management
├── Shader Programs (Vertex + Fragment)
├── Texture Management
├── Mouse Interaction System
├── Animation Loop (RAF)
└── Framer Property Controls
```

### Core Technologies
- **WebGL**: Hardware-accelerated rendering for smooth 60fps performance
- **GLSL Shaders**: Custom vertex and fragment shaders for distortion effects
- **React Hooks**: useState, useEffect, useRef for component lifecycle
- **Framer Integration**: Native property controls and single-file architecture
- **TypeScript**: Full type safety and developer experience

## Components and Interfaces

### Main Component Interface
```typescript
export interface ReactBitsGridDistortionProps {
  // Image Properties
  imageSrc?: string
  imageOpacity?: number
  
  // Distortion Properties
  distortionType?: "fluid" | "magnetic" | "ripple" | "vortex"
  intensity?: number
  radius?: number
  falloff?: number
  
  // Grid Properties
  gridSize?: number
  gridOpacity?: number
  gridColor?: string
  gridThickness?: number
  showGrid?: boolean
  
  // Animation Properties
  mouseEasing?: number
  autoAnimation?: boolean
  animationSpeed?: number
  
  // Visual Properties
  backgroundColor?: string
  blendMode?: "normal" | "multiply" | "screen" | "overlay"
  
  // Performance
  quality?: "low" | "medium" | "high"
  
  // Accessibility
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}
```

### WebGL Shader System
```typescript
interface ShaderProgram {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation>
  attributes: Record<string, number>
}

interface DistortionUniforms {
  uTexture: WebGLUniformLocation
  uResolution: WebGLUniformLocation
  uMouse: WebGLUniformLocation
  uTime: WebGLUniformLocation
  uIntensity: WebGLUniformLocation
  uRadius: WebGLUniformLocation
  uFalloff: WebGLUniformLocation
  uDistortionType: WebGLUniformLocation
  uGridSize: WebGLUniformLocation
  uGridOpacity: WebGLUniformLocation
  uGridColor: WebGLUniformLocation
}
```

### Mouse Interaction System
```typescript
interface MouseState {
  current: { x: number; y: number }
  target: { x: number; y: number }
  velocity: { x: number; y: number }
  isActive: boolean
  lastMoveTime: number
}
```

## Data Models

### Distortion Algorithms

#### Fluid Distortion
- **Algorithm**: Smooth displacement mapping using Perlin noise-like functions
- **Characteristics**: Organic, flowing deformations that feel natural
- **Implementation**: Multi-octave noise with time-based evolution
- **Parameters**: Intensity (0-1), Radius (0-1), Falloff curve

#### Magnetic Distortion  
- **Algorithm**: Radial attraction/repulsion with non-linear falloff
- **Characteristics**: Strong center pull with smooth edges
- **Implementation**: Distance-based displacement with exponential falloff
- **Parameters**: Magnetic strength, Attraction/repulsion mode

#### Ripple Distortion
- **Algorithm**: Concentric wave propagation from mouse position
- **Characteristics**: Water-like ripple effects with temporal decay
- **Implementation**: Sine wave displacement with distance and time factors
- **Parameters**: Wave frequency, Amplitude, Decay rate

#### Vortex Distortion
- **Algorithm**: Rotational displacement around mouse position
- **Characteristics**: Swirling, spiral-like deformations
- **Implementation**: Angular displacement with radial falloff
- **Parameters**: Rotation strength, Spiral tightness

### Grid Rendering System
```glsl
// Grid calculation in fragment shader
float calculateGrid(vec2 uv, float size, float thickness) {
  vec2 grid = abs(fract(uv * size) - 0.5);
  return smoothstep(0.0, thickness, min(grid.x, grid.y));
}
```

### Performance Optimization
- **Quality Levels**: Automatic shader complexity adjustment
- **DPR Capping**: Limit device pixel ratio for performance
- **Texture Optimization**: Automatic texture size adjustment
- **RAF Management**: Efficient animation loop with cleanup

## Error Handling

### WebGL Context Management
```typescript
// Context loss recovery
function handleContextLoss(event: Event) {
  event.preventDefault()
  cancelAnimationFrame(animationId)
  // Store current state for recovery
}

function handleContextRestore() {
  // Recreate WebGL resources
  initializeWebGL()
  restoreState()
  resumeAnimation()
}
```

### Graceful Fallbacks
- **No WebGL Support**: Display static image with CSS transforms
- **Image Load Failure**: Show placeholder with grid overlay
- **Shader Compilation Error**: Fall back to simpler shader version
- **Performance Issues**: Automatic quality reduction

### Error Boundaries
```typescript
// Component-level error handling
try {
  initializeWebGL()
} catch (error) {
  console.warn('WebGL initialization failed:', error)
  setFallbackMode(true)
}
```

## Testing Strategy

### Test Organization
All test files are organized in the `/tests` directory to maintain clean separation between component code and test code:

```
tests/
├── ReactBitsGridDistortion.test.tsx              # Unit tests
├── ReactBitsGridDistortion.integration.test.tsx  # Integration tests
├── ReactBitsGridDistortion.performance.test.tsx  # Performance benchmarks
└── ReactBitsGridDistortion.framer.test.tsx       # Framer-specific tests
```

### Unit Testing (`tests/ReactBitsGridDistortion.test.tsx`)
- **Shader Compilation**: Verify all shader variants compile successfully
- **Uniform Binding**: Test all uniform locations are correctly bound
- **Texture Loading**: Validate texture creation and binding
- **Mouse Interaction**: Test coordinate transformation and easing
- **Error Handling**: Test WebGL context loss and recovery
- **Fallback Modes**: Verify CSS fallback when WebGL unavailable

### Integration Testing (`tests/ReactBitsGridDistortion.integration.test.tsx`)
- **Framer Integration**: Verify property controls work correctly
- **Real-time Updates**: Test property changes during runtime
- **Complex Scenarios**: Multiple instances and nested components
- **Browser Compatibility**: Test WebGL support across target browsers
- **Responsive Behavior**: Validate component behavior at different sizes

### Performance Testing (`tests/ReactBitsGridDistortion.performance.test.tsx`)
- **Frame Rate Monitoring**: Measure performance across different quality settings
- **Memory Management**: Test resource cleanup and memory usage
- **Multiple Instances**: Benchmark performance with multiple components
- **Device Adaptation**: Test automatic quality adjustment
- **Interaction Performance**: Measure response time to user input

### Framer Testing (`tests/ReactBitsGridDistortion.framer.test.tsx`)
- **Property Controls**: Verify all Framer controls are properly registered
- **Canvas Environment**: Test behavior in Framer canvas simulation
- **Real-time Property Updates**: Test live property changes in Framer
- **Single-file Architecture**: Verify component is completely self-contained
- **Framer-specific Features**: Test variants, animations, and layout integration

### Visual Testing
- **Distortion Accuracy**: Compare output with reference implementations
- **Grid Rendering**: Verify grid appearance matches specifications
- **Animation Smoothness**: Ensure 60fps performance targets
- **Color Accuracy**: Validate color space handling and blending

### Accessibility Testing
- **Screen Reader**: Verify aria-label and role attributes
- **Keyboard Navigation**: Ensure component doesn't trap focus
- **Motion Sensitivity**: Respect prefers-reduced-motion settings
- **Color Contrast**: Validate grid colors meet accessibility standards

## Implementation Details

### Shader Architecture
The component will use a sophisticated fragment shader that implements multiple distortion algorithms:

```glsl
// Main distortion function
vec2 applyDistortion(vec2 uv, vec2 mouse, float time, int type) {
  switch(type) {
    case 0: return fluidDistortion(uv, mouse, time);
    case 1: return magneticDistortion(uv, mouse, time);
    case 2: return rippleDistortion(uv, mouse, time);
    case 3: return vortexDistortion(uv, mouse, time);
    default: return uv;
  }
}
```

### Mouse Interaction Enhancement
Advanced mouse tracking with velocity and momentum:

```typescript
// Enhanced mouse tracking
function updateMouseState(event: PointerEvent) {
  const now = performance.now()
  const dt = now - mouseState.lastMoveTime
  
  // Calculate velocity
  const dx = event.clientX - mouseState.current.x
  const dy = event.clientY - mouseState.current.y
  
  mouseState.velocity.x = dx / dt
  mouseState.velocity.y = dy / dt
  
  // Apply easing
  mouseState.current.x += (mouseState.target.x - mouseState.current.x) * easing
  mouseState.current.y += (mouseState.target.y - mouseState.current.y) * easing
}
```

### Performance Optimization Strategy
- **Adaptive Quality**: Automatically adjust shader complexity based on performance
- **Texture Streaming**: Load appropriate texture sizes for device capabilities
- **Memory Management**: Efficient cleanup of WebGL resources
- **Frame Rate Monitoring**: Dynamic quality adjustment to maintain 60fps

### Framer Integration
The component will maintain full compatibility with Framer's property control system:

```typescript
addPropertyControls(ReactBitsGridDistortion, {
  imageSrc: {
    type: ControlType.String,
    title: "Image URL",
    placeholder: "Enter image URL..."
  },
  distortionType: {
    type: ControlType.Enum,
    title: "Distortion Type",
    options: ["fluid", "magnetic", "ripple", "vortex"],
    optionTitles: ["Fluid", "Magnetic", "Ripple", "Vortex"]
  },
  intensity: {
    type: ControlType.Number,
    title: "Intensity",
    min: 0,
    max: 1,
    step: 0.01
  }
  // Additional controls...
})
```