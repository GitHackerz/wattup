# WattUP Frontend - Electricity Monitoring Dashboard

A modern, responsive React TypeScript dashboard for real-time electricity monitoring, anomaly detection, and data analytics.

[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/redux_toolkit-1.9.7-purple.svg)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind_css-3.4.17-38B2AC.svg)](https://tailwindcss.com/)

## 🚀 Features

### Dashboard & Analytics
- **Real-time Energy Monitoring**: Live consumption tracking with interactive charts
- **Anomaly Detection Dashboard**: Visual alerts for unusual energy patterns
- **Multi-organization Support**: Role-based access for different organizations
- **Data Visualization**: Chart.js integration for comprehensive analytics
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### User Experience
- **Real-time Updates**: WebSocket integration for live data streaming
- **Toast Notifications**: User-friendly feedback for actions and alerts
- **Protected Routes**: JWT-based authentication with automatic token refresh
- **Loading States**: Smooth loading indicators and error boundaries
- **Dark/Light Theme**: Context-based theming system

### Data Management
- **File Upload**: Support for bulk energy data import (CSV)
- **Report Generation**: Export capabilities for energy consumption reports
- **Pagination**: Efficient data handling for large datasets
- **Filtering & Search**: Advanced query capabilities

## 🏗️ Tech Stack

- **React 18.2.0** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API communication
- **Socket.io-client** for real-time updates
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **React Testing Library** for testing
- **Heroicons** for icons

## 📁 Project Structure

```
src/
├── api/                    # API client configuration
│   └── client.ts          # Axios instance and interceptors
├── components/            # Reusable UI components
│   ├── ErrorBoundary.tsx  # Error boundary component
│   ├── Header.tsx         # Main header with navigation
│   ├── Layout.tsx         # Main layout wrapper
│   ├── LoadingSpinner.tsx # Loading indicator
│   ├── ProtectedRoute.tsx # Route protection component
│   └── Sidebar.tsx        # Navigation sidebar
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   ├── SocketContext.tsx  # WebSocket connection
│   └── ThemeContext.tsx   # Theme management
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
│   ├── AnomalyDetectionPage.tsx
│   ├── DashboardPage.tsx
│   ├── EnergyMonitoringPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── store/                 # Redux store
│   ├── hooks.ts           # Typed hooks
│   ├── index.ts           # Store configuration
│   └── slices/            # Redux slices
├── types/                 # TypeScript definitions
│   └── index.ts           # Global type definitions
├── utils/                 # Utility functions
└── App.tsx               # Main application component
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm (v8+)
- Backend API running (see backend README)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Optional: Enable development features
REACT_APP_DEBUG=true
```

### Build Configuration

The application uses Create React App with custom configurations:
- **TypeScript**: Strict type checking enabled
- **ESLint**: Custom rules for React and TypeScript
- **PostCSS**: Tailwind CSS processing
- **Testing**: Jest with React Testing Library

## 📊 Key Components

### Authentication Flow
- JWT-based authentication with automatic token refresh
- Protected routes with role-based access
- Persistent login state with localStorage

### Real-time Features
- WebSocket connection for live energy data
- Automatic reconnection on connection loss
- Real-time anomaly alerts

### Data Visualization
- Interactive charts using Chart.js
- Responsive design for all screen sizes
- Customizable time ranges and filters

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run type checking
npm run type-check
```

### Test Structure
- Unit tests for components and utilities
- Integration tests for user flows
- Mock implementations for API calls

## 🚀 Development Workflow

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Building for Production
```bash
# Create production build
npm run build

# Build is created in 'build' directory
# Ready for deployment with nginx or similar
```

## 🔒 Security Features

- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Token-based request validation
- **Secure Headers**: Helmet.js integration in backend
- **Input Validation**: Client-side validation with server-side verification

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Adapted layouts with touch-friendly controls
- **Mobile**: Single-column layout with collapsible navigation

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Docker Support
```dockerfile
# Production Dockerfile included
FROM nginx:alpine
COPY build /usr/share/nginx/html
EXPOSE 80
```

### Production Build
```bash
npm run build
# Deploy 'build' directory to your web server
```

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Add tests for new features
3. Update component documentation
4. Ensure responsive design for new components

## 📄 License

This project is part of the WattUP Electricity Monitoring System.

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify environment variables

2. **WebSocket Connection**
   - Check Socket.io server configuration
   - Verify firewall settings
   - Check browser console for errors

3. **Build Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Tips
- Use React DevTools for performance monitoring
- Enable production builds for testing
- Check network tab for slow API calls

## 📞 Support

For technical support or questions about the frontend implementation, please refer to the project documentation or contact the development team.
