export interface IBaseRepository<T> {
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<T | null>;
}