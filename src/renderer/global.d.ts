export {};

declare global {
  interface Window {
    electronAPI: {
      // ... les anciennes méthodes ...
      saveIsland: (data: any) => Promise<any>;
      getSavedIslands: () => Promise<any>;
      loadIsland: (filename: string) => Promise<any>;

      // NOUVEAU
      importImage: (seed: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      getUserDataPath: () => Promise<string>;
    };
  }
}