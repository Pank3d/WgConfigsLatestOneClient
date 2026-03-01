export interface Config {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigsResponse {
  configs: Config[];
  count: number;
  maxCount: number;
}
