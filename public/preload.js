const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    run: (params) => ipcRenderer.invoke('run', params),
    logout: (params) => ipcRenderer.invoke('logout', params),
    login: (params) => ipcRenderer.invoke('login', params),
    isConnected: () => ipcRenderer.invoke('isConnected'),
    getConnections: () => ipcRenderer.invoke('getConnections'),
    saveConnections: (data) => ipcRenderer.invoke('saveConnections', data),
    saveFile: (params) => ipcRenderer.invoke('saveFile', params),
    saveFileAs: (params) => ipcRenderer.invoke('saveFileAs', params),
    openFile: () => ipcRenderer.invoke('openFile'),
    getHistoryFile: () => ipcRenderer.invoke('getHistoryFile'),
    saveHistoryFile: (params) => ipcRenderer.invoke('saveHistoryFile', params),
    // License APIs
    getLicense: () => ipcRenderer.invoke('getLicense'),
    saveLicense: (license) => ipcRenderer.invoke('saveLicense', license),
    validateLicense: () => ipcRenderer.invoke('validateLicense'),
    getMachineId: () => ipcRenderer.invoke('getMachineId'),
    initializeTrial: () => ipcRenderer.invoke('initializeTrial'),
    getLicenseFeatures: () => ipcRenderer.invoke('getLicenseFeatures'),
})