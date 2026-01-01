export interface IUseCase<ReturnType, Args extends unknown[] = []> {
  execute(...args: Args): Promise<ReturnType>;
}