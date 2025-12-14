export {};

declare global {
  interface Window {
    electronAPI: {
      saveIsland: (data: any) => Promise<{ success: boolean; filename?: string; error?: string }>;
      getSavedIslands: () => Promise<{ success: boolean; saves?: any[]; error?: string }>;
      loadIsland: (filename: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    };
  }
}