import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveIsland: (data: any) => ipcRenderer.invoke('save-island', data),
  getSavedIslands: () => ipcRenderer.invoke('get-saved-islands'),
  loadIsland: (filename: string) => ipcRenderer.invoke('load-island', filename),
  
  // NOUVEAU
  importImage: (seed: string) => ipcRenderer.invoke('import-image', { seed }),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
});