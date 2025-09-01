# Framer Components Collection

A comprehensive collection of high-quality, production-ready Framer Code Components for modern web development. This repository serves as a curated compilation of reusable components that enhance the Framer ecosystem with advanced functionality, beautiful UI elements, and powerful data visualization tools.

## 🚀 Features

- **Production Ready**: All components are thoroughly tested and optimized for performance
- **TypeScript Support**: Full TypeScript implementation with proper type definitions
- **Framer Integration**: Seamless integration with Framer's property controls and design system
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Accessibility**: WCAG compliant components with proper ARIA support
- **Modern Stack**: Built with React 18, TypeScript, and modern web standards

## 📦 Components

### Core Components

#### 🎯 DynamicGraph
Interactive data visualization component that fetches data from Google Sheets and renders beautiful charts.

**Features:**
- Multiple chart types (Line, Bar, Pie, Scatter)
- Real-time data fetching from Google Sheets
- Auto-refresh capabilities
- Customizable styling and themes
- Responsive design

#### 🌊 ReactBitsGridDistortion
Advanced WebGL-based component for creating interactive grid distortion effects.

**Features:**
- Multiple distortion algorithms (Fluid, Magnetic, Ripple, Vortex)
- Procedural grid overlays with customizable blending
- Mouse interaction with velocity tracking
- Performance optimization with adaptive quality
- Graceful fallbacks for unsupported browsers

#### 🎨 UI Components
- **Accordion**: Collapsible content sections with smooth animations
- **ContactCard**: Professional contact information display
- **FeatureCard**: Feature showcase cards with hover effects
- **HoverImageSection**: Interactive image sections with hover animations

#### 🔐 Authentication Components
- **SecureAuth**: Advanced authentication system with cryptographic security
- **GoogleSheetsSetup**: Setup wizard for Google Sheets integration

#### 🎭 Interactive Components
- **ReactBitsGridDistortion**: WebGL-powered distortion effects
- **HoverImageSection**: Dynamic image interactions

## 🛠 Installation

### For Framer Projects

1. **Clone the repository:**
```bash
git clone https://github.com/Cykeek/Framer-Components.git
cd Framer-Components
```

2. **Install dependencies:**
```bash
npm install
```

3. **Copy components to your Framer project:**
Copy the desired component files from the `components/` directory to your Framer project's code components folder.

### Manual Installation

1. Download the component files you need from the `components/` directory
2. Import them into your Framer project
3. Configure the component properties in Framer's property panel

## 📖 Usage

### DynamicGraph Component

```tsx
import DynamicGraph from './components/DynamicGraph'

// Basic usage
<DynamicGraph
  googleSheetsUrl="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID"
  useApiKey={false}
  primaryColor="#8884d8"
  showGrid={true}
  showLegend={true}
  title="Sales Data"
  subtitle="Monthly performance metrics"
/>
```

### ReactBitsGridDistortion Component

```tsx
import ReactBitsGridDistortion from './components/ReactBitsGridDistortion'

// Advanced configuration
<ReactBitsGridDistortion
  imageSrc="https://example.com/background.jpg"
  distortionType="fluid"
  intensity={0.6}
  showGrid={true}
  gridSize={25}
  gridColor="#00ff88"
  autoAnimation={true}
  quality="high"
/>
```

## 🎨 Customization

All components support extensive customization through Framer's property controls:

### Common Properties
- **Colors**: Primary, secondary, background, and accent colors
- **Typography**: Font family, size, weight, and color inheritance
- **Spacing**: Padding, margins, and layout controls
- **Animation**: Duration, easing, and interaction settings

### Advanced Configuration
- **Performance**: Quality presets and optimization settings
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsive**: Breakpoint-specific configurations

## 🔧 Development

### Project Structure
```
Framer-Components/
├── components/           # Main component files
│   ├── DynamicGraph.tsx
│   ├── ReactBitsGridDistortion.tsx
│   └── ...
├── examples/            # Usage examples
├── utils/               # Utility functions
├── types/               # TypeScript definitions
├── tests/               # Test files
├── __mocks__/           # Mock data and utilities
└── .github/             # GitHub configuration
```

### Building Components

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Development server (if available)
npm run dev
```

### Component Development Guidelines

1. **TypeScript**: Use strict TypeScript with proper type definitions
2. **Framer Integration**: Implement `addPropertyControls` for all configurable properties
3. **Error Handling**: Include comprehensive error boundaries and fallbacks
4. **Performance**: Optimize for performance with proper memoization and lazy loading
5. **Accessibility**: Follow WCAG guidelines and include proper ARIA attributes
6. **Documentation**: Document all props and usage examples

## 🧪 Testing

The repository includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run specific component tests
npm test -- --testPathPattern=DynamicGraph

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes** following the development guidelines
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Commit your changes:**
```bash
git commit -m "Add: Brief description of your changes"
```

7. **Push to your branch:**
```bash
git push origin feature/your-feature-name
```

8. **Create a Pull Request** with a detailed description

### Contribution Guidelines

- Follow the existing code style and conventions
- Add proper TypeScript types for all new code
- Include comprehensive documentation and examples
- Test your changes thoroughly
- Update the README if you add new components or features

### Component Submission Checklist

- [ ] TypeScript implementation with proper types
- [ ] Framer property controls implemented
- [ ] Responsive design and mobile optimization
- [ ] Accessibility features (ARIA, keyboard navigation)
- [ ] Error handling and fallbacks
- [ ] Performance optimization
- [ ] Comprehensive documentation
- [ ] Test coverage
- [ ] Usage examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Team**: For creating an amazing design tool
- **React Community**: For the powerful React ecosystem
- **Open Source Contributors**: For their valuable contributions

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Cykeek/Framer-Components/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Cykeek/Framer-Components/discussions)
- **Documentation**: See individual component files for detailed documentation

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core components
- DynamicGraph component with Google Sheets integration
- ReactBitsGridDistortion with WebGL effects
- Comprehensive test suite
- Full TypeScript support

---

**Made with ❤️ for the Framer community**

*If you find this repository helpful, please give it a ⭐ on GitHub!*"
