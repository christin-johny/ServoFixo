export interface IFileUrlProvider {
  toFullUrl(key: string | undefined): string;
}