# WattUP Backend - Enhanced Electricity Monitoring System

A robust, scalable Node.js/Express backend with TypeScript for real-time electricity monitoring and anomaly detection.

## 🚀 Features

### Core Functionality
- **Real-time Energy Monitoring**: Track electricity consumption across multiple lines
- **Intelligent Anomaly Detection**: Statistical analysis using Z-score methodology
- **Multi-tenant Architecture**: Organization-based data isolation
- **Role-based Access Control**: Worker, Manager, and Admin roles
- **Real-time Updates**: WebSocket support for live data streaming

### Security & Performance
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Input Validation**: Joi schema validation with sanitization
- **Rate Limiting**: Configurable rate limits for different endpoints
- **Security Headers**: Helmet.js for HTTP security headers
- **Error Handling**: Comprehensive error handling with custom error classes
- **Logging**: Structured logging with Winston

### Data Management
- **MongoDB Integration**: Mongoose ODM with optimized schemas and indexes
- **Data Validation**: Schema-level and application-level validation
- **Pagination**: Efficient pagination for large datasets
- **Filtering & Sorting**: Advanced query capabilities
- **Export Functions**: CSV and PDF report generation

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── index.ts     # Main configuration
│   └── database.ts  # Database connection and setup
├── controllers/     # Route controllers
│   ├── authController.ts
│   └── dashboardController.ts
├── models/          # Mongoose models
│   ├── User.ts
│   ├── EnergyData.ts
│   ├── Anomaly.ts
│   └── Organization.ts
├── routes/          # Express routes
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── users.ts
│   ├── upload.ts
│   └── reports.ts
├── services/        # Business logic services
│   ├── anomalyDetection.ts
│   └── email.ts
├── middlewares/     # Express middlewares
│   ├── auth.ts
│   ├── validation.ts
│   ├── rateLimiter.ts
│   └── errorHandler.ts
├── utils/           # Utility functions
│   ├── auth.ts
│   ├── errors.ts
│   ├── helpers.ts
│   ├── logger.ts
│   └── validation.ts
├── types/           # TypeScript type definitions
│   ├── index.ts
│   └── express.ts
├── sockets/         # WebSocket handlers
│   └── socketHandlers.ts
└── server.ts        # Main application file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB
- Redis (optional, for caching)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Development Mode**
   ```bash
   npm run dev
   ```

5. **Production Mode**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/wattup |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `EMAIL_SERVICE` | Email service provider | gmail |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASSWORD` | Email password/app password | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |

### JWT Configuration
- Access tokens expire in 7 days
- Refresh tokens expire in 30 days
- Secure password reset tokens with 24-hour expiration

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour

## 📊 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "worker",
  "organizationId": "org_id_here"
}
```

#### POST `/api/auth/login`
User login
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST `/api/auth/forgot-password`
Request password reset
```json
{
  "email": "user@example.com"
}
```

### Dashboard Endpoints

#### GET `/api/dashboard/overview`
Get dashboard overview statistics

#### GET `/api/dashboard/energy-data`
Get energy data with filters
- Query parameters: `page`, `limit`, `lineId`, `startDate`, `endDate`, `isAnomaly`

#### POST `/api/dashboard/energy-data`
Create new energy data entry
```json
{
  "lineId": "line_001",
  "lineName": "Production Line 1",
  "consumption": 125.5,
  "threshold": 100,
  "metadata": {
    "voltage": 220,
    "current": 0.57,
    "powerFactor": 0.95,
    "location": "Building A"
  }
}
```

#### GET `/api/dashboard/anomalies`
Get anomalies with filters
- Query parameters: `page`, `limit`, `severity`, `resolved`, `startDate`, `endDate`

#### PUT `/api/dashboard/anomalies/:id/resolve`
Resolve an anomaly
```json
{
  "notes": "Issue resolved by replacing faulty equipment"
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- Unit tests for services and utilities
- Integration tests for API endpoints
- Mock implementations for external services

## 🏗️ Architecture

### Anomaly Detection Algorithm
The system uses a statistical approach for anomaly detection:

1. **Z-Score Analysis**: Calculates deviation from historical mean
2. **Threshold-based Fallback**: Simple threshold check for insufficient data
3. **Severity Classification**: Categorizes anomalies as Low, Medium, High, or Critical
4. **Real-time Processing**: Immediate analysis upon data ingestion

### Security Measures
- **Password Hashing**: bcrypt with salt rounds of 12
- **Input Sanitization**: XSS protection and SQL injection prevention
- **Rate Limiting**: Multiple tiers based on endpoint sensitivity
- **CORS Configuration**: Restricted origins in production
- **Helmet Integration**: Security headers for common vulnerabilities

### Performance Optimizations
- **Database Indexing**: Optimized indexes for frequent queries
- **Pagination**: Efficient data retrieval for large datasets
- **Connection Pooling**: MongoDB connection optimization
- **Caching Strategy**: Redis integration for session management
- **Lazy Loading**: On-demand data loading for better response times

## 📈 Monitoring & Logging

### Logging Levels
- **Error**: System errors and exceptions
- **Warn**: Warning conditions
- **Info**: General information messages
- **Debug**: Detailed debugging information (development only)

### Log Files
- `logs/error.log`: Error-level logs only
- `logs/combined.log`: All log levels
- Console output in development mode

### Health Check
- Endpoint: `GET /health`
- Returns: Server status, uptime, and environment information

## 🚀 Deployment

### Docker Support
```dockerfile
# Dockerfile included for containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --force
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Production Considerations
- Use PM2 or similar process manager
- Set up proper environment variables
- Configure reverse proxy (nginx)
- Enable SSL/TLS termination
- Set up database replica sets
- Configure monitoring and alerting

## 🔄 Development Workflow

### Code Quality
- **ESLint**: TypeScript-specific linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks
- **TypeScript**: Full type safety

### Git Workflow
```bash
# Development
npm run dev          # Start development server
npm run lint         # Run linting
npm run lint:fix     # Fix linting issues
npm run format       # Format code

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report

# Production
npm run build        # Build for production
npm start           # Start production server
```

## 📄 License

This project is part of the WattUP Electricity Monitoring System.

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation for API changes
4. Ensure all tests pass before submitting PR

## 📞 Support

For technical support or questions about the backend implementation, please refer to the project documentation or contact the development team.
