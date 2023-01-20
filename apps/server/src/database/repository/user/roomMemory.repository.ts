import { Injectable } from '@nestjs/common';
import { Repository } from '../Repository';
import { Room } from 'src/database/entities/Room';

@Injectable()
export class RoomMemoryRepository implements Repository<Room> {
  private rooms: Map<string, Room> = new Map();

  getAll() {
    return Array.from(this.rooms.values());
  }

  find(term: { key: string; value: string }) {
    for (const [, user] of this.rooms.entries()) {
      if (user[term.key] === term.value) {
        return user;
      }
    }

    return null;
  }

  get(id: string) {
    return this.rooms.get(id);
  }

  save(id: string, userData: Room) {
    this.rooms.set(id, userData);

    return userData;
  }

  remove(id: string) {
    this.rooms.delete(id);
  }
}
