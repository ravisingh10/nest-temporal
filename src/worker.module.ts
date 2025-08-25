import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TemporalClientService } from './temporal/services/temporal-client.service';
import { TemporalWorkerService } from './temporal/services/temporal-worker.service';
import { UsersActivity } from './temporal/activities/users.activity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    forwardRef(() => UsersModule)
  ],
  providers: [
    TemporalClientService,
    TemporalWorkerService,
    UsersActivity,
  ],
})
export class WorkerModule {}