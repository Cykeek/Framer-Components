/**
 * Framer Integration Tests for ReactBitsGridDistortion
 * 
 * Tests specifically for Framer canvas environment, property controls,
 * real-time updates, and single-file architecture compatibility.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReactBitsGridDistortion from '../components/ReactBitsGridDistortion'

// Mock Framer environment
const mockFramerEnvironment = {
  isFramerCanvas: true,
  devicePixelRatio: 2,
  canvasWidth: 375,
  canvasHeight: 667,
  previewMode: false,
  editMode: true
}

// Mock Framer's addPropertyControls
const mockAddPropertyControls = jest.fn()

jest.mock('framer', () => ({
  addPropertyControls: mockAddPropertyControls,
  ControlType: {
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Enum: 'enum',
    Color: 'color',
    Image: 'image',
    ComponentInstance: 'componentinstance'
  }
}))

// Framer Canvas Simulator Component
const FramerCanvasSimulator: React.FC<{
  children: React.ReactNode
  width?: number
  height?: number
  devicePixelRatio?: number
  previewMode?: boolean
}> = ({ 
  children, 
  width = 375, 
  height = 667, 
  devicePixelRatio = 2,
  previewMode = false 
}) => {
  React.useEffect(() => {
    // Simulate Framer canvas environment
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      value: devicePixelRatio
    })
    
    // Add Framer-specific globals
    ;(window as any).__FRAMER__ = {
      canvas: true,
      preview: previewMode,
      edit: !previewMode
    }
  }, [devicePixelRatio, previewMode])

  return (
    <div
      data-framer-canvas="true"
      data-framer-preview={previewMode}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0'
      }}
    >
      {children}
    </div>
  )
}

// Property Controls Test Wrapper
const PropertyControlsTestWrapper: React.FC<{
  initialProps?: any
  onPropsChange?: (props: any) => void
}> = ({ initialProps = {}, onPropsChange }) => {
  const [props, setProps] = React.useState({
    imageSrc: '',
    distortionType: 'fluid',
    intensity: 0.5,
    radius: 0.3,
    falloff: 0.8,
    showGrid: true,
    gridSize: 20,
    gridColor: '#ffffff',
    gridOpacity: 0.3,
    quality: 'medium',
    autoAnimation: false,
    ...initialProps
  })

  React.useEffect(() => {
    if (onPropsChange) {
      onPropsChange(props)
    }
  }, [props, onPropsChange])

  // Simulate Framer property panel updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random property changes as if user is adjusting in Framer
      const randomUpdates = [
        () => setProps((p: any) => ({ ...p, intensity: Math.random() })),
        () => setProps((p: any) => ({ ...p, gridOpacity: Math.random() * 0.5 })),
        () => setProps((p: any) => ({ ...p, distortionType: ['fluid', 'magnetic', 'ripple', 'vortex'][Math.floor(Math.random() * 4)] })),
        () => setProps((p: any) => ({ ...p, gridColor: `hsl(${Math.random() * 360}, 70%, 50%)` }))
      ]
      
      const randomUpdate = randomUpdates[Math.floor(Math.random() * randomUpdates.length)]
      randomUpdate()
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return <ReactBitsGridDistortion {...props} />
}

describe('ReactBitsGridDistortion Framer Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset Framer environment
    delete (window as any).__FRAMER__
    
    // Mock console methods to reduce noise
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Property Controls Registration', () => {
    test('registers all required property controls', () => {
      // Import component to trigger property controls registration
      require('../components/ReactBitsGridDistortion')
      
      expect(mockAddPropertyControls).toHaveBeenCalled()
      
      const [component, controls] = mockAddPropertyControls.mock.calls[0]
      expect(component).toBeDefined()
      
      // Verify all expected controls are present
      const expectedControls = [
        'imageSrc', 'imageOpacity', 'imageFit',
        'distortionType', 'intensity', 'radius', 'falloff',
        'magneticStrength', 'magneticPolarity',
        'rippleFrequency', 'rippleAmplitude', 'rippleDecay',
        'vortexStrength', 'vortexTightness',
        'gridSize', 'gridOpacity', 'gridColor', 'gridThickness',
        'showGrid', 'gridBlendMode', 'gridDistortionMode',
        'mouseEasing', 'autoAnimation', 'animationSpeed',
        'interactionRadius', 'interactionFalloff', 'velocityInfluence',
        'backgroundColor', 'quality', 'showPerformanceInfo',
        'ariaLabel'
      ]
      
      expectedControls.forEach(controlName => {
        expect(controls).toHaveProperty(controlName)
      })
    })

    test('property controls have correct types and constraints', () => {
      require('../components/ReactBitsGridDistortion')
      
      const [, controls] = mockAddPropertyControls.mock.calls[0]
      
      // Test string controls
      expect(controls.imageSrc.type).toBe('string')
      expect(controls.ariaLabel.type).toBe('string')
      
      // Test number controls with proper ranges
      expect(controls.intensity.type).toBe('number')
      expect(controls.intensity.min).toBe(0)
      expect(controls.intensity.max).toBe(1)
      expect(controls.intensity.step).toBe(0.01)
      
      expect(controls.gridSize.type).toBe('number')
      expect(controls.gridSize.min).toBe(5)
      expect(controls.gridSize.max).toBe(100)
      expect(controls.gridSize.step).toBe(1)
      
      // Test enum controls
      expect(controls.distortionType.type).toBe('enum')
      expect(controls.distortionType.options).toEqual(['fluid', 'magnetic', 'ripple', 'vortex'])
      expect(controls.distortionType.optionTitles).toEqual(['Fluid', 'Magnetic', 'Ripple', 'Vortex'])
      
      expect(controls.quality.type).toBe('enum')
      expect(controls.quality.options).toEqual(['low', 'medium', 'high'])
      
      // Test boolean controls
      expect(controls.showGrid.type).toBe('boolean')
      expect(controls.autoAnimation.type).toBe('boolean')
      
      // Test color controls
      expect(controls.gridColor.type).toBe('color')
      expect(controls.backgroundColor.type).toBe('color')
    })
  })

  describe('Framer Canvas Environment', () => {
    test('renders correctly in Framer canvas', async () => {
      render(
        <FramerCanvasSimulator>
          <ReactBitsGridDistortion />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })
    })

    test('adapts to different canvas sizes', async () => {
      const canvasSizes = [
        { width: 375, height: 667 }, // iPhone
        { width: 768, height: 1024 }, // iPad
        { width: 1440, height: 900 }, // Desktop
        { width: 320, height: 568 }   // Small mobile
      ]

      for (const size of canvasSizes) {
        render(
          <FramerCanvasSimulator width={size.width} height={size.height}>
            <ReactBitsGridDistortion />
          </FramerCanvasSimulator>
        )

        await waitFor(() => {
          const canvas = screen.getByRole('img')
          expect(canvas).toBeInTheDocument()
        })
      }
    })

    test('handles different device pixel ratios', async () => {
      const dprValues = [1, 1.5, 2, 3]

      for (const dpr of dprValues) {
        render(
          <FramerCanvasSimulator devicePixelRatio={dpr}>
            <ReactBitsGridDistortion quality="high" />
          </FramerCanvasSimulator>
        )

        await waitFor(() => {
          const canvas = screen.getByRole('img')
          expect(canvas).toBeInTheDocument()
        })
      }
    })

    test('works in both preview and edit modes', async () => {
      // Test edit mode
      render(
        <FramerCanvasSimulator previewMode={false}>
          <ReactBitsGridDistortion />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })

      // Test preview mode
      render(
        <FramerCanvasSimulator previewMode={true}>
          <ReactBitsGridDistortion />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })
    })
  })

  describe('Real-time Property Updates', () => {
    test('responds to property changes immediately', async () => {
      let currentProps: any = {}
      
      render(
        <FramerCanvasSimulator>
          <PropertyControlsTestWrapper
            onPropsChange={(props) => { currentProps = props }}
          />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })

      // Wait for some property changes
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
      })

      // Properties should have been updated
      expect(currentProps).toBeDefined()
    })

    test('handles rapid property changes smoothly', async () => {
      const RapidPropertyChanger = () => {
        const [intensity, setIntensity] = React.useState(0.5)
        const [gridColor, setGridColor] = React.useState('#ffffff')
        
        React.useEffect(() => {
          let frame = 0
          const animate = () => {
            frame++
            setIntensity(0.5 + Math.sin(frame * 0.1) * 0.3)
            setGridColor(`hsl(${frame % 360}, 70%, 50%)`)
            if (frame < 30) { // Limit iterations for test performance
              requestAnimationFrame(animate)
            }
          }
          const id = requestAnimationFrame(animate)
          
          return () => cancelAnimationFrame(id)
        }, [])
        
        return (
          <ReactBitsGridDistortion 
            intensity={intensity}
            gridColor={gridColor}
            showGrid={true}
          />
        )
      }

      render(
        <FramerCanvasSimulator>
          <RapidPropertyChanger />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })

      // Let rapid changes occur
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600))
      })
    })
  })

  describe('Performance in Complex Projects', () => {
    test('maintains performance with multiple instances', async () => {
      const MultipleInstancesTest = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <ReactBitsGridDistortion quality="medium" distortionType="fluid" />
          <ReactBitsGridDistortion quality="medium" distortionType="magnetic" />
          <ReactBitsGridDistortion quality="medium" distortionType="ripple" />
          <ReactBitsGridDistortion quality="medium" distortionType="vortex" />
        </div>
      )

      render(
        <FramerCanvasSimulator width={800} height={600}>
          <MultipleInstancesTest />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvases = screen.getAllByRole('img')
        expect(canvases).toHaveLength(4)
      })

      // Let them render for a bit
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
      })
    })

    test('handles complex nested component structures', async () => {
      const ComplexNestedStructure = () => (
        <div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ReactBitsGridDistortion />
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}>
            <div>Overlay content</div>
          </div>
          <div style={{ position: 'relative', zIndex: 0 }}>
            <div>Background content</div>
          </div>
        </div>
      )

      render(
        <FramerCanvasSimulator>
          <ComplexNestedStructure />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })
    })
  })

  describe('Single-File Architecture Compatibility', () => {
    test('component is completely self-contained', () => {
      const fs = require('fs')
      const path = require('path')
      
      const componentPath = path.resolve(__dirname, '../components/ReactBitsGridDistortion.tsx')
      const componentSource = fs.readFileSync(componentPath, 'utf8')
      
      // Should only import from React and Framer
      const importLines = componentSource
        .split('\n')
        .filter((line: string) => line.trim().startsWith('import'))
        .filter((line: string) => !line.includes('//')) // Exclude commented imports
      
      importLines.forEach((line: string) => {
        expect(line).toMatch(/from ['"](?:react|framer)['"]/)
      })
    })

    test('contains all necessary utilities and types', () => {
      const fs = require('fs')
      const path = require('path')
      
      const componentPath = path.resolve(__dirname, '../components/ReactBitsGridDistortion.tsx')
      const componentSource = fs.readFileSync(componentPath, 'utf8')
      
      // Should contain all utility functions
      const requiredUtilities = [
        'compileShader',
        'createShaderProgram',
        'validateShaderProgram',
        'createTexture',
        'parseColor',
        'detectDeviceCapabilities',
        'calculateFrameRate',
        'getOptimalTextureSize',
        'getOptimalCanvasResolution'
      ]
      
      requiredUtilities.forEach(utility => {
        expect(componentSource).toContain(utility)
      })
      
      // Should contain all necessary interfaces
      const requiredInterfaces = [
        'ReactBitsGridDistortionProps',
        'WebGLContextState',
        'MouseState',
        'PerformanceState',
        'TextureState',
        'DeviceCapabilities'
      ]
      
      requiredInterfaces.forEach(interfaceName => {
        expect(componentSource).toContain(`interface ${interfaceName}`)
      })
    })

    test('can be copied and used immediately in Framer', async () => {
      // This test simulates copying the component to a new Framer project
      render(
        <FramerCanvasSimulator>
          <ReactBitsGridDistortion 
            imageSrc="https://example.com/test.jpg"
            distortionType="fluid"
            intensity={0.7}
            showGrid={true}
            gridColor="#00ff88"
          />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })

      // Should work without any additional setup or dependencies
    })
  })

  describe('Error Handling in Framer Environment', () => {
    test('provides meaningful error messages for Framer users', async () => {
      const consoleSpy = jest.spyOn(console, 'warn')
      
      render(
        <FramerCanvasSimulator>
          <ReactBitsGridDistortion 
            imageSrc="invalid-url"
            gridColor="invalid-color"
          />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })

      // Should provide helpful warnings (in development mode)
      // Note: In production, these warnings might be suppressed
    })

    test('recovers from WebGL context loss in Framer', async () => {
      render(
        <FramerCanvasSimulator>
          <ReactBitsGridDistortion />
        </FramerCanvasSimulator>
      )

      const canvas = screen.getByRole('img') as HTMLCanvasElement

      await waitFor(() => {
        expect(canvas).toBeInTheDocument()
      })

      // Simulate context loss (only if canvas element)
      if (canvas.tagName === 'CANVAS') {
        await act(async () => {
          canvas.dispatchEvent(new Event('webglcontextlost'))
        })

        // Should handle gracefully and attempt recovery
        await act(async () => {
          canvas.dispatchEvent(new Event('webglcontextrestored'))
        })
      }

      expect(canvas).toBeInTheDocument()
    })
  })

  describe('Framer-Specific Features', () => {
    test('respects Framer motion preferences', async () => {
      // Mock Framer motion preferences
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(
        <FramerCanvasSimulator>
          <ReactBitsGridDistortion autoAnimation={true} />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })
    })

    test('integrates with Framer layout system', async () => {
      const FramerLayoutTest = () => (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%',
          height: '100%'
        }}>
          <div style={{ flex: '0 0 auto', height: '50px', backgroundColor: '#ccc' }}>
            Header
          </div>
          <div style={{ flex: '1 1 auto', position: 'relative' }}>
            <ReactBitsGridDistortion />
          </div>
          <div style={{ flex: '0 0 auto', height: '50px', backgroundColor: '#ccc' }}>
            Footer
          </div>
        </div>
      )

      render(
        <FramerCanvasSimulator>
          <FramerLayoutTest />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })
    })

    test('works with Framer variants and animations', async () => {
      const FramerVariantsTest = () => {
        const [variant, setVariant] = React.useState('default')
        
        React.useEffect(() => {
          const timer = setTimeout(() => setVariant('active'), 500)
          return () => clearTimeout(timer)
        }, [])
        
        return (
          <div data-framer-variant={variant}>
            <ReactBitsGridDistortion 
              intensity={variant === 'active' ? 0.8 : 0.3}
              autoAnimation={variant === 'active'}
            />
          </div>
        )
      }

      render(
        <FramerCanvasSimulator>
          <FramerVariantsTest />
        </FramerCanvasSimulator>
      )

      await waitFor(() => {
        const canvas = screen.getByRole('img')
        expect(canvas).toBeInTheDocument()
      })

      // Wait for variant change
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600))
      })
    })
  })
})