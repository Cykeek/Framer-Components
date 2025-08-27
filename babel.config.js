/**
 * Babel Configuration for Testing
 * 
 * Configured for React, TypeScript, and modern JavaScript features
 */

export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }],
    '@babel/preset-typescript'
  ],
  plugins: [
    // Add any additional plugins if needed
  ]
}