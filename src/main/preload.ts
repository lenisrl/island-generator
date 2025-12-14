import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveIsland: (data: any) => ipcRenderer.invoke('save-island', data),
  getSavedIslands: () => ipcRenderer.invoke('get-saved-islands'), // Nouveau
  loadIsland: (filename: string) => ipcRenderer.invoke('load-island', filename) // Prend un argument maintenant
});