<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# NestJS with Temporal.io Integration

This project demonstrates how to integrate Temporal.io workflows with a NestJS application, featuring Redis for data storage and search capabilities.

## Prerequisites

1. **Docker** - Required to run Temporal server locally
2. **Node.js** - Version 16 or higher
3. **Redis** - Required for data storage and search functionality

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to match your Temporal server and Redis configuration:

```bash
# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=users-task-queue

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 2. Start Redis Server

Make sure Redis is running on your system. You can install and start Redis using:

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

### 3. Initialize Redis Indexes

Before starting the application, run the Redis index initialization script to prevent startup issues:

```bash
# With default Redis settings (localhost:6379)
./init-redis-indexes.sh

# With custom Redis settings
REDIS_HOST=your-redis-host REDIS_PORT=6379 REDIS_PASSWORD=your-password ./init-redis-indexes.sh
```

This script will:
- Test the Redis connection
- Create the hotel search index with proper schema mapping
- Handle existing indexes gracefully
- Verify the index creation was successful

**Note:** The initialization script must be run before starting the application to avoid index creation conflicts during startup.

### 4. Start Temporal Server Locally

Run the following command to start Temporal server using Docker:

```bash
docker run -p 7233:7233 -p 8233:8233 temporalio/auto-setup:latest
```

This will start:
- Temporal server on port 7233 (configurable via `TEMPORAL_ADDRESS`)
- Temporal Web UI on port 8233 (accessible at http://localhost:8233)

### 5. Install Dependencies

```bash
npm install
```

### 6. Start the Applications

**Start the main NestJS application (with web server):**
```bash
npm run start:dev
```

**Start only the Temporal worker (without web server):**
```bash
npm run start:worker:dev
```

## Docker Deployment

This project includes Docker support for containerized deployment with separate images for the API server and Temporal worker.

### Docker Images

The project provides two optimized Docker images:

1. **API Server Image** (`nest-temporal-api`) - Runs the NestJS web server
2. **Worker Image** (`nest-temporal-worker`) - Runs the Temporal worker process

### Building Docker Images

Build both images using the provided Dockerfiles:

```bash
# Build the API server image
docker build -f Dockerfile.api -t nest-temporal-api .

# Build the worker image
docker build -f Dockerfile.worker -t nest-temporal-worker .
```

### Running with Docker

**Start the API server container:**
```bash
docker run -d \
  --name nest-temporal-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e TEMPORAL_ADDRESS=your-temporal-server:7233 \
  -e REDIS_URL=redis://your-redis-server:6379 \
  nest-temporal-api
```

**Start the worker container:**
```bash
docker run -d \
  --name nest-temporal-worker \
  -e NODE_ENV=production \
  -e TEMPORAL_ADDRESS=your-temporal-server:7233 \
  -e REDIS_URL=redis://your-redis-server:6379 \
  nest-temporal-worker
```

### Docker Compose (Recommended)

For easier orchestration, use Docker Compose:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  temporal:
    image: temporalio/auto-setup:latest
    ports:
      - "7233:7233"
      - "8233:8233"
    environment:
      - DB=postgresql
      - DB_PORT=5432
      - POSTGRES_USER=temporal
      - POSTGRES_PWD=temporal
      - POSTGRES_SEEDS=postgresql
    depends_on:
      - postgresql

  postgresql:
    image: postgres:13
    environment:
      POSTGRES_DB: temporal
      POSTGRES_USER: temporal
      POSTGRES_PASSWORD: temporal
    volumes:
      - postgres_data:/var/lib/postgresql/data

  nest-temporal-api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TEMPORAL_ADDRESS=temporal:7233
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - temporal

  nest-temporal-worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    environment:
      - NODE_ENV=production
      - TEMPORAL_ADDRESS=temporal:7233
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - temporal

volumes:
  redis_data:
  postgres_data:
```

Save this as `docker-compose.yml` and run:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Docker Environment Variables

When running in Docker, ensure these environment variables are set:

| Variable | Description | Docker Default |
|----------|-------------|----------------|
| `TEMPORAL_ADDRESS` | Temporal server address | `temporal:7233` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | API server port | `3000` |

### Production Docker Deployment

For production deployment:

1. **Build optimized images:**
   ```bash
   docker build -f Dockerfile.api -t your-registry/nest-temporal-api:latest .
   docker build -f Dockerfile.worker -t your-registry/nest-temporal-worker:latest .
   ```

2. **Push to registry:**
   ```bash
   docker push your-registry/nest-temporal-api:latest
   docker push your-registry/nest-temporal-worker:latest .
   ```

3. **Deploy with orchestration tools** (Kubernetes, Docker Swarm, etc.)

### Docker Features

- **Multi-stage builds** for optimized image sizes
- **Non-root user** for security
- **Production-ready** configuration
- **Proper signal handling** for graceful shutdowns
- **Health checks** ready for orchestration
- **Separate images** for independent scaling

### Docker Troubleshooting

**Container connectivity issues:**
```bash
# Check container logs
docker logs nest-temporal-api
docker logs nest-temporal-worker

# Check network connectivity
docker exec nest-temporal-api ping redis
docker exec nest-temporal-worker ping temporal
```

**Redis initialization in Docker:**
```bash
# Run Redis index initialization inside container
docker exec nest-temporal-api npm run init:redis
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEMPORAL_ADDRESS` | Temporal server address and port | `localhost:7233` |
| `TEMPORAL_NAMESPACE` | Temporal namespace to use | `default` |
| `TEMPORAL_TASK_QUEUE` | Task queue name for workflows | `users-task-queue` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `REDIS_HOST` | Redis host (for init script) | `localhost` |
| `REDIS_PORT` | Redis port (for init script) | `6379` |
| `REDIS_PASSWORD` | Redis password (for init script) | _(empty)_ |
| `PORT` | Port for the web server | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Redis Features

This application includes a Redis-based hotel management system with:

- **Hotel Data Storage**: JSON-based storage using Redis OM
- **Full-Text Search**: Search hotels by name, city, and other criteria
- **Sorting and Filtering**: Sort by rating, commission percentage, etc.
- **CRUD Operations**: Create, read, update, and delete hotel records

### Hotel API Endpoints

The application provides hotel management endpoints:

- `POST /hotels` - Create a new hotel
- `GET /hotels` - Get all hotels
- `GET /hotels/:id` - Get hotel by ID
- `PUT /hotels/:id` - Update hotel
- `DELETE /hotels/:id` - Delete hotel
- `GET /hotels/search?city=...&minRating=...&name=...` - Search hotels

## Troubleshooting

### Redis Index Issues

If you encounter Redis index errors during application startup:

1. **Run the initialization script first:**
   ```bash
   ./init-redis-indexes.sh
   ```

2. **Check Redis connection:**
   ```bash
   redis-cli ping
   ```

3. **Reset indexes if needed:**
   ```bash
   redis-cli FT.DROPINDEX hotel:index
   ./init-redis-indexes.sh
   ```

### Common Redis Errors

- **"Index already exists"**: The initialization script handles this automatically
- **"Connection refused"**: Make sure Redis server is running
- **"Index not found"**: Run the initialization script to create indexes

## How It Works

1. **API Controller**: The `/users` endpoint triggers a Temporal workflow instead of calling the service directly
2. **Temporal Workflow**: The `getUsersWorkflow` executes the business logic through activities
3. **Temporal Activity**: The `UsersActivity` wraps the original `UsersService.getUsers()` method
4. **Temporal Worker**: Processes the workflows and activities in the background
5. **Redis Service**: Manages hotel data with full-text search capabilities

## Available Scripts

- `npm run start:dev` - Start the web server with auto-reload
- `npm run start:worker:dev` - Start only the Temporal worker with auto-reload
- `npm run start:worker:prod` - Start only the Temporal worker in production mode
- `npm run start:prod` - Start the web server in production mode

## Testing

1. Make sure Temporal server is running
2. Start the NestJS application or worker
3. Call the API endpoint:

```bash
curl http://localhost:3000/users
```

Expected response:
```json
["Ravi", "Kumar", "Singh"]
```

## Temporal Web UI

Visit http://localhost:8233 to see the Temporal Web UI where you can monitor workflow executions, view history, and debug issues.

## Production Deployment

For production deployment, update your environment variables:

```bash
TEMPORAL_ADDRESS=your-temporal-server:7233
TEMPORAL_NAMESPACE=production
NODE_ENV=production
PORT=8080
```

## Architecture

```
HTTP Request → Controllers → Services/Temporal Client → Temporal Server
                ↓                                           ↓
           Redis Service ←                    Temporal Worker ← Activities
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
