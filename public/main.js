const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { login, logout, runSql, createDataModel, modelExists, getSession } = require('../src/data/repo');
const readConf = require('./openConfig');
const fs = require('fs').promises;


const connect = async (url, user, password) => {
  login(url, user, password)
  const [response, error] = await modelExists()

  if (error) return [null, error]

  if (response === 'true')
    return [true, null]
  else {
    const [_, error] = await createDataModel()
    if (error) {
      return [null, error]
    }
    else return [true, null]
  }
}

const isConnected = () => Object.keys(getSession()).length > 0

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 950,
    title: "OCA Query Tool",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.setMenu(null)

  win.loadURL(
    !app.isPackaged
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  
  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(() => {
  ipcMain.handle('login', async (_, { url, user, password }) => {
    const ret = await connect(url, user, password)
    return ret
  })

  ipcMain.handle('isConnected', async () => {
    return await isConnected()
  })

  ipcMain.handle('run', async (_, { sql, rows }) => {
    const ret = await runSql(sql, rows)
    return ret
  })

  ipcMain.handle('getConnections', async () =>  {
    const data = await readConf(`${__dirname}/sqltool.conf`)
    console.log({data})
    return data
  })

  ipcMain.handle('logout', async () => {
    const ret = await logout()
    return ret
  })

  ipcMain.handle('saveConnections', async (_, data) => {
    try {
      await fs.writeFile(`${__dirname}/sqltool.conf`, data, 'utf8')
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('saveFile', async (_, { content, filePath }) => {
    try {
      let savePath = filePath
      if (!savePath) {
        const result = await dialog.showSaveDialog({
          filters: [{ name: 'SQL Files', extensions: ['sql'] }, { name: 'All Files', extensions: ['*'] }]
        })
        if (result.canceled) return { success: false }
        savePath = result.filePath
      }
      await fs.writeFile(savePath, content, 'utf8')
      return { success: true, filePath: savePath }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('openFile', async () => {
    try {
      const result = await dialog.showOpenDialog({
        filters: [{ name: 'SQL Files', extensions: ['sql'] }, { name: 'All Files', extensions: ['*'] }],
        properties: ['openFile']
      })
      if (result.canceled) return { success: false }
      const content = await fs.readFile(result.filePaths[0], 'utf8')
      return { success: true, content, filePath: result.filePaths[0] }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  createWindow()
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

