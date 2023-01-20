export abstract class Repository<T> {
  getAll: () => T[];
  get: (id: string) => T | undefined;
  save: (id: string, userData: T) => T;
  remove: (id: string) => void;
  find: (term: { key: string; value: string }) => T;
}
