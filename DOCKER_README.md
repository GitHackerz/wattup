# WattUP Docker Setup

This directory contains Docker configurations for the WattUP electricity monitoring system.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for cloning the repository)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd wattUP
cp .env.example .env
```

### 2. Configure Environment
Edit the `.env` file and update the following required variables:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Start the Application

#### Production Mode
```bash
docker-compose up -d
```

#### Development Mode (with hot reloading)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

## Services

### Frontend (React + TypeScript)
- **Production**: Multi-stage build with Nginx
- **Development**: Hot reloading with volume mounts
- **Port**: 3000 (development) / 80 (production)

### Backend (Node.js + TypeScript)
- **Production**: Compiled TypeScript, optimized for production
- **Development**: Nodemon for hot reloading
- **Port**: 5000

### Database Services
- **MongoDB**: Document database for application data
- **Redis**: Caching and session storage

## Docker Commands

### Build and Start
```bash
# Production
docker-compose up --build -d

# Development
docker-compose -f docker-compose.dev.yml up --build -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Data Loss)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart a Service
```bash
docker-compose restart backend
```

## Health Checks

All services include health checks:
- **Frontend**: HTTP health endpoint
- **Backend**: API health endpoint
- **MongoDB**: Connection test
- **Redis**: Ping test

Check service status:
```bash
docker-compose ps
```

## Development Workflow

### Making Changes
1. **Frontend**: Changes are automatically reflected (hot reload)
2. **Backend**: Changes trigger automatic restart (nodemon)

### Database Access
```bash
# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Redis CLI
docker-compose exec redis redis-cli -a redispassword123
```

### Running Tests
```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test
```

## Production Deployment

### Security Considerations
1. Change default passwords in `.env`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Set up SSL/TLS termination
5. Configure firewalls and security groups

### Environment Variables
Update the following for production:
```bash
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
CORS_ORIGIN=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

### Scaling
Use Docker Swarm or Kubernetes for production scaling:
```bash
# Docker Swarm example
docker swarm init
docker stack deploy -c docker-compose.yml wattup
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database Connection Issues**
   ```bash
   # Check if MongoDB is running
   docker-compose logs mongodb
   
   # Restart database
   docker-compose restart mongodb
   ```

4. **Clear Everything and Start Fresh**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up --build -d
   ```

### Performance Tuning

1. **Increase MongoDB memory**:
   ```yaml
   mongodb:
     deploy:
       resources:
         limits:
           memory: 1G
   ```

2. **Redis memory optimization**:
   ```yaml
   redis:
     command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
   ```

## Monitoring

### Container Stats
```bash
docker stats
```

### Container Resource Usage
```bash
docker-compose top
```

### Disk Usage
```bash
docker system df
```

## Backup and Restore

### MongoDB Backup
```bash
docker-compose exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/wattup?authSource=admin" --out=/backup
```

### Redis Backup
```bash
docker-compose exec redis redis-cli -a redispassword123 --rdb /data/backup.rdb
```

## Additional Files

- `backend/Dockerfile`: Production backend image
- `backend/Dockerfile.dev`: Development backend image
- `frontend/Dockerfile`: Production frontend image with Nginx
- `frontend/Dockerfile.dev`: Development frontend image
- `frontend/nginx.conf`: Nginx configuration for production
- `docker-compose.yml`: Production configuration
- `docker-compose.dev.yml`: Development configuration
- `.env.example`: Environment variables template
