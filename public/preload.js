const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    run: (params) => ipcRenderer.invoke('run', params),
    logout: (params) => ipcRenderer.invoke('logout', params),    
    login: (params) => ipcRenderer.invoke('login', params),
    isConnected: () => ipcRenderer.invoke('isConnected'),
    getConnections: () => ipcRenderer.invoke('getConnections'),
})