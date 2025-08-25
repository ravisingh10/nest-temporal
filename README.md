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

This project demonstrates how to integrate Temporal.io workflows with a NestJS application.

## Prerequisites

1. **Docker** - Required to run Temporal server locally
2. **Node.js** - Version 16 or higher

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to match your Temporal server configuration:

```bash
# Temporal Configuration
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=users-task-queue

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 2. Start Temporal Server Locally

Run the following command to start Temporal server using Docker:

```bash
docker run -p 7233:7233 -p 8233:8233 temporalio/auto-setup:latest
```

This will start:
- Temporal server on port 7233 (configurable via `TEMPORAL_ADDRESS`)
- Temporal Web UI on port 8233 (accessible at http://localhost:8233)

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Applications

**Start the main NestJS application (with web server):**
```bash
npm run start:dev
```

**Start only the Temporal worker (without web server):**
```bash
npm run start:worker:dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEMPORAL_ADDRESS` | Temporal server address and port | `localhost:7233` |
| `TEMPORAL_NAMESPACE` | Temporal namespace to use | `default` |
| `TEMPORAL_TASK_QUEUE` | Task queue name for workflows | `users-task-queue` |
| `PORT` | Port for the web server | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## How It Works

1. **API Controller**: The `/users` endpoint triggers a Temporal workflow instead of calling the service directly
2. **Temporal Workflow**: The `getUsersWorkflow` executes the business logic through activities
3. **Temporal Activity**: The `UsersActivity` wraps the original `UsersService.getUsers()` method
4. **Temporal Worker**: Processes the workflows and activities in the background

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
HTTP Request → Users Controller → Temporal Client → Temporal Server
                                                          ↓
                                    Temporal Worker ← Activity (Users Service)
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
