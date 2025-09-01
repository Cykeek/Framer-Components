# Framer Component Standards - Requirements Document

## Introduction

This specification defines the mandatory standards and best practices for developing Framer components to ensure they work correctly in Framer's build system and provide a consistent developer experience.

## Requirements

### Requirement 1: Component Export Structure

**User Story:** As a Framer component developer, I want my components to build successfully in Framer, so that users can use them without build errors.

#### Acceptance Criteria

1. WHEN a component is created THEN it SHALL have a named function declaration (not arrow function)
2. WHEN a component is created THEN it SHALL end with `export default ComponentName`
3. IF a component lacks default export THEN Framer build SHALL fail with `[MISSING_EXPORT] Error`
4. WHEN property controls are added THEN they SHALL be placed after component function and before default export

### Requirement 2: File Structure Standards

**User Story:** As a developer, I want components to follow consistent file structure, so that they are maintainable and predictable.

#### Acceptance Criteria

1. WHEN creating a component file THEN it SHALL use `.tsx` extension (required by Framer)
2. WHEN organizing code THEN imports SHALL be at the top
3. WHEN organizing code THEN interfaces SHALL come after imports
4. WHEN organizing code THEN component function SHALL come after interfaces
5. WHEN organizing code THEN property controls SHALL come after component function
6. WHEN organizing code THEN default export SHALL be the last line

### Requirement 3: Self-Contained Architecture

**User Story:** As a Framer user, I want to copy a single component file and have it work immediately, so that I don't need to manage multiple dependencies.

#### Acceptance Criteria

1. WHEN creating a component THEN all utilities SHALL be included within the same file
2. WHEN creating a component THEN it SHALL NOT import from other component files
3. WHEN creating a component THEN it SHALL only import from React, Framer, and external npm packages
4. WHEN a component needs helper functions THEN they SHALL be defined within the same file

### Requirement 4: Error Prevention

**User Story:** As a developer, I want to avoid common Framer build errors, so that my components deploy successfully.

#### Acceptance Criteria

1. WHEN a component is missing default export THEN development tools SHALL warn about the issue
2. WHEN a component uses incorrect export syntax THEN it SHALL be flagged during code review
3. WHEN testing components THEN build errors SHALL be caught before deployment
4. WHEN creating new components THEN they SHALL follow the established template pattern

### Requirement 5: Documentation Standards

**User Story:** As a developer, I want clear examples of correct component structure, so that I can create compliant components.

#### Acceptance Criteria

1. WHEN documenting components THEN examples SHALL show correct export patterns
2. WHEN documenting components THEN examples SHALL highlight common mistakes
3. WHEN creating steering rules THEN they SHALL include Framer-specific requirements
4. WHEN onboarding developers THEN they SHALL have access to component templates