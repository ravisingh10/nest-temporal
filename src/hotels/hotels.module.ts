import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [HotelsController],
})
export class HotelsModule {}