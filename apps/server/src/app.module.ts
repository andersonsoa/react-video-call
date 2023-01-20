import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [SocketModule, DatabaseModule],
})
export class AppModule {}
