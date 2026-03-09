export interface AntigluschConfig {
  id: string;
  name: string;
  created: string;
  enabled: boolean;
}

export interface AntigluschConfigsResponse {
  configs: AntigluschConfig[];
  count: number;
  maxCount: number;
}

export interface AntigluschLinkResponse {
  link: string;
}

export interface CreateAntigluschResponse {
  success: boolean;
  config: {
    id: string;
    name: string;
    configData: string;
  };
}
