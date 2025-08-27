import React, { useEffect, useRef, useState, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * ReactBitsGridDistortion Component
 * 
 * A high-performance WebGL-based component that creates interactive grid distortion effects
 * inspired by the ReactBits example. Perfect for creating engaging visual effects in Framer projects.
 * 
 * @example Basic Usage
 * ```tsx
 * <ReactBitsGridDistortion
 *   imageSrc="https://example.com/background.jpg"
 *   distortionType="fluid"
 *   intensity={0.6}
 *   showGrid={true}
 * />
 * ```
 * 
 * @example Advanced Configuration
 * ```tsx
 * <ReactBitsGridDistortion
 *   imageSrc="https://example.com/texture.jpg"
 *   distortionType="magnetic"
 *   intensity={0.8}
 *   radius={0.4}
 *   falloff={1.5}
 *   magneticStrength={2}
 *   magneticPolarity={-1}
 *   showGrid={true}
 *   gridSize={25}
 *   gridColor="#00ff88"
 *   gridOpacity={0.4}
 *   gridBlendMode="screen"
 *   autoAnimation={true}
 *   animationSpeed={1.2}
 *   quality="high"
 *   ariaLabel="Magnetic distortion effect with animated grid"
 * />
 * ```
 * 
 * @example Performance Optimized
 * ```tsx
 * <ReactBitsGridDistortion
 *   distortionType="ripple"
 *   intensity={0.4}
 *   quality="low"
 *   showGrid={false}
 *   showPerformanceInfo={true}
 * />
 * ```
 */

/**
 * Props interface for the ReactBitsGridDistortion component
 * 
 * Comprehensive configuration options for all aspects of the distortion effect,
 * grid appearance, mouse interaction, animation, and accessibility.
 */
export interface ReactBitsGridDistortionProps {
  // Image Properties
  /** URL of the background image to display with distortion effects */
  imageSrc?: string
  /** Opacity of the background image (0-1) */
  imageOpacity?: number
  /** How the image should fit within the component bounds */
  imageFit?: "cover" | "contain" | "fill"
  
  // Distortion Properties
  /** Type of distortion effect to apply */
  distortionType?: "fluid" | "magnetic" | "ripple" | "vortex"
  /** Overall strength of the distortion effect (0-1) */
  intensity?: number
  /** Size of the distortion area around the mouse (0-1) */
  radius?: number
  /** How quickly distortion fades from center to edge (0.1-5) */
  falloff?: number
  
  // Magnetic Distortion Properties
  magneticStrength?: number
  magneticPolarity?: number
  
  // Ripple Distortion Properties
  rippleFrequency?: number
  rippleAmplitude?: number
  rippleDecay?: number
  
  // Vortex Distortion Properties
  vortexStrength?: number
  vortexTightness?: number
  
  // Grid Properties
  /** Number of grid lines across the component (5-100) */
  gridSize?: number
  /** Transparency of the grid lines (0-1) */
  gridOpacity?: number
  /** Color of the grid lines */
  gridColor?: string
  /** Thickness of the grid lines (0.1-5) */
  gridThickness?: number
  /** Whether to display the procedural grid overlay */
  showGrid?: boolean
  /** How the grid blends with the background image */
  gridBlendMode?: "normal" | "multiply" | "screen" | "overlay" | "add"
  /** How the grid responds to distortion effects */
  gridDistortionMode?: "none" | "follow" | "independent"
  
  // Animation Properties
  mouseEasing?: number
  autoAnimation?: boolean
  animationSpeed?: number
  
  // Mouse Interaction Properties
  interactionRadius?: number
  interactionFalloff?: number
  velocityInfluence?: number
  mouseSmoothing?: number
  
  // Visual Properties
  backgroundColor?: string
  blendMode?: "normal" | "multiply" | "screen" | "overlay"
  
  // Performance
  /** Rendering quality vs performance trade-off */
  quality?: "low" | "medium" | "high"
  /** Display frame rate and performance metrics */
  showPerformanceInfo?: boolean
  
  // Accessibility
  /** Accessible description for screen readers */
  ariaLabel?: string
  /** CSS class name for styling */
  className?: string
  /** Inline styles for the container */
  style?: React.CSSProperties
}

// WebGL context and shader interfaces
interface WebGLContextState {
  gl: WebGLRenderingContext | null
  canvas: HTMLCanvasElement | null
  program: WebGLProgram | null
  vertexBuffer: WebGLBuffer | null
  texture: WebGLTexture | null
  isInitialized: boolean
  hasError: boolean
  errorMessage: string
  isContextLost: boolean
  contextLossCount: number
  lastContextLossTime: number
}

// Context recovery state interface
interface ContextRecoveryState {
  isRecovering: boolean
  recoveryAttempts: number
  maxRecoveryAttempts: number
  lastRecoveryTime: number
  recoveryDelay: number
  preservedState: {
    mouseState: MouseState | null
    performanceState: PerformanceState | null
    textureSource: string | null
    dimensions: { width: number; height: number } | null
  }
}

// Fallback mode state interface
interface FallbackState {
  isActive: boolean
  reason: "webgl_unavailable" | "context_loss_permanent" | "initialization_failed"
  showGrid: boolean
  gridAnimationEnabled: boolean
  mousePosition: { x: number; y: number }
  isMouseActive: boolean
}

// Texture state interface
interface TextureState {
  texture: WebGLTexture | null
  image: HTMLImageElement | null
  isLoading: boolean
  isLoaded: boolean
  hasError: boolean
  errorMessage: string
  width: number
  height: number
}

// Shader program interface
interface ShaderProgram {
  program: WebGLProgram
  uniforms: Record<string, WebGLUniformLocation | null>
  attributes: Record<string, number>
}

// Mouse state interface
interface MouseState {
  current: { x: number; y: number }
  target: { x: number; y: number }
  velocity: { x: number; y: number }
  isActive: boolean
  lastMoveTime: number
}

// Performance monitoring interface
interface PerformanceState {
  frameCount: number
  lastFrameTime: number
  frameRate: number
  averageFrameRate: number
  frameRateHistory: number[]
  isPerformanceGood: boolean
  adaptiveQuality: "low" | "medium" | "high"
  lastQualityChange: number
}

// Quality preset configuration
interface QualityPreset {
  maxDPR: number
  shaderComplexity: "low" | "medium" | "high"
  textureSize: number
  enableAdvancedGrid: boolean
  enableVelocityEffects: boolean
  targetFrameRate: number
}

// Device capability detection interface
interface DeviceCapabilities {
  maxTextureSize: number
  maxViewportDims: [number, number]
  maxRenderBufferSize: number
  supportedExtensions: string[]
  isMobile: boolean
  isLowEndDevice: boolean
}

// Vertex shader source - creates fullscreen quad and passes UV coordinates
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  varying vec2 v_texCoord;
  
  void main() {
    // Pass UV coordinates to fragment shader
    v_texCoord = a_texCoord;
    
    // Convert from clip space to screen space
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

// Fragment shader source - multiple distortion algorithms implementation with texture support
const fragmentShaderSource = `
  precision mediump float;
  
  varying vec2 v_texCoord;
  
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_intensity;
  uniform float u_radius;
  uniform float u_falloff;
  uniform float u_interactionRadius;
  uniform float u_interactionFalloff;
  uniform float u_velocityInfluence;
  uniform vec2 u_velocity;
  uniform bool u_mouseActive;
  uniform sampler2D u_texture;
  uniform bool u_hasTexture;
  uniform float u_imageOpacity;
  uniform vec2 u_imageResolution;
  uniform vec2 u_canvasResolution;
  uniform int u_imageFit; // 0 = cover, 1 = contain, 2 = fill
  uniform int u_distortionType; // 0 = fluid, 1 = magnetic, 2 = ripple, 3 = vortex
  uniform float u_magneticStrength; // Magnetic distortion strength
  uniform float u_magneticPolarity; // 1.0 = attraction, -1.0 = repulsion
  uniform float u_rippleFrequency; // Ripple wave frequency
  uniform float u_rippleAmplitude; // Ripple wave amplitude
  uniform float u_rippleDecay; // Ripple decay rate
  uniform float u_vortexStrength; // Vortex rotation strength
  uniform float u_vortexTightness; // Vortex spiral tightness
  
  // Grid uniforms
  uniform bool u_showGrid;
  uniform float u_gridSize;
  uniform float u_gridOpacity;
  uniform vec3 u_gridColor;
  uniform float u_gridThickness;
  uniform int u_gridBlendMode; // 0 = normal, 1 = multiply, 2 = screen, 3 = overlay, 4 = add
  uniform int u_gridDistortionMode; // 0 = none, 1 = follow, 2 = independent
  
  // Animation uniforms
  uniform bool u_autoAnimation;
  uniform float u_animationSpeed;
  
  // Noise function for organic fluid distortion
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Smooth noise function
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  // Multi-octave noise for more complex patterns
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  // Advanced procedural grid generation with anti-aliasing
  float calculateGrid(vec2 uv, float size, float thickness) {
    // Scale UV coordinates by grid size
    vec2 grid = uv * size;
    
    // Calculate derivatives for anti-aliasing
    vec2 gridDeriv = fwidth(grid);
    
    // Get fractional part for grid lines
    vec2 gridFract = fract(grid);
    
    // Calculate distance to nearest grid line (both horizontal and vertical)
    vec2 gridDist = min(gridFract, 1.0 - gridFract);
    
    // Apply thickness with anti-aliasing using derivatives
    vec2 gridLine = smoothstep(thickness * 0.5 - gridDeriv, thickness * 0.5 + gridDeriv, gridDist);
    
    // Combine horizontal and vertical lines
    float gridMask = 1.0 - min(gridLine.x, gridLine.y);
    
    return gridMask;
  }
  
  // Enhanced grid function with multiple line weights and sub-grids
  float calculateAdvancedGrid(vec2 uv, float size, float thickness) {
    // Main grid
    float mainGrid = calculateGrid(uv, size, thickness);
    
    // Sub-grid with thinner lines (every 5th line is thicker)
    float subGrid = calculateGrid(uv, size * 5.0, thickness * 0.3);
    
    // Major grid lines (every 10th line is thickest)
    float majorGrid = calculateGrid(uv, size * 0.1, thickness * 2.0);
    
    // Combine grids with different weights
    float combinedGrid = max(mainGrid * 0.6, max(subGrid * 0.3, majorGrid * 1.0));
    
    return combinedGrid;
  }
  
  // Blending mode functions for grid composition
  vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
    return mix(base, blend, opacity);
  }
  
  vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
    vec3 result = base * blend;
    return mix(base, result, opacity);
  }
  
  vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
    vec3 result = 1.0 - (1.0 - base) * (1.0 - blend);
    return mix(base, result, opacity);
  }
  
  vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
    vec3 result = mix(
      2.0 * base * blend,
      1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
      step(0.5, base)
    );
    return mix(base, result, opacity);
  }
  
  vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
    vec3 result = base + blend;
    return mix(base, result, opacity);
  }
  
  // Apply grid blending based on mode
  vec3 applyGridBlending(vec3 baseColor, vec3 gridColor, float gridMask, float gridOpacity, int blendMode) {
    float effectiveOpacity = gridMask * gridOpacity;
    
    if (blendMode == 1) {
      return blendMultiply(baseColor, gridColor, effectiveOpacity);
    } else if (blendMode == 2) {
      return blendScreen(baseColor, gridColor, effectiveOpacity);
    } else if (blendMode == 3) {
      return blendOverlay(baseColor, gridColor, effectiveOpacity);
    } else if (blendMode == 4) {
      return blendAdd(baseColor, gridColor, effectiveOpacity);
    } else {
      // Default to normal blending
      return blendNormal(baseColor, gridColor, effectiveOpacity);
    }
  }
  
  // Calculate UV coordinates for different fitting modes
  vec2 calculateImageUV(vec2 uv, vec2 imageRes, vec2 canvasRes, int fitMode) {
    // Calculate aspect ratios
    float imageAspect = imageRes.x / imageRes.y;
    float canvasAspect = canvasRes.x / canvasRes.y;
    
    vec2 scale = vec2(1.0);
    vec2 offset = vec2(0.0);
    
    if (fitMode == 0) { // cover
      if (imageAspect > canvasAspect) {
        // Image is wider than canvas - scale by height
        scale.x = canvasAspect / imageAspect;
        offset.x = (1.0 - scale.x) * 0.5;
      } else {
        // Image is taller than canvas - scale by width
        scale.y = imageAspect / canvasAspect;
        offset.y = (1.0 - scale.y) * 0.5;
      }
    } else if (fitMode == 1) { // contain
      if (imageAspect > canvasAspect) {
        // Image is wider than canvas - scale by width
        scale.y = imageAspect / canvasAspect;
        offset.y = (1.0 - scale.y) * 0.5;
      } else {
        // Image is taller than canvas - scale by height
        scale.x = canvasAspect / imageAspect;
        offset.x = (1.0 - scale.x) * 0.5;
      }
    }
    // fitMode == 2 (fill) uses default scale and offset (no change)
    
    // Apply scaling and offset
    vec2 scaledUV = (uv - offset) / scale;
    
    // Clamp UV coordinates to prevent sampling outside texture
    return clamp(scaledUV, 0.0, 1.0);
  }

  // Enhanced fluid distortion function with velocity influence and auto-animation
  vec2 fluidDistortion(vec2 uv, vec2 mouse, float time) {
    // Distance from mouse position
    float dist = distance(uv, mouse);
    
    // Create falloff based on interaction radius and falloff curve
    float interactionFalloff = 1.0 - smoothstep(0.0, u_interactionRadius, dist);
    interactionFalloff = pow(interactionFalloff, u_interactionFalloff);
    
    // Create falloff based on original radius for intensity
    float intensityFalloff = 1.0 - smoothstep(0.0, u_radius, dist);
    intensityFalloff = pow(intensityFalloff, u_falloff);
    
    // Generate noise-based displacement with time evolution and improved quality
    vec2 noisePos = uv * 8.0 + time * 0.5;
    float noiseX = fbm(noisePos) - 0.5;
    float noiseY = fbm(noisePos + vec2(100.0, 100.0)) - 0.5;
    
    // Add secondary noise layer for more organic feel
    vec2 secondaryNoisePos = uv * 16.0 + time * 0.3;
    float secondaryNoiseX = smoothNoise(secondaryNoisePos) - 0.5;
    float secondaryNoiseY = smoothNoise(secondaryNoisePos + vec2(50.0, 50.0)) - 0.5;
    
    // Combine primary and secondary noise
    noiseX = mix(noiseX, secondaryNoiseX, 0.3);
    noiseY = mix(noiseY, secondaryNoiseY, 0.3);
    
    // Combine radial and noise-based distortion
    vec2 direction = normalize(uv - mouse);
    vec2 radialDisplacement = direction * intensityFalloff * u_intensity * 0.1;
    vec2 noiseDisplacement = vec2(noiseX, noiseY) * intensityFalloff * u_intensity * 0.05;
    
    // Add velocity-based displacement for more dynamic interaction
    vec2 velocityDisplacement = u_velocity * interactionFalloff * u_velocityInfluence * 0.01;
    
    // Enhanced time-based animation for organic feel with improved smoothness
    float timeOffset = sin(time * 2.0 + dist * 10.0) * 0.02;
    vec2 timeDisplacement = direction * timeOffset * intensityFalloff * u_intensity;
    
    // Auto-animation: subtle breathing/wobble effects with enhanced quality
    if (u_autoAnimation) {
      // Create breathing effect with multiple frequencies and improved smoothness
      float breathingPhase = time * u_animationSpeed * 0.8;
      float breathing = sin(breathingPhase) * 0.3 + sin(breathingPhase * 1.7) * 0.2 + sin(breathingPhase * 2.3) * 0.1;
      
      // Create wobble effect with organic movement and improved quality
      vec2 wobbleOffset = vec2(
        sin(time * u_animationSpeed * 1.2 + uv.x * 3.0) * 0.015 + sin(time * u_animationSpeed * 0.7 + uv.x * 5.0) * 0.008,
        cos(time * u_animationSpeed * 0.9 + uv.y * 2.5) * 0.012 + cos(time * u_animationSpeed * 1.3 + uv.y * 4.0) * 0.006
      );
      
      // Apply auto-animation displacement with improved blending
      vec2 autoAnimDisplacement = wobbleOffset * breathing * u_intensity * 0.5;
      
      // Blend with existing displacements using smooth interpolation
      return uv + radialDisplacement + noiseDisplacement + velocityDisplacement + timeDisplacement + autoAnimDisplacement;
    }
    
    return uv + radialDisplacement + noiseDisplacement + velocityDisplacement + timeDisplacement;
  }
  
  // Magnetic distortion function with radial attraction/repulsion and auto-animation
  vec2 magneticDistortion(vec2 uv, vec2 mouse, float time) {
    // Distance from mouse position
    float dist = distance(uv, mouse);
    
    // Prevent division by zero and extreme values
    dist = max(dist, 0.001);
    
    // Create exponential falloff for magnetic effect
    float magneticFalloff = exp(-dist / u_radius);
    magneticFalloff = pow(magneticFalloff, u_falloff);
    
    // Create interaction falloff for smooth edges
    float interactionFalloff = 1.0 - smoothstep(0.0, u_interactionRadius, dist);
    interactionFalloff = pow(interactionFalloff, u_interactionFalloff);
    
    // Calculate direction from mouse to current position (for attraction)
    // Reverse for repulsion based on polarity
    vec2 direction = normalize(uv - mouse) * u_magneticPolarity;
    
    // Calculate magnetic force with distance-based intensity
    // Closer points experience stronger force (inverse square law approximation)
    float magneticForce = u_magneticStrength * magneticFalloff / (dist * dist + 0.01);
    
    // Apply intensity scaling
    magneticForce *= u_intensity;
    
    // Create displacement vector
    vec2 magneticDisplacement = direction * magneticForce * 0.1;
    
    // Add velocity-based displacement for dynamic interaction
    vec2 velocityDisplacement = u_velocity * interactionFalloff * u_velocityInfluence * 0.01;
    
    // Add subtle time-based variation for organic feel
    float timeVariation = sin(time * 1.5 + dist * 8.0) * 0.01;
    vec2 timeDisplacement = direction * timeVariation * magneticFalloff * u_intensity;
    
    // Auto-animation: pulsing magnetic field effect
    if (u_autoAnimation) {
      float pulsePhase = time * u_animationSpeed * 1.5;
      float pulse = sin(pulsePhase) * 0.4 + sin(pulsePhase * 2.3) * 0.2;
      
      // Create radial pulsing effect
      vec2 pulseDisplacement = direction * pulse * magneticFalloff * u_intensity * 0.3;
      
      return uv + magneticDisplacement + velocityDisplacement + timeDisplacement + pulseDisplacement;
    }
    
    return uv + magneticDisplacement + velocityDisplacement + timeDisplacement;
  }
  
  // Ripple distortion function with concentric wave propagation and auto-animation
  vec2 rippleDistortion(vec2 uv, vec2 mouse, float time) {
    // Distance from mouse position
    float dist = distance(uv, mouse);
    
    // Create interaction falloff for smooth edges
    float interactionFalloff = 1.0 - smoothstep(0.0, u_interactionRadius, dist);
    interactionFalloff = pow(interactionFalloff, u_interactionFalloff);
    
    // Create ripple falloff based on radius
    float rippleFalloff = 1.0 - smoothstep(0.0, u_radius, dist);
    rippleFalloff = pow(rippleFalloff, u_falloff);
    
    // Calculate wave phase based on distance and time
    float wavePhase = dist * u_rippleFrequency - time * 3.0;
    
    // Create sine wave displacement with temporal decay
    float waveValue = sin(wavePhase) * u_rippleAmplitude;
    
    // Apply decay over time and distance
    float decayFactor = exp(-dist * u_rippleDecay);
    waveValue *= decayFactor * rippleFalloff * u_intensity;
    
    // Calculate direction for radial wave propagation
    vec2 direction = normalize(uv - mouse);
    
    // Create displacement vector
    vec2 rippleDisplacement = direction * waveValue * 0.1;
    
    // Add velocity-based displacement for dynamic interaction
    vec2 velocityDisplacement = u_velocity * interactionFalloff * u_velocityInfluence * 0.01;
    
    // Add secondary wave for more complex ripple pattern
    float secondaryPhase = dist * u_rippleFrequency * 0.7 - time * 2.0;
    float secondaryWave = sin(secondaryPhase) * u_rippleAmplitude * 0.3;
    secondaryWave *= decayFactor * rippleFalloff * u_intensity;
    
    // Create perpendicular displacement for secondary wave
    vec2 perpDirection = vec2(-direction.y, direction.x);
    vec2 secondaryDisplacement = perpDirection * secondaryWave * 0.05;
    
    // Auto-animation: continuous ripple generation
    if (u_autoAnimation) {
      // Create multiple auto-generated ripples at different frequencies
      float autoRipple1 = sin(time * u_animationSpeed * 2.0 - dist * 15.0) * 0.02;
      float autoRipple2 = sin(time * u_animationSpeed * 1.3 - dist * 8.0) * 0.015;
      
      // Apply distance-based falloff to auto-ripples
      float autoFalloff = exp(-dist * 2.0);
      vec2 autoRippleDisplacement = direction * (autoRipple1 + autoRipple2) * autoFalloff * u_intensity;
      
      return uv + rippleDisplacement + velocityDisplacement + secondaryDisplacement + autoRippleDisplacement;
    }
    
    return uv + rippleDisplacement + velocityDisplacement + secondaryDisplacement;
  }
  
  // Vortex distortion function with rotational displacement and auto-animation
  vec2 vortexDistortion(vec2 uv, vec2 mouse, float time) {
    // Vector from mouse to current position
    vec2 toCenter = uv - mouse;
    float dist = length(toCenter);
    
    // Prevent division by zero
    if (dist < 0.001) return uv;
    
    // Create interaction falloff for smooth edges
    float interactionFalloff = 1.0 - smoothstep(0.0, u_interactionRadius, dist);
    interactionFalloff = pow(interactionFalloff, u_interactionFalloff);
    
    // Create vortex falloff based on radius
    float vortexFalloff = 1.0 - smoothstep(0.0, u_radius, dist);
    vortexFalloff = pow(vortexFalloff, u_falloff);
    
    // Calculate rotation angle based on distance and strength
    float rotationAngle = u_vortexStrength * vortexFalloff * u_intensity;
    
    // Add spiral tightness - closer points rotate more
    rotationAngle += u_vortexTightness * (1.0 / (dist + 0.1)) * vortexFalloff * u_intensity * 0.1;
    
    // Add time-based rotation for continuous motion
    rotationAngle += time * 0.5 * vortexFalloff;
    
    // Auto-animation: additional rotation and spiral effects
    if (u_autoAnimation) {
      float autoRotation = time * u_animationSpeed * 1.2 * vortexFalloff;
      rotationAngle += autoRotation;
      
      // Add spiral breathing effect
      float spiralBreathing = sin(time * u_animationSpeed * 0.8) * 0.3;
      rotationAngle += spiralBreathing * vortexFalloff * u_intensity;
    }
    
    // Calculate rotation matrix components
    float cosAngle = cos(rotationAngle);
    float sinAngle = sin(rotationAngle);
    
    // Apply rotation to the vector from mouse to current position
    vec2 rotatedVector = vec2(
      toCenter.x * cosAngle - toCenter.y * sinAngle,
      toCenter.x * sinAngle + toCenter.y * cosAngle
    );
    
    // Calculate displacement as the difference between original and rotated vectors
    vec2 vortexDisplacement = (rotatedVector - toCenter) * 0.5;
    
    // Add velocity-based displacement for dynamic interaction
    vec2 velocityDisplacement = u_velocity * interactionFalloff * u_velocityInfluence * 0.01;
    
    // Add radial component for more complex vortex behavior
    float radialPull = u_vortexStrength * 0.1 * vortexFalloff * u_intensity;
    vec2 radialDisplacement = normalize(toCenter) * radialPull * -0.05; // Slight inward pull
    
    return uv + vortexDisplacement + velocityDisplacement + radialDisplacement;
  }
  
  void main() {
    vec2 originalUV = v_texCoord;
    vec2 distortedUV = originalUV;
    
    // Apply selected distortion type if mouse is active or auto-animation is enabled
    if (u_mouseActive || u_autoAnimation) {
      // Use center point for auto-animation when mouse is not active
      vec2 effectiveMousePos = u_mouseActive ? u_mouse : vec2(0.5, 0.5);
      
      if (u_distortionType == 0) {
        distortedUV = fluidDistortion(originalUV, effectiveMousePos, u_time);
      } else if (u_distortionType == 1) {
        distortedUV = magneticDistortion(originalUV, effectiveMousePos, u_time);
      } else if (u_distortionType == 2) {
        distortedUV = rippleDistortion(originalUV, effectiveMousePos, u_time);
      } else if (u_distortionType == 3) {
        distortedUV = vortexDistortion(originalUV, effectiveMousePos, u_time);
      }
    }
    
    vec3 finalColor = vec3(0.0);
    
    // Sample texture if available
    if (u_hasTexture) {
      // Calculate proper UV coordinates based on fitting mode
      vec2 imageUV = calculateImageUV(distortedUV, u_imageResolution, u_canvasResolution, u_imageFit);
      
      // Sample texture with fitted UV coordinates
      vec4 textureColor = texture2D(u_texture, imageUV);
      finalColor = textureColor.rgb;
      
      // Apply image opacity
      finalColor = mix(vec3(0.0), finalColor, u_imageOpacity);
    }
    
    // Add procedural grid if enabled
    if (u_showGrid) {
      // Choose UV coordinates for grid based on distortion mode
      vec2 gridUV = originalUV;
      
      if (u_gridDistortionMode == 1) {
        // Follow mode: grid follows the same distortion as the image
        gridUV = distortedUV;
      } else if (u_gridDistortionMode == 2) {
        // Independent mode: grid has its own distortion with different parameters
        if (u_mouseActive) {
          // Apply a different distortion algorithm or modified parameters for independent grid
          if (u_distortionType == 0) {
            // Use fluid distortion with reduced intensity for grid
            gridUV = fluidDistortion(originalUV, u_mouse, u_time * 0.7);
            gridUV = mix(originalUV, gridUV, 0.5); // Reduce distortion intensity
          } else if (u_distortionType == 1) {
            // Use magnetic distortion with opposite polarity for interesting effect
            vec2 gridMouse = u_mouse;
            gridUV = magneticDistortion(originalUV, gridMouse, u_time * 0.8);
            gridUV = mix(originalUV, gridUV, 0.6);
          } else if (u_distortionType == 2) {
            // Use ripple with different frequency for grid
            gridUV = rippleDistortion(originalUV, u_mouse, u_time * 1.2);
            gridUV = mix(originalUV, gridUV, 0.4);
          } else if (u_distortionType == 3) {
            // Use vortex with counter-rotation for grid
            gridUV = vortexDistortion(originalUV, u_mouse, -u_time * 0.6);
            gridUV = mix(originalUV, gridUV, 0.5);
          }
        }
      }
      // Mode 0 (none): gridUV remains originalUV (no distortion)
      
      // Calculate grid with chosen UV coordinates
      float gridMask = calculateAdvancedGrid(gridUV, u_gridSize, u_gridThickness * 0.01);
      
      if (u_hasTexture) {
        // Blend grid with texture using selected blend mode
        finalColor = applyGridBlending(finalColor, u_gridColor, gridMask, u_gridOpacity, u_gridBlendMode);
      } else {
        // Use grid as primary visual element with background
        vec3 backgroundColor = vec3(0.05, 0.05, 0.1);
        finalColor = applyGridBlending(backgroundColor, u_gridColor, gridMask, u_gridOpacity, u_gridBlendMode);
      }
    } else if (!u_hasTexture) {
      // Fallback pattern when no texture and no grid
      vec2 fallbackGrid = abs(fract(distortedUV * 20.0) - 0.5);
      float fallbackLine = smoothstep(0.0, 0.05, min(fallbackGrid.x, fallbackGrid.y));
      
      finalColor = mix(vec3(0.1, 0.1, 0.2), vec3(0.3, 0.5, 0.8), fallbackLine);
      finalColor = mix(finalColor, vec3(0.8, 0.4, 0.2), 1.0 - fallbackLine);
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

/**
 * Compiles a WebGL shader from source code with comprehensive error handling
 * 
 * @param gl - WebGL rendering context
 * @param source - GLSL shader source code
 * @param type - Shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
 * @returns Compiled WebGL shader object
 * @throws Error if shader compilation fails with detailed error message
 */
const compileShader = (gl: WebGLRenderingContext, source: string, type: number): WebGLShader => {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error(`Failed to create shader of type ${type}`)
  }
  
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  // Check compilation status
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compilation failed: ${error}`)
  }
  
  return shader
}

/**
 * Creates and links a complete WebGL shader program from vertex and fragment shaders
 * 
 * @param gl - WebGL rendering context
 * @param vertexSource - GLSL vertex shader source code
 * @param fragmentSource - GLSL fragment shader source code
 * @returns ShaderProgram object containing program, uniforms, and attributes
 * @throws Error if program creation or linking fails
 */
const createShaderProgram = (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): ShaderProgram => {
  try {
    // Compile shaders
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER)
    
    // Create program
    const program = gl.createProgram()
    if (!program) {
      throw new Error("Failed to create WebGL program")
    }
    
    // Attach and link shaders
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    
    // Check linking status
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program)
      gl.deleteProgram(program)
      throw new Error(`Program linking failed: ${error}`)
    }
    
    // Get uniform locations
    const uniforms: Record<string, WebGLUniformLocation | null> = {
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_mouse: gl.getUniformLocation(program, "u_mouse"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_intensity: gl.getUniformLocation(program, "u_intensity"),
      u_radius: gl.getUniformLocation(program, "u_radius"),
      u_falloff: gl.getUniformLocation(program, "u_falloff"),
      u_interactionRadius: gl.getUniformLocation(program, "u_interactionRadius"),
      u_interactionFalloff: gl.getUniformLocation(program, "u_interactionFalloff"),
      u_velocityInfluence: gl.getUniformLocation(program, "u_velocityInfluence"),
      u_velocity: gl.getUniformLocation(program, "u_velocity"),
      u_mouseActive: gl.getUniformLocation(program, "u_mouseActive"),
      u_texture: gl.getUniformLocation(program, "u_texture"),
      u_hasTexture: gl.getUniformLocation(program, "u_hasTexture"),
      u_imageOpacity: gl.getUniformLocation(program, "u_imageOpacity"),
      u_imageResolution: gl.getUniformLocation(program, "u_imageResolution"),
      u_canvasResolution: gl.getUniformLocation(program, "u_canvasResolution"),
      u_imageFit: gl.getUniformLocation(program, "u_imageFit"),
      u_distortionType: gl.getUniformLocation(program, "u_distortionType"),
      u_magneticStrength: gl.getUniformLocation(program, "u_magneticStrength"),
      u_magneticPolarity: gl.getUniformLocation(program, "u_magneticPolarity"),
      u_rippleFrequency: gl.getUniformLocation(program, "u_rippleFrequency"),
      u_rippleAmplitude: gl.getUniformLocation(program, "u_rippleAmplitude"),
      u_rippleDecay: gl.getUniformLocation(program, "u_rippleDecay"),
      u_vortexStrength: gl.getUniformLocation(program, "u_vortexStrength"),
      u_vortexTightness: gl.getUniformLocation(program, "u_vortexTightness"),
      u_showGrid: gl.getUniformLocation(program, "u_showGrid"),
      u_gridSize: gl.getUniformLocation(program, "u_gridSize"),
      u_gridOpacity: gl.getUniformLocation(program, "u_gridOpacity"),
      u_gridColor: gl.getUniformLocation(program, "u_gridColor"),
      u_gridThickness: gl.getUniformLocation(program, "u_gridThickness"),
      u_gridBlendMode: gl.getUniformLocation(program, "u_gridBlendMode"),
      u_gridDistortionMode: gl.getUniformLocation(program, "u_gridDistortionMode")
    }
    
    // Get attribute locations
    const attributes: Record<string, number> = {
      a_position: gl.getAttribLocation(program, "a_position"),
      a_texCoord: gl.getAttribLocation(program, "a_texCoord")
    }
    
    // Validate attribute locations
    // Validate attribute locations in development mode only
    if (process.env.NODE_ENV === 'development') {
      Object.entries(attributes).forEach(([name, location]) => {
        if (location === -1) {
          console.warn(`Attribute ${name} not found in shader program`)
        }
      })
    }
    
    // Clean up shaders (they're now part of the program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    
    return { program, uniforms, attributes }
  } catch (error) {
    console.error("Shader program creation failed:", error)
    throw error
  }
}

// Shader validation utility
const validateShaderProgram = (gl: WebGLRenderingContext, program: WebGLProgram): boolean => {
  gl.validateProgram(program)
  
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    const error = gl.getProgramInfoLog(program)
    console.error("Shader program validation failed:", error)
    return false
  }
  
  return true
}

// Fallback shader sources for error recovery
const fallbackVertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    v_texCoord = a_texCoord;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const fallbackFragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  
  void main() {
    vec2 grid = abs(fract(v_texCoord * 10.0) - 0.5);
    float gridLine = smoothstep(0.0, 0.1, min(grid.x, grid.y));
    vec3 color = mix(vec3(0.2), vec3(0.8), gridLine);
    gl_FragColor = vec4(color, 1.0);
  }
`

// Texture loading utility with crossOrigin and error handling
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (!src || src.trim() === "") {
      reject(new Error("Image source is empty"))
      return
    }

    const img = new Image()
    
    // Set crossOrigin before setting src to handle CORS properly
    img.crossOrigin = "anonymous"
    
    // Success handler
    img.onload = () => {
      // Validate image dimensions
      if (img.width === 0 || img.height === 0) {
        reject(new Error("Invalid image dimensions"))
        return
      }
      resolve(img)
    }
    
    // Error handler
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`))
    }
    
    // Timeout handler for slow loading images
    const timeout = setTimeout(() => {
      reject(new Error(`Image loading timeout: ${src}`))
    }, 10000) // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeout)
      if (img.width === 0 || img.height === 0) {
        reject(new Error("Invalid image dimensions"))
        return
      }
      resolve(img)
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      reject(new Error(`Failed to load image: ${src}`))
    }
    
    // Start loading
    img.src = src
  })
}

// Create WebGL texture from loaded image with optimal sizing
const createTextureFromImage = (
  gl: WebGLRenderingContext, 
  image: HTMLImageElement, 
  qualityPreset?: QualityPreset, 
  deviceCapabilities?: DeviceCapabilities
): WebGLTexture => {
  const texture = gl.createTexture()
  if (!texture) {
    throw new Error("Failed to create WebGL texture")
  }
  
  // Bind texture
  gl.bindTexture(gl.TEXTURE_2D, texture)
  
  // Set texture parameters for proper filtering and wrapping
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  
  // Determine if we need to resize the image for performance
  let imageToUpload = image
  
  if (qualityPreset && deviceCapabilities) {
    const optimalSize = getOptimalTextureSize(
      image.width, 
      image.height, 
      qualityPreset, 
      deviceCapabilities
    )
    
    // Only resize if the optimal size is significantly smaller than original
    if (optimalSize.width < image.width * 0.8 || optimalSize.height < image.height * 0.8) {
      // Create a canvas to resize the image
      const resizeCanvas = document.createElement('canvas')
      const resizeCtx = resizeCanvas.getContext('2d')
      
      if (resizeCtx) {
        resizeCanvas.width = optimalSize.width
        resizeCanvas.height = optimalSize.height
        
        // Use high-quality image scaling
        resizeCtx.imageSmoothingEnabled = true
        resizeCtx.imageSmoothingQuality = 'high'
        
        // Draw resized image
        resizeCtx.drawImage(image, 0, 0, optimalSize.width, optimalSize.height)
        
        // Upload resized canvas instead of original image
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resizeCanvas)
        } catch (error) {
          gl.deleteTexture(texture)
          throw new Error(`Failed to upload resized image to texture: ${error}`)
        }
      } else {
        // Fallback to original image if canvas creation fails
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      }
    } else {
      // Upload original image if no resizing needed
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    }
  } else {
    // Upload original image if no optimization data available
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  }
  
  // Check for WebGL errors
  const glError = gl.getError()
  if (glError !== gl.NO_ERROR) {
    gl.deleteTexture(texture)
    throw new Error(`WebGL error during texture creation: ${glError}`)
  }
  
  return texture
}

// Texture cleanup utility
const cleanupTexture = (gl: WebGLRenderingContext, texture: WebGLTexture | null) => {
  if (texture) {
    gl.deleteTexture(texture)
  }
}

// Create placeholder texture for fallback
const createPlaceholderTexture = (gl: WebGLRenderingContext, width: number = 256, height: number = 256): WebGLTexture => {
  const texture = gl.createTexture()
  if (!texture) {
    throw new Error("Failed to create placeholder texture")
  }
  
  // Create a simple checkerboard pattern
  const size = width * height * 4 // RGBA
  const data = new Uint8Array(size)
  
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const index = (i * width + j) * 4
      const checker = ((i >> 4) + (j >> 4)) & 1
      const color = checker ? 64 : 128
      
      data[index] = color     // R
      data[index + 1] = color // G
      data[index + 2] = color // B
      data[index + 3] = 255   // A
    }
  }
  
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  
  return texture
}

// CSS color parsing utility for grid color
const parseColor = (color: string): [number, number, number] => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      // Short hex format (#RGB)
      const r = parseInt(hex[0] + hex[0], 16) / 255
      const g = parseInt(hex[1] + hex[1], 16) / 255
      const b = parseInt(hex[2] + hex[2], 16) / 255
      return [r, g, b]
    } else if (hex.length === 6) {
      // Full hex format (#RRGGBB)
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      return [r, g, b]
    }
  }
  
  // Handle rgb() format
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]) / 255
    const g = parseInt(rgbMatch[2]) / 255
    const b = parseInt(rgbMatch[3]) / 255
    return [r, g, b]
  }
  
  // Handle rgba() format (ignore alpha)
  const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]) / 255
    const g = parseInt(rgbaMatch[2]) / 255
    const b = parseInt(rgbaMatch[3]) / 255
    return [r, g, b]
  }
  
  // Handle common color names
  const colorNames: Record<string, [number, number, number]> = {
    'white': [1, 1, 1],
    'black': [0, 0, 0],
    'red': [1, 0, 0],
    'green': [0, 1, 0],
    'blue': [0, 0, 1],
    'yellow': [1, 1, 0],
    'cyan': [0, 1, 1],
    'magenta': [1, 0, 1],
    'gray': [0.5, 0.5, 0.5],
    'grey': [0.5, 0.5, 0.5]
  }
  
  const lowerColor = color.toLowerCase()
  if (colorNames[lowerColor]) {
    return colorNames[lowerColor]
  }
  
  // Default to white if parsing fails
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Failed to parse color: ${color}, defaulting to white`)
  }
  return [1, 1, 1]
}

// Simple test function for shader compilation (for development/debugging)
const testShaderCompilation = (gl: WebGLRenderingContext): boolean => {
  try {
    const testProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource)
    const isValid = validateShaderProgram(gl, testProgram.program)
    gl.deleteProgram(testProgram.program)
    return isValid
  } catch (error) {
    console.error("Shader compilation test failed:", error)
    return false
  }
}

// Context loss recovery utilities
const preserveStateForRecovery = (
  mouseState: MouseState,
  performanceState: PerformanceState,
  textureSource: string | undefined,
  dimensions: { width: number; height: number }
): ContextRecoveryState['preservedState'] => {
  return {
    mouseState: { ...mouseState },
    performanceState: { ...performanceState },
    textureSource: textureSource || null,
    dimensions: { ...dimensions }
  }
}

const restoreStateAfterRecovery = (
  preservedState: ContextRecoveryState['preservedState'],
  setMouseState: React.Dispatch<React.SetStateAction<MouseState>>,
  setPerformanceState: React.Dispatch<React.SetStateAction<PerformanceState>>,
  setDimensions: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>
) => {
  if (preservedState.mouseState) {
    setMouseState(preservedState.mouseState)
  }
  
  if (preservedState.performanceState) {
    // Reset frame timing but preserve quality settings
    setPerformanceState(prev => ({
      ...preservedState.performanceState!,
      frameCount: 0,
      lastFrameTime: performance.now(),
      frameRateHistory: []
    }))
  }
  
  if (preservedState.dimensions) {
    setDimensions(preservedState.dimensions)
  }
}

const calculateRecoveryDelay = (attemptNumber: number, baseDelay: number): number => {
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber)
  const jitter = Math.random() * 0.3 * exponentialDelay // Add up to 30% jitter
  return Math.min(exponentialDelay + jitter, 10000) // Cap at 10 seconds
}

const shouldAttemptRecovery = (
  contextLossCount: number,
  lastContextLossTime: number,
  recoveryAttempts: number,
  maxRecoveryAttempts: number
): boolean => {
  const timeSinceLastLoss = performance.now() - lastContextLossTime
  const minTimeBetweenAttempts = 500 // Minimum 500ms between attempts
  
  return (
    recoveryAttempts < maxRecoveryAttempts &&
    timeSinceLastLoss > minTimeBetweenAttempts &&
    contextLossCount < 10 // Don't attempt recovery if context has been lost too many times
  )
}

const cleanupWebGLResources = (webglState: WebGLContextState) => {
  // Note: When context is lost, WebGL resources are automatically cleaned up
  // This function is mainly for explicit cleanup during normal operation
  if (webglState.gl && !webglState.isContextLost) {
    try {
      // Check if context is still valid before cleanup
      const contextValid = webglState.gl.getError() !== webglState.gl.CONTEXT_LOST_WEBGL
      
      if (contextValid) {
        if (webglState.texture) {
          webglState.gl.deleteTexture(webglState.texture)
        }
        if (webglState.vertexBuffer) {
          webglState.gl.deleteBuffer(webglState.vertexBuffer)
        }
        if (webglState.program) {
          webglState.gl.deleteProgram(webglState.program)
        }
      }
    } catch (error) {
      // Silently handle cleanup errors as context might be lost
      if (process.env.NODE_ENV === 'development') {
        console.warn('WebGL cleanup error (context may be lost):', error)
      }
    }
  }
}

// Fallback mode utilities
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (error) {
    return false
  }
}

const activateFallbackMode = (
  reason: FallbackState['reason'],
  setFallbackState: React.Dispatch<React.SetStateAction<FallbackState>>,
  setWebglState: React.Dispatch<React.SetStateAction<WebGLContextState>>
) => {
  console.warn(`Activating fallback mode: ${reason}`)
  
  setFallbackState(prev => ({
    ...prev,
    isActive: true,
    reason,
    showGrid: true,
    gridAnimationEnabled: reason !== "webgl_unavailable" // Enable animation if WebGL was available before
  }))
  
  setWebglState(prev => ({
    ...prev,
    hasError: true,
    errorMessage: getFallbackErrorMessage(reason)
  }))
}

const getFallbackErrorMessage = (reason: FallbackState['reason']): string => {
  switch (reason) {
    case "webgl_unavailable":
      return "WebGL is not supported in this browser"
    case "context_loss_permanent":
      return "WebGL context was permanently lost"
    case "initialization_failed":
      return "WebGL initialization failed"
    default:
      return "WebGL is unavailable"
  }
}

const generateCSSGridPattern = (
  gridSize: number,
  gridColor: string,
  gridThickness: number,
  gridOpacity: number,
  mousePosition: { x: number; y: number },
  isMouseActive: boolean,
  distortionType: string,
  intensity: number
): React.CSSProperties => {
  const cellSize = 100 / gridSize
  const lineThickness = Math.max(0.1, gridThickness * 0.1)
  
  // Create base grid pattern
  let backgroundImage = `
    linear-gradient(to right, ${gridColor} ${lineThickness}px, transparent ${lineThickness}px),
    linear-gradient(to bottom, ${gridColor} ${lineThickness}px, transparent ${lineThickness}px)
  `
  
  // Add distortion effect using CSS transforms if mouse is active
  let transform = 'none'
  let filter = 'none'
  
  if (isMouseActive) {
    const mouseX = mousePosition.x * 100
    const mouseY = mousePosition.y * 100
    
    switch (distortionType) {
      case 'magnetic':
        // Simulate magnetic distortion with perspective and scale
        transform = `perspective(1000px) rotateX(${(mouseY - 50) * intensity * 0.2}deg) rotateY(${(mouseX - 50) * intensity * 0.2}deg)`
        break
      case 'ripple':
        // Simulate ripple with blur and scale
        const rippleIntensity = intensity * 2
        filter = `blur(${rippleIntensity * 0.5}px)`
        transform = `scale(${1 + intensity * 0.1})`
        break
      case 'vortex':
        // Simulate vortex with rotation
        const angle = Math.atan2(mouseY - 50, mouseX - 50) * (180 / Math.PI)
        transform = `rotate(${angle * intensity * 0.1}deg) scale(${1 + intensity * 0.05})`
        break
      default: // fluid
        // Simulate fluid distortion with skew
        transform = `skewX(${(mouseX - 50) * intensity * 0.1}deg) skewY(${(mouseY - 50) * intensity * 0.1}deg)`
        break
    }
  }
  
  return {
    backgroundImage,
    backgroundSize: `${cellSize}% ${cellSize}%`,
    backgroundPosition: '0 0',
    opacity: gridOpacity,
    transform,
    filter,
    transition: isMouseActive ? 'transform 0.1s ease-out, filter 0.1s ease-out' : 'transform 0.3s ease-out, filter 0.3s ease-out',
    pointerEvents: 'none' as const
  }
}

const createFallbackImageStyle = (
  imageFit: string,
  imageOpacity: number,
  mousePosition: { x: number; y: number },
  isMouseActive: boolean,
  distortionType: string,
  intensity: number
): React.CSSProperties => {
  let objectFit: React.CSSProperties['objectFit'] = 'cover'
  
  switch (imageFit) {
    case 'contain':
      objectFit = 'contain'
      break
    case 'fill':
      objectFit = 'fill'
      break
    default:
      objectFit = 'cover'
      break
  }
  
  // Add subtle distortion effect to image if mouse is active
  let transform = 'none'
  let filter = 'none'
  
  if (isMouseActive) {
    const mouseX = mousePosition.x
    const mouseY = mousePosition.y
    const distortionIntensity = intensity * 0.5 // Reduce intensity for image
    
    switch (distortionType) {
      case 'magnetic':
        transform = `scale(${1 + distortionIntensity * 0.05})`
        break
      case 'ripple':
        filter = `blur(${distortionIntensity * 0.3}px)`
        break
      case 'vortex':
        transform = `rotate(${distortionIntensity * 2}deg)`
        break
      default: // fluid
        transform = `translate(${(mouseX - 0.5) * distortionIntensity * 10}px, ${(mouseY - 0.5) * distortionIntensity * 10}px)`
        break
    }
  }
  
  return {
    width: '100%',
    height: '100%',
    objectFit,
    opacity: imageOpacity,
    transform,
    filter,
    transition: isMouseActive ? 'transform 0.1s ease-out, filter 0.1s ease-out' : 'transform 0.3s ease-out, filter 0.3s ease-out'
  }
}

// Fullscreen quad geometry data
const createQuadGeometry = () => {
  // Positions for fullscreen quad (clip space coordinates)
  const positions = new Float32Array([
    -1.0, -1.0,  // Bottom left
     1.0, -1.0,  // Bottom right
    -1.0,  1.0,  // Top left
     1.0,  1.0   // Top right
  ])
  
  // UV coordinates for texture mapping
  const texCoords = new Float32Array([
    0.0, 0.0,  // Bottom left
    1.0, 0.0,  // Bottom right
    0.0, 1.0,  // Top left
    1.0, 1.0   // Top right
  ])
  
  return { positions, texCoords }
}

// Quality preset configurations for performance optimization
const qualityPresets: Record<"low" | "medium" | "high", QualityPreset> = {
  low: {
    maxDPR: 1,
    shaderComplexity: "low",
    textureSize: 512,
    enableAdvancedGrid: false,
    enableVelocityEffects: false,
    targetFrameRate: 30
  },
  medium: {
    maxDPR: 1.5,
    shaderComplexity: "medium",
    textureSize: 1024,
    enableAdvancedGrid: true,
    enableVelocityEffects: true,
    targetFrameRate: 45
  },
  high: {
    maxDPR: 2,
    shaderComplexity: "high",
    textureSize: 2048,
    enableAdvancedGrid: true,
    enableVelocityEffects: true,
    targetFrameRate: 60
  }
}

// Performance monitoring utilities with optimizations
const calculateFrameRate = (currentTime: number, lastFrameTime: number): number => {
  const deltaTime = currentTime - lastFrameTime
  // Clamp frame rate to reasonable bounds to prevent extreme values
  const frameRate = deltaTime > 0 ? 1000 / deltaTime : 60
  return Math.min(Math.max(frameRate, 1), 240) // Clamp between 1-240 FPS
}

const updateFrameRateHistory = (history: number[], newFrameRate: number, maxHistorySize: number = 60): number[] => {
  // Use more efficient array manipulation to avoid creating new arrays
  if (history.length >= maxHistorySize) {
    // Shift array in place for better performance
    for (let i = 0; i < maxHistorySize - 1; i++) {
      history[i] = history[i + 1]
    }
    history[maxHistorySize - 1] = newFrameRate
    return history
  } else {
    history.push(newFrameRate)
    return history
  }
}

const calculateAverageFrameRate = (history: number[]): number => {
  if (history.length === 0) return 60
  return history.reduce((sum, rate) => sum + rate, 0) / history.length
}

const shouldAdjustQuality = (
  averageFrameRate: number, 
  targetFrameRate: number, 
  lastQualityChange: number, 
  currentTime: number
): boolean => {
  // Only adjust quality if enough time has passed since last change (prevent oscillation)
  const timeSinceLastChange = currentTime - lastQualityChange
  const minChangeInterval = 3000 // 3 seconds minimum between quality changes
  
  if (timeSinceLastChange < minChangeInterval) return false
  
  // Adjust if performance is significantly below or above target
  const performanceThreshold = 0.8 // 80% of target frame rate
  const upgradeThreshold = 1.1 // 110% of target frame rate
  
  return averageFrameRate < (targetFrameRate * performanceThreshold) || 
         averageFrameRate > (targetFrameRate * upgradeThreshold)
}

const getOptimalQuality = (
  currentQuality: "low" | "medium" | "high", 
  averageFrameRate: number
): "low" | "medium" | "high" => {
  // Determine optimal quality based on current performance
  if (averageFrameRate < 25) {
    return "low"
  } else if (averageFrameRate < 40) {
    return currentQuality === "high" ? "medium" : currentQuality
  } else if (averageFrameRate > 55) {
    return currentQuality === "low" ? "medium" : currentQuality === "medium" ? "high" : "high"
  }
  
  return currentQuality
}

// Device capability detection utilities
const detectDeviceCapabilities = (gl: WebGLRenderingContext): DeviceCapabilities => {
  // Get WebGL limits
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
  const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as [number, number]
  const maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number
  
  // Get supported extensions
  const supportedExtensions = gl.getSupportedExtensions() || []
  
  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Detect low-end devices based on various factors
  const isLowEndDevice = (
    maxTextureSize < 2048 ||
    maxRenderBufferSize < 2048 ||
    (navigator as any).hardwareConcurrency < 4 ||
    (navigator as any).deviceMemory < 4 ||
    isMobile
  )
  
  return {
    maxTextureSize,
    maxViewportDims,
    maxRenderBufferSize,
    supportedExtensions,
    isMobile,
    isLowEndDevice
  }
}

const getOptimalTextureSize = (
  originalWidth: number, 
  originalHeight: number, 
  qualityPreset: QualityPreset, 
  deviceCapabilities: DeviceCapabilities
): { width: number; height: number } => {
  // Start with quality preset texture size
  let maxSize = Math.min(qualityPreset.textureSize, deviceCapabilities.maxTextureSize)
  
  // Further reduce for low-end devices
  if (deviceCapabilities.isLowEndDevice) {
    maxSize = Math.min(maxSize, 1024)
  }
  
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight
  
  // Determine optimal dimensions while maintaining aspect ratio
  let optimalWidth: number
  let optimalHeight: number
  
  if (aspectRatio > 1) {
    // Landscape orientation
    optimalWidth = Math.min(originalWidth, maxSize)
    optimalHeight = Math.round(optimalWidth / aspectRatio)
  } else {
    // Portrait or square orientation
    optimalHeight = Math.min(originalHeight, maxSize)
    optimalWidth = Math.round(optimalHeight * aspectRatio)
  }
  
  // Ensure dimensions don't exceed device limits
  optimalWidth = Math.min(optimalWidth, deviceCapabilities.maxTextureSize)
  optimalHeight = Math.min(optimalHeight, deviceCapabilities.maxTextureSize)
  
  return { width: optimalWidth, height: optimalHeight }
}

const getOptimalCanvasResolution = (
  containerWidth: number,
  containerHeight: number,
  qualityPreset: QualityPreset,
  deviceCapabilities: DeviceCapabilities
): { width: number; height: number; dpr: number } => {
  // Get device pixel ratio
  const deviceDPR = window.devicePixelRatio || 1
  
  // Apply quality-based DPR capping
  let cappedDPR = Math.min(deviceDPR, qualityPreset.maxDPR)
  
  // Further reduce DPR for low-end devices
  if (deviceCapabilities.isLowEndDevice) {
    cappedDPR = Math.min(cappedDPR, 1.25)
  }
  
  // Calculate target canvas dimensions
  let targetWidth = containerWidth * cappedDPR
  let targetHeight = containerHeight * cappedDPR
  
  // Ensure dimensions don't exceed device viewport limits
  const [maxViewportWidth, maxViewportHeight] = deviceCapabilities.maxViewportDims
  
  if (targetWidth > maxViewportWidth || targetHeight > maxViewportHeight) {
    const scaleX = maxViewportWidth / targetWidth
    const scaleY = maxViewportHeight / targetHeight
    const scale = Math.min(scaleX, scaleY)
    
    targetWidth *= scale
    targetHeight *= scale
    cappedDPR *= scale
  }
  
  return {
    width: Math.floor(targetWidth),
    height: Math.floor(targetHeight),
    dpr: cappedDPR
  }
}

// Error boundary component for graceful error handling
class ReactBitsGridDistortionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackProps: ReactBitsGridDistortionProps },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallbackProps: ReactBitsGridDistortionProps }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ReactBitsGridDistortion Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const { fallbackProps } = this.props
      
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: fallbackProps.backgroundColor || "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontFamily: "inherit",
            position: "relative",
            ...fallbackProps.style
          }}
          aria-label={fallbackProps.ariaLabel || "Grid distortion component error"}
        >
          {/* Show image if available */}
          {fallbackProps.imageSrc && (
            <img
              src={fallbackProps.imageSrc}
              alt="Fallback content"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: fallbackProps.imageFit === "contain" ? "contain" : 
                          fallbackProps.imageFit === "fill" ? "fill" : "cover",
                opacity: (fallbackProps.imageOpacity || 1) * 0.5,
                filter: "grayscale(50%)"
              }}
            />
          )}
          
          {/* Error message overlay */}
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderRadius: "8px",
              zIndex: 1
            }}
          >
            <div style={{ marginBottom: "10px", fontSize: "16px" }}>⚠️ Component Error</div>
            <div style={{ fontSize: "14px", opacity: 0.7, marginBottom: "10px" }}>
              The grid distortion component encountered an error
            </div>
            <div style={{ fontSize: "12px", opacity: 0.5 }}>
              {this.state.error?.message || "Unknown error occurred"}
            </div>
          </div>
          
          {/* Error indicator */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "rgba(255, 0, 0, 0.8)",
              color: "#ffffff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontFamily: "monospace",
              fontWeight: "bold"
            }}
          >
            ERROR BOUNDARY
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Default props
const defaultProps: Partial<ReactBitsGridDistortionProps> = {
  imageSrc: "",
  imageOpacity: 1,
  imageFit: "cover",
  distortionType: "fluid",
  intensity: 0.5,
  radius: 0.3,
  falloff: 0.8,
  magneticStrength: 1.0,
  magneticPolarity: 1.0,
  rippleFrequency: 10.0,
  rippleAmplitude: 0.5,
  rippleDecay: 2.0,
  vortexStrength: 2.0,
  vortexTightness: 1.0,
  gridSize: 20,
  gridOpacity: 0.3,
  gridColor: "#ffffff",
  gridThickness: 1,
  showGrid: true,
  gridBlendMode: "normal",
  gridDistortionMode: "follow",
  mouseEasing: 0.1,
  autoAnimation: false,
  animationSpeed: 1,
  interactionRadius: 0.3,
  interactionFalloff: 0.8,
  velocityInfluence: 0.5,
  mouseSmoothing: 0.8,
  backgroundColor: "#000000",
  blendMode: "normal",
  quality: "medium",
  showPerformanceInfo: false,
  ariaLabel: "Interactive grid distortion effect"
}

/**
 * ReactBitsGridDistortion Core Component
 * 
 * A high-performance WebGL-based component that creates interactive grid distortion effects
 * inspired by the ReactBits example. Features multiple distortion algorithms, customizable
 * grid overlays, and smooth mouse interactions.
 * 
 * @component
 * @example
 * ```tsx
 * <ReactBitsGridDistortion
 *   imageSrc="https://example.com/image.jpg"
 *   distortionType="fluid"
 *   intensity={0.7}
 *   showGrid={true}
 *   gridColor="#ffffff"
 *   autoAnimation={false}
 * />
 * ```
 * 
 * @param props - Component properties
 * @param props.imageSrc - URL of the background image to distort
 * @param props.distortionType - Type of distortion effect: "fluid", "magnetic", "ripple", or "vortex"
 * @param props.intensity - Overall strength of the distortion effect (0-1)
 * @param props.radius - Size of the distortion area around the mouse (0-1)
 * @param props.falloff - How quickly distortion fades from center to edge (0.1-5)
 * @param props.showGrid - Whether to display the procedural grid overlay
 * @param props.gridColor - Color of the grid lines
 * @param props.gridSize - Number of grid lines across the component (5-100)
 * @param props.gridOpacity - Transparency of the grid lines (0-1)
 * @param props.autoAnimation - Enable automatic animation when mouse is not active
 * @param props.quality - Rendering quality: "low", "medium", or "high"
 * @param props.ariaLabel - Accessible description for screen readers
 * 
 * @returns JSX element containing the interactive distortion effect
 */
function ReactBitsGridDistortionCore(props: ReactBitsGridDistortionProps) {
  // Merge props with defaults
  const {
    imageSrc,
    imageOpacity,
    imageFit,
    distortionType,
    intensity,
    radius,
    falloff,
    magneticStrength,
    magneticPolarity,
    rippleFrequency,
    rippleAmplitude,
    rippleDecay,
    vortexStrength,
    vortexTightness,
    gridSize,
    gridOpacity,
    gridColor,
    gridThickness,
    showGrid,
    gridBlendMode,
    gridDistortionMode,
    mouseEasing,
    autoAnimation,
    animationSpeed,
    interactionRadius,
    interactionFalloff,
    velocityInfluence,
    mouseSmoothing,
    backgroundColor,
    blendMode,
    quality,
    showPerformanceInfo,
    ariaLabel,
    className,
    style
  } = { ...defaultProps, ...props }

  // Refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>(0)
  
  const [webglState, setWebglState] = useState<WebGLContextState>({
    gl: null,
    canvas: null,
    program: null,
    vertexBuffer: null,
    texture: null,
    isInitialized: false,
    hasError: false,
    errorMessage: "",
    isContextLost: false,
    contextLossCount: 0,
    lastContextLossTime: 0
  })

  const [contextRecoveryState, setContextRecoveryState] = useState<ContextRecoveryState>({
    isRecovering: false,
    recoveryAttempts: 0,
    maxRecoveryAttempts: 3,
    lastRecoveryTime: 0,
    recoveryDelay: 1000, // Start with 1 second delay
    preservedState: {
      mouseState: null,
      performanceState: null,
      textureSource: null,
      dimensions: null
    }
  })

  const [fallbackState, setFallbackState] = useState<FallbackState>({
    isActive: false,
    reason: "webgl_unavailable",
    showGrid: true,
    gridAnimationEnabled: false,
    mousePosition: { x: 0.5, y: 0.5 },
    isMouseActive: false
  })
  
  const [textureState, setTextureState] = useState<TextureState>({
    texture: null,
    image: null,
    isLoading: false,
    isLoaded: false,
    hasError: false,
    errorMessage: "",
    width: 0,
    height: 0
  })
  
  const [mouseState, setMouseState] = useState<MouseState>({
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    isActive: false,
    lastMoveTime: 0
  })

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    frameCount: 0,
    lastFrameTime: performance.now(),
    frameRate: 60,
    averageFrameRate: 60,
    frameRateHistory: [],
    isPerformanceGood: true,
    adaptiveQuality: quality || "medium",
    lastQualityChange: performance.now()
  })

  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null)

  // Enhanced texture loading hook with improved error handling and retry logic
  const loadTexture = useCallback(async (src: string, retryCount: number = 0) => {
    const maxRetries = 3
    const retryDelay = 1000 * Math.pow(2, retryCount) // Exponential backoff
    
    if (!src || src.trim() === "") {
      // Clear texture if no source provided
      setTextureState(prev => ({
        ...prev,
        texture: null,
        image: null,
        isLoading: false,
        isLoaded: false,
        hasError: false,
        errorMessage: "",
        width: 0,
        height: 0
      }))
      return
    }

    // Set loading state
    setTextureState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      errorMessage: ""
    }))

    try {
      // Load image with timeout and retry logic
      const image = await loadImage(src)
      
      // Validate image dimensions
      if (image.width === 0 || image.height === 0) {
        throw new Error("Invalid image dimensions")
      }
      
      // Check if image is too large for device capabilities
      if (deviceCapabilities) {
        const maxSize = deviceCapabilities.maxTextureSize
        if (image.width > maxSize || image.height > maxSize) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Image size (${image.width}x${image.height}) exceeds device limit (${maxSize}x${maxSize}), will be resized`)
          }
        }
      }
      
      // Create texture if WebGL is available
      let texture: WebGLTexture | null = null
      if (webglState.gl && !webglState.isContextLost) {
        const qualityPreset = qualityPresets[performanceState.adaptiveQuality]
        texture = createTextureFromImage(webglState.gl, image, qualityPreset, deviceCapabilities || undefined)
      }

      // Update texture state
      setTextureState({
        texture,
        image,
        isLoading: false,
        isLoaded: true,
        hasError: false,
        errorMessage: "",
        width: image.width,
        height: image.height
      })

      // Update WebGL state with new texture
      setWebglState(prev => ({
        ...prev,
        texture
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown texture loading error"
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (
        errorMessage.includes("Failed to load image") || 
        errorMessage.includes("timeout") ||
        errorMessage.includes("network")
      )) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Texture loading failed (attempt ${retryCount + 1}/${maxRetries + 1}), retrying in ${retryDelay}ms...`)
        }
        
        setTimeout(() => {
          loadTexture(src, retryCount + 1)
        }, retryDelay)
        return
      }
      
      setTextureState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        errorMessage
      }))

      if (process.env.NODE_ENV === 'development') {
        console.error("Texture loading failed:", error)
      }
      
      // Create placeholder texture as fallback
      if (webglState.gl && !webglState.isContextLost && deviceCapabilities) {
        try {
          const qualityPreset = qualityPresets[performanceState.adaptiveQuality]
          const optimalSize = Math.min(qualityPreset.textureSize, deviceCapabilities.maxTextureSize, 512)
          const placeholderTexture = createPlaceholderTexture(webglState.gl, optimalSize, optimalSize)
          setTextureState(prev => ({
            ...prev,
            texture: placeholderTexture,
            width: optimalSize,
            height: optimalSize,
            hasError: false // Clear error since we have a fallback
          }))
          setWebglState(prev => ({
            ...prev,
            texture: placeholderTexture
          }))
        } catch (placeholderError) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Failed to create placeholder texture:", placeholderError)
          }
        }
      }
    }
  }, [webglState.gl, webglState.isContextLost, performanceState.adaptiveQuality, deviceCapabilities])

  // Create and setup vertex buffer with quad geometry
  const setupVertexBuffer = useCallback((gl: WebGLRenderingContext, program: WebGLProgram) => {
    const { positions, texCoords } = createQuadGeometry()
    
    // Create vertex buffer
    const vertexBuffer = gl.createBuffer()
    if (!vertexBuffer) {
      throw new Error("Failed to create vertex buffer")
    }
    
    // Bind and upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    
    // Get attribute locations
    const positionLocation = gl.getAttribLocation(program, "a_position")
    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord")
    
    if (positionLocation === -1 || texCoordLocation === -1) {
      throw new Error("Failed to get attribute locations")
    }
    
    // Set up position attribute
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    
    // Create and setup texture coordinate buffer
    const texCoordBuffer = gl.createBuffer()
    if (!texCoordBuffer) {
      throw new Error("Failed to create texture coordinate buffer")
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
    
    // Set up texture coordinate attribute
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)
    
    return vertexBuffer
  }, [])

  // WebGL initialization function
  const initializeWebGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      activateFallbackMode("initialization_failed", setFallbackState, setWebglState)
      return false
    }

    // Check WebGL support before attempting initialization
    if (!checkWebGLSupport()) {
      activateFallbackMode("webgl_unavailable", setFallbackState, setWebglState)
      return false
    }

    try {
      // Get WebGL context with proper typing
      const gl = canvas.getContext("webgl") as WebGLRenderingContext | null
      
      if (!gl) {
        activateFallbackMode("webgl_unavailable", setFallbackState, setWebglState)
        return false
      }

      // Check for required extensions
      const requiredExtensions = ["OES_texture_float"]
      // Check for optional extensions that improve performance
      const optionalExtensions = ["OES_texture_float", "WEBGL_lose_context"]
      for (const ext of optionalExtensions) {
        if (!gl.getExtension(ext) && process.env.NODE_ENV === 'development') {
          console.warn(`WebGL extension ${ext} not available, using fallback`)
        }
      }

      // Set up WebGL context
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // Create shader program with error handling and fallback
      let shaderProgram: ShaderProgram
      try {
        shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource)
        
        // Validate the program
        if (!validateShaderProgram(gl, shaderProgram.program)) {
          throw new Error("Shader program validation failed")
        }
      } catch (shaderError) {
        console.warn("Main shader compilation failed, using fallback:", shaderError)
        try {
          shaderProgram = createShaderProgram(gl, fallbackVertexShader, fallbackFragmentShader)
        } catch (fallbackError) {
          throw new Error(`Both main and fallback shader compilation failed: ${fallbackError}`)
        }
      }

      // Setup vertex buffer with the compiled program
      const vertexBuffer = setupVertexBuffer(gl, shaderProgram.program)

      // Detect device capabilities for optimization
      const capabilities = detectDeviceCapabilities(gl)
      setDeviceCapabilities(capabilities)

      setWebglState({
        gl,
        canvas,
        program: shaderProgram.program,
        vertexBuffer,
        texture: null, // Will be set by texture loading
        isInitialized: true,
        hasError: false,
        errorMessage: "",
        isContextLost: false,
        contextLossCount: 0,
        lastContextLossTime: 0
      })

      return true
    } catch (error) {
      console.error("WebGL initialization failed:", error)
      activateFallbackMode("initialization_failed", setFallbackState, setWebglState)
      return false
    }
  }, [setupVertexBuffer])

  // Enhanced canvas resize with adaptive DPR, resolution management, and debouncing
  const handleResize = useCallback(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    
    if (!container || !canvas || !deviceCapabilities) return

    const rect = container.getBoundingClientRect()
    
    // Skip resize if dimensions are invalid
    if (rect.width <= 0 || rect.height <= 0) return
    
    // Use adaptive quality if performance monitoring is enabled, otherwise use manual quality setting
    const effectiveQuality = performanceState.adaptiveQuality
    const qualityPreset = qualityPresets[effectiveQuality]
    
    // Get optimal canvas resolution based on device capabilities and quality
    const optimalResolution = getOptimalCanvasResolution(
      rect.width,
      rect.height,
      qualityPreset,
      deviceCapabilities
    )
    
    const width = rect.width
    const height = rect.height

    // Only update if dimensions have actually changed (avoid unnecessary updates)
    const currentDimensions = dimensions
    if (Math.abs(currentDimensions.width - width) < 1 && Math.abs(currentDimensions.height - height) < 1) {
      return
    }

    // Set canvas size with optimal resolution for performance
    canvas.width = optimalResolution.width
    canvas.height = optimalResolution.height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    setDimensions({ width, height })

    // Update WebGL viewport with error handling
    if (webglState.gl && !webglState.isContextLost) {
      try {
        webglState.gl.viewport(0, 0, canvas.width, canvas.height)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to update WebGL viewport:', error)
        }
      }
    }
  }, [performanceState.adaptiveQuality, webglState.gl, webglState.isContextLost, deviceCapabilities, dimensions])

  // Debounced resize handler to prevent excessive resize operations
  const debouncedHandleResize = useCallback(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100) // 100ms debounce
    }
  }, [handleResize])()

  // Enhanced mouse event handlers with advanced tracking and edge case handling
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    
    // Handle edge case where rect dimensions are zero
    if (rect.width === 0 || rect.height === 0) return
    
    // Clamp coordinates to valid range and handle edge cases
    const rawX = (event.clientX - rect.left) / rect.width
    const rawY = 1.0 - (event.clientY - rect.top) / rect.height // Flip Y for WebGL
    
    const x = Math.max(0, Math.min(1, rawX)) // Clamp to [0, 1]
    const y = Math.max(0, Math.min(1, rawY)) // Clamp to [0, 1]

    const now = performance.now()
    
    setMouseState(prev => {
      const dt = Math.max(now - prev.lastMoveTime, 1) // Prevent division by zero
      const dx = x - prev.target.x
      const dy = y - prev.target.y
      
      // Handle edge case where movement is too large (likely a jump)
      const maxMovement = 0.5 // Maximum reasonable movement per frame
      if (Math.abs(dx) > maxMovement || Math.abs(dy) > maxMovement) {
        // Reset position instead of calculating velocity for large jumps
        return {
          current: { x, y },
          target: { x, y },
          velocity: { x: 0, y: 0 },
          isActive: true,
          lastMoveTime: now
        }
      }
      
      // Calculate velocity with smoothing to prevent jitter
      const velocitySmoothing = Math.max(0.1, Math.min(0.95, mouseSmoothing || 0.8))
      const newVelocityX = (dx / dt) * 1000 // Convert to pixels per second
      const newVelocityY = (dy / dt) * 1000
      
      // Clamp velocity to reasonable bounds
      const maxVelocity = 5000 // Maximum velocity in pixels per second
      const clampedNewVelocityX = Math.max(-maxVelocity, Math.min(maxVelocity, newVelocityX))
      const clampedNewVelocityY = Math.max(-maxVelocity, Math.min(maxVelocity, newVelocityY))
      
      const smoothedVelocityX = prev.velocity.x * velocitySmoothing + clampedNewVelocityX * (1 - velocitySmoothing)
      const smoothedVelocityY = prev.velocity.y * velocitySmoothing + clampedNewVelocityY * (1 - velocitySmoothing)
      
      return {
        current: prev.current, // Will be updated in animation loop
        target: { x, y },
        velocity: { 
          x: smoothedVelocityX, 
          y: smoothedVelocityY 
        },
        isActive: true,
        lastMoveTime: now
      }
    })
  }, [mouseSmoothing])

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = 1.0 - (event.clientY - rect.top) / rect.height // Flip Y for WebGL

    setMouseState(prev => ({
      ...prev,
      current: { x, y }, // Set initial position to prevent jump
      target: { x, y },
      velocity: { x: 0, y: 0 }, // Reset velocity on enter
      isActive: true,
      lastMoveTime: performance.now()
    }))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseState(prev => ({
      ...prev,
      isActive: false,
      velocity: { x: 0, y: 0 } // Reset velocity on leave
    }))
  }, [])

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas || event.touches.length === 0) return

    const rect = canvas.getBoundingClientRect()
    const touch = event.touches[0]
    const x = (touch.clientX - rect.left) / rect.width
    const y = 1.0 - (touch.clientY - rect.top) / rect.height // Flip Y for WebGL

    setMouseState(prev => ({
      ...prev,
      current: { x, y },
      target: { x, y },
      velocity: { x: 0, y: 0 },
      isActive: true,
      lastMoveTime: performance.now()
    }))
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas || event.touches.length === 0) return

    const rect = canvas.getBoundingClientRect()
    const touch = event.touches[0]
    const x = (touch.clientX - rect.left) / rect.width
    const y = 1.0 - (touch.clientY - rect.top) / rect.height // Flip Y for WebGL

    const now = performance.now()
    
    setMouseState(prev => {
      const dt = Math.max(now - prev.lastMoveTime, 1)
      const dx = x - prev.target.x
      const dy = y - prev.target.y
      
      // Calculate velocity with smoothing
      const velocitySmoothing = mouseSmoothing || 0.8
      const newVelocityX = (dx / dt) * 1000
      const newVelocityY = (dy / dt) * 1000
      
      const smoothedVelocityX = prev.velocity.x * velocitySmoothing + newVelocityX * (1 - velocitySmoothing)
      const smoothedVelocityY = prev.velocity.y * velocitySmoothing + newVelocityY * (1 - velocitySmoothing)
      
      return {
        current: prev.current,
        target: { x, y },
        velocity: { 
          x: smoothedVelocityX, 
          y: smoothedVelocityY 
        },
        isActive: true,
        lastMoveTime: now
      }
    })
  }, [])

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    setMouseState(prev => ({
      ...prev,
      isActive: false,
      velocity: { x: 0, y: 0 }
    }))
  }, [])

  /**
   * Keyboard event handler for accessibility
   * Allows keyboard users to interact with the distortion effect using arrow keys
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Only handle arrow keys and space
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      return
    }

    event.preventDefault()

    setMouseState(prev => {
      let newX = prev.target.x
      let newY = prev.target.y
      const step = 0.05 // Movement step size

      switch (event.key) {
        case 'ArrowLeft':
          newX = Math.max(0, prev.target.x - step)
          break
        case 'ArrowRight':
          newX = Math.min(1, prev.target.x + step)
          break
        case 'ArrowUp':
          newY = Math.min(1, prev.target.y + step) // Y is flipped for WebGL
          break
        case 'ArrowDown':
          newY = Math.max(0, prev.target.y - step) // Y is flipped for WebGL
          break
        case ' ':
          // Space key toggles interaction at center
          newX = 0.5
          newY = 0.5
          break
      }

      return {
        ...prev,
        target: { x: newX, y: newY },
        isActive: true,
        lastMoveTime: performance.now()
      }
    })
  }, [])

  /**
   * Keyboard event handler for when focus is lost
   */
  const handleKeyUp = useCallback((event: React.KeyboardEvent<HTMLCanvasElement>) => {
    // Deactivate interaction when keys are released
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      setMouseState(prev => ({
        ...prev,
        isActive: false,
        velocity: { x: 0, y: 0 }
      }))
    }
  }, [])

  /**
   * Focus event handler for accessibility
   */
  const handleFocus = useCallback(() => {
    // Announce focus to screen readers
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setAttribute('aria-live', 'polite')
    }
  }, [])

  /**
   * Blur event handler for accessibility
   */
  const handleBlur = useCallback(() => {
    // Deactivate interaction when focus is lost
    setMouseState(prev => ({
      ...prev,
      isActive: false,
      velocity: { x: 0, y: 0 }
    }))
  }, [])

  // Fallback mode mouse event handlers
  const handleFallbackMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    setFallbackState(prev => ({
      ...prev,
      mousePosition: { x, y },
      isMouseActive: true
    }))
  }, [])

  const handleFallbackMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    setFallbackState(prev => ({
      ...prev,
      mousePosition: { x, y },
      isMouseActive: true
    }))
  }, [])

  const handleFallbackMouseLeave = useCallback(() => {
    setFallbackState(prev => ({
      ...prev,
      isMouseActive: false
    }))
  }, [])

  // Animation loop with shader rendering and performance monitoring
  const animate = useCallback(() => {
    if (!webglState.gl || !webglState.program || !webglState.isInitialized) return

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion && autoAnimation) {
      // Skip auto-animation if user prefers reduced motion
      return
    }

    const gl = webglState.gl
    const program = webglState.program
    const currentTime = performance.now()

    // Update performance monitoring
    setPerformanceState(prev => {
      const frameRate = calculateFrameRate(currentTime, prev.lastFrameTime)
      const newFrameRateHistory = updateFrameRateHistory(prev.frameRateHistory, frameRate)
      const averageFrameRate = calculateAverageFrameRate(newFrameRateHistory)
      
      // Get current quality preset for target frame rate
      const currentQualityPreset = qualityPresets[prev.adaptiveQuality]
      const targetFrameRate = currentQualityPreset.targetFrameRate
      
      // Determine if performance is good based on target
      const isPerformanceGood = averageFrameRate >= (targetFrameRate * 0.8)
      
      // Check if quality should be adjusted
      let newAdaptiveQuality = prev.adaptiveQuality
      let newLastQualityChange = prev.lastQualityChange
      
      if (shouldAdjustQuality(averageFrameRate, targetFrameRate, prev.lastQualityChange, currentTime)) {
        const optimalQuality = getOptimalQuality(prev.adaptiveQuality, averageFrameRate)
        if (optimalQuality !== prev.adaptiveQuality) {
          newAdaptiveQuality = optimalQuality
          newLastQualityChange = currentTime
          if (process.env.NODE_ENV === 'development') {
            console.log(`Adaptive quality changed from ${prev.adaptiveQuality} to ${optimalQuality} (FPS: ${averageFrameRate.toFixed(1)})`)
          }
        }
      }
      
      return {
        frameCount: prev.frameCount + 1,
        lastFrameTime: currentTime,
        frameRate,
        averageFrameRate,
        frameRateHistory: newFrameRateHistory,
        isPerformanceGood,
        adaptiveQuality: newAdaptiveQuality,
        lastQualityChange: newLastQualityChange
      }
    })

    // Get current quality preset for rendering optimizations
    const qualityPreset = qualityPresets[performanceState.adaptiveQuality]

    // Enhanced mouse position update with smooth easing
    setMouseState(prev => {
      const easingFactor = mouseEasing || 0.1
      const now = performance.now()
      const timeSinceLastMove = now - prev.lastMoveTime
      
      // Apply different easing based on mouse activity
      let currentEasing = easingFactor
      
      // If mouse hasn't moved for a while, gradually reduce influence
      if (timeSinceLastMove > 100) { // 100ms threshold
        const fadeOutFactor = Math.max(0.1, 1 - (timeSinceLastMove - 100) / 2000) // Fade over 2 seconds
        currentEasing *= fadeOutFactor
      }
      
      // Calculate new current position with enhanced easing
      const newCurrentX = prev.current.x + (prev.target.x - prev.current.x) * currentEasing
      const newCurrentY = prev.current.y + (prev.target.y - prev.current.y) * currentEasing
      
      // Update velocity based on actual movement (for momentum effects)
      const actualVelocityX = (newCurrentX - prev.current.x) * 60 // Approximate 60fps
      const actualVelocityY = (newCurrentY - prev.current.y) * 60
      
      return {
        ...prev,
        current: {
          x: newCurrentX,
          y: newCurrentY
        },
        // Blend actual movement velocity with input velocity for smoother effects
        velocity: {
          x: prev.velocity.x * 0.9 + actualVelocityX * 0.1,
          y: prev.velocity.y * 0.9 + actualVelocityY * 0.1
        }
      }
    })

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Use shader program
    gl.useProgram(program)

    // Update uniforms
    const time = performance.now() * 0.001 // Convert to seconds
    
    // Use cached uniform locations for better performance
    // Note: In a production version, these would be cached in state to avoid repeated lookups
    const uniformLocations = {
      uResolution: gl.getUniformLocation(program, "u_resolution"),
      uMouse: gl.getUniformLocation(program, "u_mouse"),
      uTime: gl.getUniformLocation(program, "u_time"),
      uIntensity: gl.getUniformLocation(program, "u_intensity"),
      uRadius: gl.getUniformLocation(program, "u_radius"),
      uFalloff: gl.getUniformLocation(program, "u_falloff"),
      uInteractionRadius: gl.getUniformLocation(program, "u_interactionRadius"),
      uInteractionFalloff: gl.getUniformLocation(program, "u_interactionFalloff"),
      uVelocityInfluence: gl.getUniformLocation(program, "u_velocityInfluence"),
      uVelocity: gl.getUniformLocation(program, "u_velocity"),
      uMouseActive: gl.getUniformLocation(program, "u_mouseActive"),
      uTexture: gl.getUniformLocation(program, "u_texture"),
      uHasTexture: gl.getUniformLocation(program, "u_hasTexture"),
      uImageOpacity: gl.getUniformLocation(program, "u_imageOpacity"),
      uImageResolution: gl.getUniformLocation(program, "u_imageResolution"),
      uCanvasResolution: gl.getUniformLocation(program, "u_canvasResolution"),
      uImageFit: gl.getUniformLocation(program, "u_imageFit"),
      uDistortionType: gl.getUniformLocation(program, "u_distortionType"),
      uMagneticStrength: gl.getUniformLocation(program, "u_magneticStrength"),
      uMagneticPolarity: gl.getUniformLocation(program, "u_magneticPolarity"),
      uRippleFrequency: gl.getUniformLocation(program, "u_rippleFrequency"),
      uRippleAmplitude: gl.getUniformLocation(program, "u_rippleAmplitude"),
      uRippleDecay: gl.getUniformLocation(program, "u_rippleDecay"),
      uVortexStrength: gl.getUniformLocation(program, "u_vortexStrength"),
      uVortexTightness: gl.getUniformLocation(program, "u_vortexTightness"),
      uShowGrid: gl.getUniformLocation(program, "u_showGrid"),
      uGridSize: gl.getUniformLocation(program, "u_gridSize"),
      uGridOpacity: gl.getUniformLocation(program, "u_gridOpacity"),
      uGridColor: gl.getUniformLocation(program, "u_gridColor"),
      uGridThickness: gl.getUniformLocation(program, "u_gridThickness"),
      uGridBlendMode: gl.getUniformLocation(program, "u_gridBlendMode"),
      uGridDistortionMode: gl.getUniformLocation(program, "u_gridDistortionMode"),
      uAutoAnimation: gl.getUniformLocation(program, "u_autoAnimation"),
      uAnimationSpeed: gl.getUniformLocation(program, "u_animationSpeed")
    }

    // Set uniform values with optimized checks
    const { 
      uResolution, uMouse, uTime, uIntensity, uRadius, uFalloff,
      uInteractionRadius, uInteractionFalloff, uVelocityInfluence, uVelocity, uMouseActive
    } = uniformLocations
    
    if (uResolution) gl.uniform2f(uResolution, dimensions.width, dimensions.height)
    if (uMouse) gl.uniform2f(uMouse, mouseState.current.x, mouseState.current.y)
    if (uTime) gl.uniform1f(uTime, time)
    if (uIntensity) gl.uniform1f(uIntensity, intensity || 0.5)
    if (uRadius) gl.uniform1f(uRadius, radius || 0.3)
    if (uFalloff) gl.uniform1f(uFalloff, falloff || 0.8)
    if (uInteractionRadius) gl.uniform1f(uInteractionRadius, interactionRadius || 0.3)
    if (uInteractionFalloff) gl.uniform1f(uInteractionFalloff, interactionFalloff || 0.8)
    
    // Apply velocity effects based on quality preset for performance optimization
    const effectiveVelocityInfluence = qualityPreset.enableVelocityEffects ? (velocityInfluence || 0.5) : 0
    if (uVelocityInfluence) gl.uniform1f(uVelocityInfluence, effectiveVelocityInfluence)
    if (uVelocity) {
      const effectiveVelocity = qualityPreset.enableVelocityEffects ? mouseState.velocity : { x: 0, y: 0 }
      gl.uniform2f(uVelocity, effectiveVelocity.x, effectiveVelocity.y)
    }
    if (uMouseActive) gl.uniform1i(uMouseActive, mouseState.isActive ? 1 : 0)
    
    // Set texture uniforms with optimized checks
    const { 
      uHasTexture, uImageOpacity, uImageResolution, uCanvasResolution, 
      uImageFit, uDistortionType 
    } = uniformLocations
    
    const hasTexture = textureState.isLoaded && textureState.texture
    if (uHasTexture) gl.uniform1i(uHasTexture, hasTexture ? 1 : 0)
    if (uImageOpacity) gl.uniform1f(uImageOpacity, imageOpacity || 1.0)
    if (uImageResolution) gl.uniform2f(uImageResolution, textureState.width, textureState.height)
    if (uCanvasResolution) gl.uniform2f(uCanvasResolution, dimensions.width, dimensions.height)
    
    // Set image fit mode (convert string to integer) with caching
    const fitModeValue = imageFit === "contain" ? 1 : imageFit === "fill" ? 2 : 0 // default to cover
    if (uImageFit) gl.uniform1i(uImageFit, fitModeValue)
    
    // Set distortion type (convert string to integer) with caching
    const distortionTypeValue = distortionType === "magnetic" ? 1 : distortionType === "ripple" ? 2 : distortionType === "vortex" ? 3 : 0 // default to fluid
    if (uDistortionType) gl.uniform1i(uDistortionType, distortionTypeValue)
    
    // Set magnetic distortion parameters
    const { uMagneticStrength, uMagneticPolarity } = uniformLocations
    if (uMagneticStrength) gl.uniform1f(uMagneticStrength, magneticStrength || 1.0)
    if (uMagneticPolarity) gl.uniform1f(uMagneticPolarity, magneticPolarity || 1.0)
    
    // Set ripple distortion parameters
    const { uRippleFrequency, uRippleAmplitude, uRippleDecay } = uniformLocations
    if (uRippleFrequency) gl.uniform1f(uRippleFrequency, rippleFrequency || 10.0)
    if (uRippleAmplitude) gl.uniform1f(uRippleAmplitude, rippleAmplitude || 0.5)
    if (uRippleDecay) gl.uniform1f(uRippleDecay, rippleDecay || 2.0)
    
    // Set vortex distortion parameters
    const { uVortexStrength, uVortexTightness } = uniformLocations
    if (uVortexStrength) gl.uniform1f(uVortexStrength, vortexStrength || 2.0)
    if (uVortexTightness) gl.uniform1f(uVortexTightness, vortexTightness || 1.0)
    
    // Set grid parameters with quality-based optimizations
    const { 
      uShowGrid, uGridSize, uGridOpacity, uGridThickness, uGridColor, 
      uGridBlendMode, uGridDistortionMode, uAutoAnimation, uAnimationSpeed 
    } = uniformLocations
    
    const effectiveShowGrid = showGrid && (qualityPreset.enableAdvancedGrid || performanceState.isPerformanceGood)
    if (uShowGrid) gl.uniform1i(uShowGrid, effectiveShowGrid ? 1 : 0)
    if (uGridSize) gl.uniform1f(uGridSize, gridSize || 20)
    if (uGridOpacity) gl.uniform1f(uGridOpacity, gridOpacity || 0.3)
    if (uGridThickness) gl.uniform1f(uGridThickness, gridThickness || 1)
    
    // Parse and set grid color
    if (uGridColor) {
      const [r, g, b] = parseColor(gridColor || "#ffffff")
      gl.uniform3f(uGridColor, r, g, b)
    }
    
    // Set grid blend mode (convert string to integer)
    if (uGridBlendMode) {
      const blendModeValue = gridBlendMode === "multiply" ? 1 : 
                            gridBlendMode === "screen" ? 2 : 
                            gridBlendMode === "overlay" ? 3 : 
                            gridBlendMode === "add" ? 4 : 0 // default to normal
      gl.uniform1i(uGridBlendMode, blendModeValue)
    }
    
    // Set grid distortion mode (convert string to integer)
    if (uGridDistortionMode) {
      const distortionModeValue = gridDistortionMode === "none" ? 0 : 
                                 gridDistortionMode === "independent" ? 2 : 1 // default to follow
      gl.uniform1i(uGridDistortionMode, distortionModeValue)
    }
    
    // Set animation uniforms
    if (uAutoAnimation) gl.uniform1i(uAutoAnimation, autoAnimation ? 1 : 0)
    if (uAnimationSpeed) gl.uniform1f(uAnimationSpeed, animationSpeed || 1.0)
    
    // Bind texture if available
    const { uTexture } = uniformLocations
    if (hasTexture && uTexture) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textureState.texture)
      gl.uniform1i(uTexture, 0)
    }

    // Draw fullscreen quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [webglState.gl, webglState.program, webglState.isInitialized, mouseEasing, dimensions, mouseState, intensity, radius, falloff, interactionRadius, interactionFalloff, velocityInfluence, textureState, imageOpacity, imageFit, distortionType, magneticStrength, magneticPolarity, rippleFrequency, rippleAmplitude, rippleDecay, vortexStrength, vortexTightness, showGrid, gridSize, gridOpacity, gridColor, gridThickness, gridBlendMode, gridDistortionMode, autoAnimation, animationSpeed])

  // Initialize WebGL on mount
  useEffect(() => {
    const success = initializeWebGL()
    if (success) {
      handleResize()
    }
  }, [initializeWebGL, handleResize])

  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      handleResize()
    }

    window.addEventListener("resize", handleWindowResize)
    return () => window.removeEventListener("resize", handleWindowResize)
  }, [handleResize])

  // Handle adaptive quality changes - trigger resize to apply new DPR settings
  useEffect(() => {
    if (webglState.isInitialized) {
      handleResize()
    }
  }, [performanceState.adaptiveQuality, webglState.isInitialized, handleResize])

  // Load texture when imageSrc changes
  useEffect(() => {
    if (webglState.isInitialized && imageSrc !== undefined) {
      loadTexture(imageSrc)
    }
  }, [webglState.isInitialized, imageSrc, loadTexture])

  // Start animation loop
  useEffect(() => {
    if (webglState.isInitialized) {
      animate()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [webglState.isInitialized, animate])

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      if (webglState.gl && textureState.texture) {
        cleanupTexture(webglState.gl, textureState.texture)
      }
    }
  }, [webglState.gl, textureState.texture])

  // Enhanced WebGL context loss recovery system
  const handleContextLoss = useCallback((event: Event) => {
    event.preventDefault()
    console.warn("WebGL context lost, attempting recovery...")
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    // Preserve current state for recovery
    const preservedState = preserveStateForRecovery(
      mouseState,
      performanceState,
      imageSrc,
      dimensions
    )
    
    // Update WebGL state to reflect context loss
    setWebglState(prev => ({
      ...prev,
      isInitialized: false,
      isContextLost: true,
      contextLossCount: prev.contextLossCount + 1,
      lastContextLossTime: performance.now(),
      hasError: false, // Don't show error immediately, try recovery first
      errorMessage: ""
    }))
    
    // Update recovery state
    setContextRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      preservedState
    }))
  }, [mouseState, performanceState, imageSrc, dimensions])

  const attemptContextRecovery = useCallback(async () => {
    const currentTime = performance.now()
    
    // Check if we should attempt recovery
    if (!shouldAttemptRecovery(
      webglState.contextLossCount,
      webglState.lastContextLossTime,
      contextRecoveryState.recoveryAttempts,
      contextRecoveryState.maxRecoveryAttempts
    )) {
      console.error("Context recovery failed: maximum attempts exceeded or too many context losses")
      activateFallbackMode("context_loss_permanent", setFallbackState, setWebglState)
      setContextRecoveryState(prev => ({
        ...prev,
        isRecovering: false
      }))
      return
    }
    
    // Calculate delay for this attempt
    const delay = calculateRecoveryDelay(
      contextRecoveryState.recoveryAttempts,
      contextRecoveryState.recoveryDelay
    )
    
    console.log(`Attempting context recovery (attempt ${contextRecoveryState.recoveryAttempts + 1}/${contextRecoveryState.maxRecoveryAttempts}) in ${delay}ms`)
    
    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Update recovery attempt count
    setContextRecoveryState(prev => ({
      ...prev,
      recoveryAttempts: prev.recoveryAttempts + 1,
      lastRecoveryTime: currentTime
    }))
    
    // Attempt to reinitialize WebGL
    try {
      const success = initializeWebGL()
      
      if (success) {
        console.log("WebGL context recovery successful")
        
        // Restore preserved state
        restoreStateAfterRecovery(
          contextRecoveryState.preservedState,
          setMouseState,
          setPerformanceState,
          setDimensions
        )
        
        // Reload texture if it was previously loaded
        if (contextRecoveryState.preservedState.textureSource) {
          loadTexture(contextRecoveryState.preservedState.textureSource)
        }
        
        // Reset recovery state
        setContextRecoveryState(prev => ({
          ...prev,
          isRecovering: false,
          recoveryAttempts: 0,
          preservedState: {
            mouseState: null,
            performanceState: null,
            textureSource: null,
            dimensions: null
          }
        }))
        
        // Update WebGL state to reflect successful recovery
        setWebglState(prev => ({
          ...prev,
          isContextLost: false
        }))
        
        // Trigger resize to ensure proper canvas setup
        handleResize()
        
      } else {
        console.warn(`Context recovery attempt ${contextRecoveryState.recoveryAttempts} failed, will retry...`)
        
        // If this was the last attempt, activate fallback mode
        if (contextRecoveryState.recoveryAttempts >= contextRecoveryState.maxRecoveryAttempts) {
          activateFallbackMode("context_loss_permanent", setFallbackState, setWebglState)
          setContextRecoveryState(prev => ({
            ...prev,
            isRecovering: false
          }))
        } else {
          // Schedule next recovery attempt
          setTimeout(() => attemptContextRecovery(), 100)
        }
      }
    } catch (error) {
      console.error("Error during context recovery:", error)
      
      // If this was the last attempt, activate fallback mode
      if (contextRecoveryState.recoveryAttempts >= contextRecoveryState.maxRecoveryAttempts) {
        activateFallbackMode("context_loss_permanent", setFallbackState, setWebglState)
        setContextRecoveryState(prev => ({
          ...prev,
          isRecovering: false
        }))
      } else {
        // Schedule next recovery attempt
        setTimeout(() => attemptContextRecovery(), 100)
      }
    }
  }, [
    webglState.contextLossCount,
    webglState.lastContextLossTime,
    contextRecoveryState.recoveryAttempts,
    contextRecoveryState.maxRecoveryAttempts,
    contextRecoveryState.recoveryDelay,
    contextRecoveryState.preservedState,
    initializeWebGL,
    loadTexture,
    handleResize
  ])

  const handleContextRestored = useCallback(() => {
    console.log("WebGL context restored event received")
    
    // If we're not already recovering, start recovery process
    if (!contextRecoveryState.isRecovering) {
      setContextRecoveryState(prev => ({
        ...prev,
        isRecovering: true,
        recoveryAttempts: 0
      }))
    }
    
    // Attempt recovery immediately when context is restored
    attemptContextRecovery()
  }, [contextRecoveryState.isRecovering, attemptContextRecovery])

  // Set up context loss event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener("webglcontextlost", handleContextLoss)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLoss)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [handleContextLoss, handleContextRestored])

  // Monitor recovery state and attempt recovery if needed
  useEffect(() => {
    if (contextRecoveryState.isRecovering && !webglState.isInitialized && !webglState.hasError) {
      // Start recovery process if not already started
      const timeSinceLastAttempt = performance.now() - contextRecoveryState.lastRecoveryTime
      if (timeSinceLastAttempt > 1000 || contextRecoveryState.recoveryAttempts === 0) {
        attemptContextRecovery()
      }
    }
  }, [contextRecoveryState.isRecovering, webglState.isInitialized, webglState.hasError, attemptContextRecovery])

  // Cleanup resources on unmount
  // Comprehensive cleanup and optimization on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = 0
      }
      
      // Clean up WebGL resources
      cleanupWebGLResources(webglState)
      
      // Log cleanup completion in development
      if (process.env.NODE_ENV === 'development') {
        console.log('ReactBitsGridDistortion: Component cleanup completed')
      }
    }
  }, [webglState])

  // Render recovery status if context is being recovered
  if (contextRecoveryState.isRecovering) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "inherit",
          ...style
        }}
        aria-label={ariaLabel}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ marginBottom: "10px" }}>🔄 Recovering WebGL Context</div>
          <div style={{ fontSize: "14px", opacity: 0.7 }}>
            Attempt {contextRecoveryState.recoveryAttempts} of {contextRecoveryState.maxRecoveryAttempts}
          </div>
          {webglState.contextLossCount > 1 && (
            <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.5 }}>
              Context lost {webglState.contextLossCount} times
            </div>
          )}
          {/* Show preserved image during recovery if available */}
          {contextRecoveryState.preservedState.textureSource && (
            <img
              src={contextRecoveryState.preservedState.textureSource}
              alt="Preserved content during recovery"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                marginTop: "20px",
                opacity: 0.5,
                filter: "grayscale(50%)"
              }}
            />
          )}
        </div>
      </div>
    )
  }

  // Render comprehensive fallback mode
  if (fallbackState.isActive || webglState.hasError) {
    const gridStyle = showGrid ? generateCSSGridPattern(
      gridSize || 20,
      gridColor || "#ffffff",
      gridThickness || 1,
      gridOpacity || 0.3,
      fallbackState.mousePosition,
      fallbackState.isMouseActive,
      distortionType || "fluid",
      intensity || 0.5
    ) : {}

    const imageStyle = imageSrc ? createFallbackImageStyle(
      imageFit || "cover",
      imageOpacity || 1,
      fallbackState.mousePosition,
      fallbackState.isMouseActive,
      distortionType || "fluid",
      intensity || 0.5
    ) : {}

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor,
          position: "relative",
          overflow: "hidden",
          cursor: fallbackState.isMouseActive ? "none" : "default",
          ...style
        }}
        aria-label={ariaLabel}
        onMouseMove={handleFallbackMouseMove}
        onMouseEnter={handleFallbackMouseEnter}
        onMouseLeave={handleFallbackMouseLeave}
      >
        {/* Background image layer */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Background image"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              ...imageStyle
            }}
            onError={() => {
              console.warn("Fallback image failed to load")
            }}
          />
        )}
        
        {/* CSS Grid overlay */}
        {showGrid && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              ...gridStyle
            }}
          />
        )}
        
        {/* Fallback mode indicator */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 165, 0, 0.8)",
            color: "#000000",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: "bold",
            pointerEvents: "none",
            zIndex: 1000
          }}
        >
          FALLBACK MODE
        </div>
        
        {/* Error information */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#ffffff",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "inherit",
            maxWidth: "300px",
            lineHeight: "1.4",
            pointerEvents: "none"
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            {fallbackState.reason === "webgl_unavailable" && "⚠️ WebGL Not Supported"}
            {fallbackState.reason === "context_loss_permanent" && "🔄 Context Recovery Failed"}
            {fallbackState.reason === "initialization_failed" && "❌ Initialization Failed"}
          </div>
          <div style={{ fontSize: "10px", opacity: 0.8 }}>
            {webglState.errorMessage}
          </div>
          {webglState.contextLossCount > 0 && (
            <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px" }}>
              Context lost {webglState.contextLossCount} times
            </div>
          )}
          <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>
            Using CSS-based rendering with limited interactivity
          </div>
        </div>
        
        {/* Performance info for fallback mode */}
        {showPerformanceInfo && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "10px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "#ffffff",
              padding: "6px",
              borderRadius: "4px",
              fontSize: "10px",
              fontFamily: "monospace",
              lineHeight: "1.3",
              pointerEvents: "none"
            }}
          >
            <div>Mode: CSS Fallback</div>
            <div>Grid: {showGrid ? "CSS" : "Disabled"}</div>
            <div>Mouse: {fallbackState.isMouseActive ? "Active" : "Inactive"}</div>
            <div>Distortion: {distortionType || "fluid"}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        position: "relative",
        overflow: "hidden",
        ...style
      }}
      role="application"
      aria-label={ariaLabel || "Interactive grid distortion effect"}
      aria-live="polite"
      aria-atomic="false"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        role="img"
        aria-label={ariaLabel || "Interactive grid distortion effect"}
        aria-describedby="distortion-description"
        tabIndex={0}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "none",
          touchAction: "none", // Prevent default touch behaviors
          outline: "2px solid transparent", // Ensure focus is visible
          outlineOffset: "2px"
        }}
        onFocus={(e) => {
          e.target.style.outline = "2px solid #0066cc"
          handleFocus()
        }}
        onBlur={(e) => {
          e.target.style.outline = "2px solid transparent"
          handleBlur()
        }}
      />
      
      {/* Hidden description for screen readers */}
      <div
        id="distortion-description"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden"
        }}
        aria-hidden="true"
      >
        Interactive visual effect with {distortionType || "fluid"} distortion. 
        {showGrid && "Grid overlay is enabled. "}
        {autoAnimation ? "Auto-animation is active. " : "Move mouse, touch, or use arrow keys to interact. "}
        {imageSrc ? "Background image is loaded. " : "No background image. "}
        Quality setting: {quality || "medium"}. 
        Keyboard controls: Use arrow keys to move the distortion effect, space bar to center it, tab to focus.
      </div>
      
      {/* Loading indicators */}
      {!webglState.isInitialized && !webglState.hasError && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ffffff",
            fontFamily: "inherit",
            textAlign: "center"
          }}
        >
          Initializing WebGL...
        </div>
      )}
      
      {webglState.isInitialized && textureState.isLoading && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            color: "#ffffff",
            fontFamily: "inherit",
            fontSize: "12px",
            opacity: 0.7
          }}
        >
          Loading image...
        </div>
      )}
      
      {webglState.isInitialized && textureState.hasError && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            color: "#ff6b6b",
            fontFamily: "inherit",
            fontSize: "12px",
            opacity: 0.8
          }}
        >
          Image failed to load
        </div>
      )}
      
      {/* Performance information display */}
      {showPerformanceInfo && webglState.isInitialized && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "#ffffff",
            fontFamily: "monospace",
            fontSize: "11px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "8px",
            borderRadius: "4px",
            lineHeight: "1.4",
            pointerEvents: "none"
          }}
        >
          <div>FPS: {performanceState.frameRate.toFixed(1)} / Avg: {performanceState.averageFrameRate.toFixed(1)}</div>
          <div>Quality: {performanceState.adaptiveQuality} {performanceState.isPerformanceGood ? "✓" : "⚠"}</div>
          {webglState.contextLossCount > 0 && (
            <div style={{ color: "#ffaa00" }}>Context Lost: {webglState.contextLossCount}x</div>
          )}
          {deviceCapabilities && (
            <>
              <div>Max Texture: {deviceCapabilities.maxTextureSize}px</div>
              <div>Device: {deviceCapabilities.isMobile ? "Mobile" : "Desktop"} {deviceCapabilities.isLowEndDevice ? "(Low-end)" : ""}</div>
              <div>Canvas: {dimensions.width}×{dimensions.height}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * ReactBitsGridDistortion Component
 * 
 * A Framer-compatible component that creates interactive grid distortion effects using WebGL.
 * This component wraps the core implementation with error boundaries for robust error handling.
 * 
 * Features:
 * - Multiple distortion algorithms (fluid, magnetic, ripple, vortex)
 * - Customizable procedural grid overlays
 * - Smooth mouse interaction with velocity tracking
 * - Automatic performance optimization
 * - Graceful fallbacks for unsupported browsers
 * - Full accessibility support
 * 
 * @component
 * @param props - All component properties for customization
 * @returns JSX element with error boundary protection
 */
export default function ReactBitsGridDistortion(props: ReactBitsGridDistortionProps) {
  return (
    <ReactBitsGridDistortionErrorBoundary fallbackProps={props}>
      <ReactBitsGridDistortionCore {...props} />
    </ReactBitsGridDistortionErrorBoundary>
  )
}

// Framer property controls with comprehensive organization and validation
addPropertyControls(ReactBitsGridDistortion, {
  // === IMAGE SECTION ===
  imageSrc: {
    type: ControlType.String,
    title: "Image URL",
    placeholder: "Enter image URL...",
    description: "URL of the image to display with distortion effects"
  },
  imageOpacity: {
    type: ControlType.Number,
    title: "Image Opacity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 1,
    description: "Controls the transparency of the background image"
  },
  imageFit: {
    type: ControlType.Enum,
    title: "Image Fit",
    options: ["cover", "contain", "fill"],
    optionTitles: ["Cover", "Contain", "Fill"],
    defaultValue: "cover",
    description: "How the image should fit within the component bounds"
  },
  
  // === DISTORTION SECTION ===
  distortionType: {
    type: ControlType.Enum,
    title: "Distortion Type",
    options: ["fluid", "magnetic", "ripple", "vortex"],
    optionTitles: ["Fluid", "Magnetic", "Ripple", "Vortex"],
    defaultValue: "fluid",
    description: "The type of distortion effect to apply"
  },
  intensity: {
    type: ControlType.Number,
    title: "Intensity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    description: "Overall strength of the distortion effect"
  },
  radius: {
    type: ControlType.Number,
    title: "Radius",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.3,
    description: "Size of the distortion area around the mouse"
  },
  falloff: {
    type: ControlType.Number,
    title: "Falloff",
    min: 0.1,
    max: 5,
    step: 0.1,
    defaultValue: 1,
    description: "How quickly the distortion fades from center to edge"
  },
  
  // === MAGNETIC DISTORTION ===
  magneticStrength: {
    type: ControlType.Number,
    title: "Magnetic Strength",
    min: 0,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    hidden: (props) => props.distortionType !== "magnetic",
    description: "Strength of the magnetic attraction or repulsion"
  },
  magneticPolarity: {
    type: ControlType.Number,
    title: "Magnetic Polarity",
    min: -1,
    max: 1,
    step: 0.1,
    defaultValue: 1,
    hidden: (props) => props.distortionType !== "magnetic",
    description: "1 for attraction, -1 for repulsion, 0 for neutral"
  },
  
  // === RIPPLE DISTORTION ===
  rippleFrequency: {
    type: ControlType.Number,
    title: "Ripple Frequency",
    min: 1,
    max: 50,
    step: 1,
    defaultValue: 15,
    hidden: (props) => props.distortionType !== "ripple",
    description: "Number of ripple waves per unit distance"
  },
  rippleAmplitude: {
    type: ControlType.Number,
    title: "Ripple Amplitude",
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.5,
    hidden: (props) => props.distortionType !== "ripple",
    description: "Height of the ripple waves"
  },
  rippleDecay: {
    type: ControlType.Number,
    title: "Ripple Decay",
    min: 0.1,
    max: 10,
    step: 0.1,
    defaultValue: 2,
    hidden: (props) => props.distortionType !== "ripple",
    description: "How quickly ripples fade with distance"
  },
  
  // === VORTEX DISTORTION ===
  vortexStrength: {
    type: ControlType.Number,
    title: "Vortex Strength",
    min: 0,
    max: 5,
    step: 0.1,
    defaultValue: 1.5,
    hidden: (props) => props.distortionType !== "vortex",
    description: "Rotational strength of the vortex effect"
  },
  vortexTightness: {
    type: ControlType.Number,
    title: "Vortex Tightness",
    min: 0,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    hidden: (props) => props.distortionType !== "vortex",
    description: "How tightly the spiral winds inward"
  },
  
  // === GRID SECTION ===
  showGrid: {
    type: ControlType.Boolean,
    title: "Show Grid",
    defaultValue: true,
    description: "Display the procedural grid overlay"
  },
  gridSize: {
    type: ControlType.Number,
    title: "Grid Size",
    min: 5,
    max: 100,
    step: 1,
    defaultValue: 20,
    hidden: (props) => !props.showGrid,
    description: "Number of grid lines across the component"
  },
  gridOpacity: {
    type: ControlType.Number,
    title: "Grid Opacity",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.3,
    hidden: (props) => !props.showGrid,
    description: "Transparency of the grid lines"
  },
  gridColor: {
    type: ControlType.Color,
    title: "Grid Color",
    defaultValue: "#ffffff",
    hidden: (props) => !props.showGrid,
    description: "Color of the grid lines"
  },
  gridThickness: {
    type: ControlType.Number,
    title: "Grid Thickness",
    min: 0.1,
    max: 5,
    step: 0.1,
    defaultValue: 1,
    hidden: (props) => !props.showGrid,
    description: "Thickness of the grid lines"
  },
  gridBlendMode: {
    type: ControlType.Enum,
    title: "Grid Blend Mode",
    options: ["normal", "multiply", "screen", "overlay", "add"],
    optionTitles: ["Normal", "Multiply", "Screen", "Overlay", "Add"],
    defaultValue: "normal",
    hidden: (props) => !props.showGrid,
    description: "How the grid blends with the background image"
  },
  gridDistortionMode: {
    type: ControlType.Enum,
    title: "Grid Distortion",
    options: ["none", "follow", "independent"],
    optionTitles: ["None", "Follow Image", "Independent"],
    defaultValue: "follow",
    hidden: (props) => !props.showGrid,
    description: "How the grid responds to distortion effects"
  },
  
  // === INTERACTION SECTION ===
  mouseEasing: {
    type: ControlType.Number,
    title: "Mouse Easing",
    min: 0.01,
    max: 1,
    step: 0.01,
    defaultValue: 0.1,
    description: "Smoothness of mouse position interpolation"
  },
  interactionRadius: {
    type: ControlType.Number,
    title: "Interaction Radius",
    min: 0.1,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
    description: "Size of the mouse interaction area"
  },
  interactionFalloff: {
    type: ControlType.Number,
    title: "Interaction Falloff",
    min: 0.1,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    description: "How interaction strength fades with distance"
  },
  velocityInfluence: {
    type: ControlType.Number,
    title: "Velocity Influence",
    min: 0,
    max: 2,
    step: 0.1,
    defaultValue: 0.5,
    description: "How much mouse velocity affects the distortion"
  },
  mouseSmoothing: {
    type: ControlType.Number,
    title: "Mouse Smoothing",
    min: 0.1,
    max: 1,
    step: 0.01,
    defaultValue: 0.8,
    description: "Smoothness of mouse movement tracking"
  },
  
  // === ANIMATION SECTION ===
  autoAnimation: {
    type: ControlType.Boolean,
    title: "Auto Animation",
    defaultValue: false,
    description: "Enable automatic animation when mouse is not active"
  },
  animationSpeed: {
    type: ControlType.Number,
    title: "Animation Speed",
    min: 0.1,
    max: 3,
    step: 0.1,
    defaultValue: 1,
    hidden: (props) => !props.autoAnimation,
    description: "Speed of the automatic animation effects"
  },
  
  // === VISUAL SECTION ===
  backgroundColor: {
    type: ControlType.Color,
    title: "Background Color",
    defaultValue: "#000000",
    description: "Background color when no image is provided"
  },
  blendMode: {
    type: ControlType.Enum,
    title: "Blend Mode",
    options: ["normal", "multiply", "screen", "overlay"],
    optionTitles: ["Normal", "Multiply", "Screen", "Overlay"],
    defaultValue: "normal",
    description: "How the distorted content blends with the background"
  },
  
  // === PERFORMANCE SECTION ===
  quality: {
    type: ControlType.Enum,
    title: "Quality",
    options: ["low", "medium", "high"],
    optionTitles: ["Low", "Medium", "High"],
    defaultValue: "medium",
    description: "Rendering quality vs performance trade-off"
  },
  showPerformanceInfo: {
    type: ControlType.Boolean,
    title: "Show Performance Info",
    defaultValue: false,
    description: "Display frame rate and performance metrics"
  },
  
  // === ACCESSIBILITY SECTION ===
  ariaLabel: {
    type: ControlType.String,
    title: "Accessibility Label",
    placeholder: "Describe the component for screen readers...",
    defaultValue: "Interactive grid distortion effect",
    description: "Accessible description for screen readers"
  }
})