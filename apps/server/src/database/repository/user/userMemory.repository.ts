import { Injectable } from '@nestjs/common';
import { Repository } from '../Repository';
import { User } from 'src/database/entities/User';

@Injectable()
export class UserMemoryRepository implements Repository<User> {
  private users: Map<string, User> = new Map();

  getAll() {
    return Array.from(this.users.values());
  }

  get(id: string) {
    return this.users.get(id);
  }

  find(term: { key: string; value: string }) {
    for (const [, user] of this.users.entries()) {
      if (user[term.key] === term.value) {
        return user;
      }
    }

    return null;
  }

  save(id: string, userData: User) {
    this.users.set(id, userData);

    return userData;
  }

  remove(id: string) {
    this.users.delete(id);
  }
}
