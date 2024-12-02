import { app, BrowserWindow, ipcMain } from 'electron';
import addMusicToPlaylist from './musicSuggester.js';

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 1000,
        webPreferences: {
            preload: './preload.js',
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
        },
    });
    win.loadFile('index.html');
    win.webContents.openDevTools();
}

ipcMain.handle('add-music', async (event, emotion) => {
    try {
        const trackName = await addMusicToPlaylist(emotion);
        return trackName;
    } catch (error) {
        console.error('Error adding music:', error);
        return null;
    }
});

app.whenReady().then(createWindow);