import { create } from 'zustand';

export interface Config {
  id: string;
  name: string;
  created: string;
  enabled: boolean;
}

interface ConfigStore {
  configs: Config[];
  isLoading: boolean;
  error: string | null;
  maxConfigs: number;

  setConfigs: (configs: Config[]) => void;
  addConfig: (config: Config) => void;
  removeConfig: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setMaxConfigs: (max: number) => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
  configs: [],
  isLoading: false,
  error: null,
  maxConfigs: 3,

  setConfigs: (configs) => set({ configs }),
  addConfig: (config) =>
    set((state) => ({
      configs: [...state.configs, config],
    })),
  removeConfig: (id) =>
    set((state) => ({
      configs: state.configs.filter((c) => c.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setMaxConfigs: (max) => set({ maxConfigs: max }),
}));
