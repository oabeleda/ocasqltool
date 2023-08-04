const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { login, logout, runSql, createDataModel, modelExists, getSession } = require('../src/data/repo');
const readConf = require('./openConfig');


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
    const data = readConf(`${__dirname}/sqltool.conf`)
    return data
  })

  ipcMain.handle('logout', async () => {
    const ret = await logout()
    return ret
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

