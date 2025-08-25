import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  // Create the NestJS application context without starting HTTP server
  const app = await NestFactory.createApplicationContext(WorkerModule);
  
  console.log('Temporal worker started and registered with server');
  console.log('Worker is running and waiting for tasks...');
  
  // Keep the process alive
  process.on('SIGINT', async () => {
    console.log('Shutting down worker...');
    await app.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('Shutting down worker...');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch(console.error);