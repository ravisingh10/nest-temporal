import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Connection } from '@temporalio/client';
import { getUsersWorkflow, getUserByIdWorkflow } from '../workflows/users.workflow';

@Injectable()
export class TemporalClientService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const address = this.configService.get<string>('TEMPORAL_ADDRESS', 'localhost:7233');
    
    const connection = await Connection.connect({
      address,
    });
    
    this.client = new Client({
      connection,
    });
  }

  async executeGetUsersWorkflow(): Promise<string[]> {
    const taskQueue = this.configService.get<string>('TEMPORAL_TASK_QUEUE', 'users-task-queue');
    
    const handle = await this.client.workflow.start(getUsersWorkflow, {
      taskQueue,
      workflowId: `get-users-${Date.now()}`,
      
    });

    return await handle.result();
  }

  async executeGetUserByIdWorkflow(id: number): Promise<string> {
    const taskQueue = this.configService.get<string>('TEMPORAL_TASK_QUEUE', 'users-task-queue');
    
    const handle = await this.client.workflow.start(getUserByIdWorkflow, {
      taskQueue,
      workflowId: `get-user-by-id-${id}-${Date.now()}`,
      args: [id],
    });

    return await handle.result();
  }
}