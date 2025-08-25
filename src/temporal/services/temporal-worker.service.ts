import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NativeConnection, Worker } from '@temporalio/worker';
import { UsersActivity } from '../activities/users.activity';
import * as path from 'path';

@Injectable()
export class TemporalWorkerService implements OnModuleInit {
  constructor(
    private readonly usersActivity: UsersActivity,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    const address = this.configService.get<string>('TEMPORAL_ADDRESS', 'localhost:7233');
    const namespace = this.configService.get<string>('TEMPORAL_NAMESPACE', 'default');
    const taskQueue = this.configService.get<string>('TEMPORAL_TASK_QUEUE', 'users-task-queue');

    const connection = await NativeConnection.connect({
      address,
    });

    const worker = await Worker.create({
      connection,
      namespace,
      taskQueue,
      workflowsPath: path.join(__dirname, '../workflows'),
      activities: {
        getUsers: this.usersActivity.getUsers.bind(this.usersActivity),
        getUserById: this.usersActivity.getUserById.bind(this.usersActivity),
      },
    });

    // Run worker in background
    worker.run().catch(console.error);
  }
}