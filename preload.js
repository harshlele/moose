const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadUrl: (urlString) => ipcRenderer.invoke('loadUrl',urlString)
});