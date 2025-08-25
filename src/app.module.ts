import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TemporalModule } from './temporal/temporal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule, 
    TemporalModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
