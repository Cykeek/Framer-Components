<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Framer Dynamic Graph Component Project

This project contains Framer Code Components for creating dynamic graphs that fetch data from Google Sheets. The components are built with React 18 and use modern data visualization libraries.

## Key Guidelines

- All components must be React 18 compatible
- Use Framer's addPropertyControls and ControlType for component configuration
- Implement proper error handling and loading states
- Components should be responsive and work well in Framer's canvas
- Follow Framer's best practices for Code Components
- Use TypeScript for better type safety
- Implement smart data parsing and organization
- Support multiple chart types (line, bar, pie, scatter)
- Include comprehensive property controls for visual customization
- Think deeply and find multiple ways before applying any changes in the code

## Typography and Fonts

To ensure consistent typography with the Framer project, follow these rules for all Code Components:

- Default to the project’s font: provide a boolean control "Use Project Font" (default: true). When enabled, set fontFamily to "inherit" so the component uses the site’s global font configured in Framer.
- Optional override: when "Use Project Font" is off, show a "Font Family" text control and apply its value.
- Hide/show controls: hide the "Font Family" field when "Use Project Font" is enabled to reduce confusion.
- Apply inheritance everywhere text is rendered, including:
	- Headings, subtitles, labels, paragraphs, buttons
	- Loading and error states
	- Any sub-elements like badges/tags, captions, placeholders, and footers
	- Chart UIs: axis tick labels, legends, tooltips, and any chart control buttons (e.g., chart type toggles)
- Centralize font resolution:
	- Derive a resolvedFontFamily once per component: `useProjectFonts ? "inherit" : fontFamily`.
	- Use this value for all inline styles and pass into third-party components (e.g., Recharts Tooltip/Legend styles).
- Weights and sizes: continue to control font size/weight/color via component props; only font-family should inherit when using project fonts.

## Data Flow

1. Fetch data from Google Sheets API
2. Parse and organize data intelligently based on content structure
3. Render appropriate chart type based on data characteristics
4. Provide visual controls for customization
