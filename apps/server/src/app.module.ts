import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SocketModule,
    DatabaseModule,
  ],
})
export class AppModule {}
