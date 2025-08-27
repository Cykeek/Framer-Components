/**
 * Test Setup Configuration
 * 
 * Global test setup for ReactBitsGridDistortion component testing
 */

import '@testing-library/jest-dom'

// Mock WebGL globally
global.WebGLRenderingContext = class MockWebGLRenderingContext {
  canvas: HTMLCanvasElement
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }
  
  // Add minimal WebGL methods needed for testing
  getParameter() { return null }
  getExtension() { return null }
  createShader() { return {} }
  createProgram() { return {} }
  createBuffer() { return {} }
  createTexture() { return {} }
  
  // Add other methods as needed
} as any

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = jest.fn((contextType: string) => {
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return new (global as any).WebGLRenderingContext()
  }
  return null
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 16)
  return 1
})

global.cancelAnimationFrame = jest.fn()

// Mock performance.now
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now())
}

// Mock window.devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Image constructor
global.Image = class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 0
  height = 0
  
  addEventListener(event: string, callback: () => void) {
    if (event === 'load') {
      this.onload = callback
    } else if (event === 'error') {
      this.onerror = callback
    }
  }
  
  removeEventListener() {}
} as any

// Suppress console warnings in tests
const originalWarn = console.warn
const originalError = console.error

beforeEach(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterEach(() => {
  console.warn = originalWarn
  console.error = originalError
})

// Global test utilities
export const createMockCanvas = (width = 400, height = 300) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  // Mock getBoundingClientRect
  canvas.getBoundingClientRect = jest.fn(() => ({
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  }))
  
  return canvas
}

export const createMockWebGLContext = () => {
  return new (global as any).WebGLRenderingContext()
}

export const simulateContextLoss = (canvas: HTMLCanvasElement) => {
  const event = new Event('webglcontextlost')
  canvas.dispatchEvent(event)
}

export const simulateContextRestore = (canvas: HTMLCanvasElement) => {
  const event = new Event('webglcontextrestored')
  canvas.dispatchEvent(event)
}

export const waitForAnimationFrame = () => {
  return new Promise(resolve => {
    requestAnimationFrame(resolve as any)
  })
}

export const waitForMultipleFrames = (count: number) => {
  return new Promise(resolve => {
    let frameCount = 0
    const frame = () => {
      frameCount++
      if (frameCount >= count) {
        resolve(undefined)
      } else {
        requestAnimationFrame(frame)
      }
    }
    requestAnimationFrame(frame)
  })
}