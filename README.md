# WattUP - Enhanced Electricity Monitoring System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.0-green.svg)](https://www.mongodb.com/)

WattUP is a comprehensive electricity monitoring system that provides real-time energy consumption tracking, anomaly detection, and data analytics for organizations and individuals.

## 🚀 Features

- **Real-time Energy Monitoring**: Track electricity consumption in real-time
- **Anomaly Detection**: Automated detection of unusual energy patterns
- **Data Analytics**: Comprehensive reporting and visualization
- **Multi-tenant Architecture**: Support for multiple organizations
- **User Management**: Role-based access control
- **File Upload**: Support for energy data import
- **Socket.io Integration**: Real-time updates and notifications
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18.2.0 with TypeScript
- Redux Toolkit for state management
- Chart.js for data visualization
- Tailwind CSS for styling
- Socket.io-client for real-time communication

**Backend:**
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose ODM
- Redis for caching
- JWT authentication
- Socket.io for real-time communication
- Jest for testing

**Infrastructure:**
- Docker & Docker Compose
- Nginx (for production)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## 🐳 Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/amelmediouni2001/wattUP.git
cd wattUP
```

### 2. Environment Setup

The Docker Compose configuration includes default environment variables. For production, you should customize these values.

### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 4. Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

### 5. Seed the Database (Optional)

```bash
# Seed organizations
docker-compose exec backend npm run seed:orgs

# Seed users
docker-compose exec backend npm run seed:users

# Seed energy data
docker-compose exec backend npm run seed:energy

# Seed all data
docker-compose exec backend npm run seed:all
```

## 🔧 Manual Setup (Local Development)

### Prerequisites

- MongoDB (v7.0+)
- Redis (v7.0+)
- Node.js (v18+)

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/amelmediouni2001/wattUP.git
cd wattUP

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

#### MongoDB
```bash
# Start MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Windows)
net start MongoDB
```

#### Redis
```bash
# Start Redis (Ubuntu/Debian)
sudo systemctl start redis

# Start Redis (macOS with Homebrew)
brew services start redis

# Start Redis (Windows)
redis-server
```

### 3. Environment Configuration

#### Backend Environment

Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/wattup
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-development
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-development
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DESTINATION=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### Frontend Environment

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start the Application

#### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

#### Terminal 2: Start Frontend
```bash
cd frontend
npm start
```

### 5. Seed the Database

```bash
cd backend

# Seed organizations
npm run seed:orgs

# Seed users
npm run seed:users

# Seed energy data
npm run seed:energy

# Seed all data
npm run seed:all
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-data` - Get recent energy data

### Organization Endpoints

- `GET /api/organizations` - Get all organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/:id` - Get organization by ID
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Reports Endpoints

- `GET /api/reports/energy-consumption` - Get energy consumption reports
- `GET /api/reports/anomalies` - Get anomaly reports

### Upload Endpoints

- `POST /api/upload/energy-data` - Upload energy data files

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Production Deployment

### Docker Production Build

1. Update environment variables in `docker-compose.yml` for production
2. Build and deploy:

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Manual Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Build the backend:
```bash
cd backend
npm run build
```

3. Start the backend:
```bash
cd backend
npm start
```

4. Serve the frontend using a web server like Nginx.

## 📁 Project Structure

```
wattUP/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Application entry point
│   ├── scripts/            # Database seeding scripts
│   ├── __tests__/          # Test files
│   └── uploads/            # File upload directory
├── frontend/               # Frontend application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── docker-compose.yml      # Docker Compose configuration
└── README.md              # Project documentation
```

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation with Joi
- File upload restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use error**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :3000
   # Kill the process
   kill -9 <PID>
   ```

2. **MongoDB connection error**
   - Ensure MongoDB is running
   - Check the connection string in environment variables
   - Verify MongoDB service status

3. **Redis connection error**
   - Ensure Redis is running
   - Check Redis configuration
   - Verify Redis service status

4. **Docker issues**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild containers
   docker-compose down
   docker-compose up -d --build --force-recreate
   ```

### Getting Help

- Create an issue on GitHub for bug reports
- Check existing issues for solutions
- Contact the development team

## 🔗 Useful Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)

---

Built with ❤️ by the WattUP Team
