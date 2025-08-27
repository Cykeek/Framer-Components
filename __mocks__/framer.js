/**
 * Mock for Framer module
 */

const mockAddPropertyControls = jest.fn()

const ControlType = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Enum: 'enum',
  Color: 'color',
  Image: 'image',
  ComponentInstance: 'componentinstance'
}

module.exports = {
  addPropertyControls: mockAddPropertyControls,
  ControlType
}