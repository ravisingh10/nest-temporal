import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TemporalClientService } from './services/temporal-client.service';
// import { TemporalWorkerService } from './services/temporal-worker.service';
import { UsersActivity } from './activities/users.activity';
import { TemporalController } from './temporal.controller';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    TemporalClientService,
    // TemporalWorkerService,
    UsersActivity,
  ],
  exports: [TemporalClientService],
  controllers: [TemporalController],
})
export class TemporalModule {}
