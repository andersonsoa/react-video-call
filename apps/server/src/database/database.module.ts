import { Global, Module } from '@nestjs/common';
import { User } from './entities/User';
import { Repository } from './repository/Repository';
import { UserMemoryRepository } from './repository/user/userMemory.repository';
import { Room } from './entities/Room';
import { RoomMemoryRepository } from './repository/user/roomMemory.repository';

@Global()
@Module({
  providers: [
    {
      provide: Repository<User>,
      useClass: UserMemoryRepository,
    },
    {
      provide: Repository<Room>,
      useClass: RoomMemoryRepository,
    },
  ],
  exports: [
    {
      provide: Repository<User>,
      useClass: UserMemoryRepository,
    },
    {
      provide: Repository<Room>,
      useClass: RoomMemoryRepository,
    },
  ],
})
export class DatabaseModule {}
