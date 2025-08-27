import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TemporalModule } from './temporal/temporal.module';
import { RedisModule } from './redis/redis.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule, 
    TemporalModule, 
    RedisModule,
    HotelsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
