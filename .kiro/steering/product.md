# Product Overview

This is a **Custom Framer Components Library** - a collection of reusable, professional-grade React components built specifically for Framer projects.

## Core Value Proposition
- **Framer-Native Components**: Built specifically for Framer with full property controls integration
- **Professional Quality**: Production-ready components with robust error handling and loading states
- **Extensive Customization**: Rich property controls for colors, typography, animations, and behavior
- **Developer-Friendly**: TypeScript-first with clear interfaces and comprehensive examples

## Component Collection
- **DynamicGraph**: Smart data visualization with Google Sheets integration and auto-detection (simplified layout - chart only, no transaction boxes)
- **FeatureCard**: Customizable feature display cards with bullet points and rich typography
- **ContactCard**: Professional contact information display components
- **Accordion**: Collapsible content sections with smooth animations
- **HoverImageSection**: Interactive image hover effects and transitions
- **GoogleSheetsSetup**: Configuration helpers for data integration
- **Authentication**: User authentication and access control utilities

## Design Approach
Components are built to be **flexible and adaptable** to diverse user needs and project requirements. Each component provides:
- **Configurable behavior** through comprehensive property controls
- **Visual customization** to match any design system or brand
- **Modular architecture** allowing components to work independently or together
- **Extensible foundation** that can be adapted for specific use cases

The components are designed to be intuitive for non-technical users while providing extensive customization for developers.

## Design Philosophy
- **Think Deeply First**: Always explore multiple approaches before implementing changes
- **Framer-Native Experience**: Components should feel native to Framer's canvas and workflow
- **Progressive Enhancement**: Start with sensible defaults, allow advanced customization
- **Typography Consistency**: Default to project fonts with optional overrides for flexibility

## Typography Standards
All components follow a consistent font inheritance pattern:
- **Project Font Default**: All components automatically inherit Framer project's global font
- Font inheritance applies to all text elements: headings, labels, chart elements, tooltips, legends
- Centralized font resolution pattern: `fontFamily: "inherit"` for seamless project integration
- No toggle controls needed - components automatically adapt to project typography