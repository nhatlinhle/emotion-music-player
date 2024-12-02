import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    detectEmotion: () => ipcRenderer.invoke('detect-emotion'),
    addMusicToPlaylist: (emotion) => ipcRenderer.invoke('add-music', emotion),
});