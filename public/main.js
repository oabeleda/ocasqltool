const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { login, logout, runSql, createDataModel, modelExists, getSession } = require('../src/data/repo');
const readConf = require('./openConfig');
const fs = require('fs').promises;
const { validateLicense, createTrialLicense, getLicenseFeatures } = require('../src/license/validator');
const { getMachineId } = require('../src/license/machineId');


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
  // Set icon path - use optimized 256x256 icon for better Linux compatibility
  let iconPath = path.join(__dirname, 'icon-256.png');
  const fs = require('fs');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '../public/icon-256.png');
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 950,
    title: "OCA Query Tool",
    icon: iconPath,
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
          filters: [{ name: 'SQL Files', extensions: ['sql'] }, { name: 'All Files', extensions: ['*'] }],
          defaultPath: 'query.sql'
        })
        if (result.canceled) return { success: false }
        savePath = result.filePath
      } else {
        // Check if file exists before overwriting
        try {
          await fs.access(savePath)
          // File exists, ask user if they want to overwrite or save as
          const result = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Overwrite', 'Save As', 'Cancel'],
            defaultId: 0,
            title: 'File exists',
            message: 'The file already exists. Do you want to overwrite it or save as a different file?'
          })

          if (result.response === 2) {
            // Cancel
            return { success: false, canceled: true }
          } else if (result.response === 1) {
            // Save As
            const saveAsResult = await dialog.showSaveDialog({
              filters: [{ name: 'SQL Files', extensions: ['sql'] }, { name: 'All Files', extensions: ['*'] }],
              defaultPath: savePath.endsWith('.sql') ? savePath : `${savePath}.sql`
            })
            if (saveAsResult.canceled) return { success: false, canceled: true }
            savePath = saveAsResult.filePath
          }
          // If response === 0 (Overwrite), continue with current savePath
        } catch (err) {
          // File doesn't exist, proceed with save
        }
      }
      await fs.writeFile(savePath, content, 'utf8')
      return { success: true, filePath: savePath }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('saveFileAs', async (_, { content, currentFilePath }) => {
    try {
      const result = await dialog.showSaveDialog({
        filters: [{ name: 'SQL Files', extensions: ['sql'] }, { name: 'All Files', extensions: ['*'] }],
        defaultPath: currentFilePath || 'query.sql'
      })
      if (result.canceled) return { success: false }
      await fs.writeFile(result.filePath, content, 'utf8')
      return { success: true, filePath: result.filePath }
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

  // SQL History file operations
  const getHistoryFilePath = () => {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, 'sqlHistory.json')
  }

  ipcMain.handle('getHistoryFile', async () => {
    try {
      const historyPath = getHistoryFilePath()
      try {
        const content = await fs.readFile(historyPath, 'utf8')
        return { success: true, content }
      } catch (err) {
        if (err.code === 'ENOENT') {
          // File doesn't exist, return empty array
          return { success: true, content: '[]' }
        }
        throw err
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('saveHistoryFile', async (_, { content }) => {
    try {
      const historyPath = getHistoryFilePath()
      await fs.writeFile(historyPath, content, 'utf8')
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  // License management handlers
  const getLicenseFilePath = () => {
    const userDataPath = app.getPath('userData')
    console.log(userDataPath)
    return path.join(userDataPath, 'license.json')
  }

  ipcMain.handle('getLicense', async () => {
    try {
      const licensePath = getLicenseFilePath()
      try {
        const content = await fs.readFile(licensePath, 'utf8')
        const license = JSON.parse(content)
        return { success: true, license }
      } catch (err) {
        if (err.code === 'ENOENT') {
          // File doesn't exist, return null
          return { success: true, license: null }
        }
        throw err
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('saveLicense', async (_, license) => {
    try {
      const licensePath = getLicenseFilePath()
      await fs.writeFile(licensePath, JSON.stringify(license, null, 2), 'utf8')
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('validateLicense', async () => {
    try {
      const licensePath = getLicenseFilePath()
      try {
        const content = await fs.readFile(licensePath, 'utf8')
        const license = JSON.parse(content)
        const result = validateLicense(license)
        return result
      } catch (err) {
        if (err.code === 'ENOENT') {
          // No license file, return invalid
          return { valid: false, error: 'No license found' }
        }
        throw err
      }
    } catch (err) {
      return { valid: false, error: err.message }
    }
  })

  ipcMain.handle('getMachineId', async () => {
    try {
      const machineId = getMachineId()
      return { success: true, machineId }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('initializeTrial', async () => {
    try {
      const licensePath = getLicenseFilePath()
      // Check if license already exists
      try {
        await fs.access(licensePath)
        // License exists, don't create trial
        return { success: true, message: 'License already exists' }
      } catch (err) {
        // License doesn't exist, create trial (machine-bound and signed)
        const machineId = getMachineId()
        const trialLicense = createTrialLicense(machineId)
        await fs.writeFile(licensePath, JSON.stringify(trialLicense, null, 2), 'utf8')
        return { success: true, message: 'Trial license created' }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('getLicenseFeatures', async () => {
    try {
      const licensePath = getLicenseFilePath()
      try {
        const content = await fs.readFile(licensePath, 'utf8')
        const license = JSON.parse(content)
        const validation = validateLicense(license)

        if (validation.valid) {
          const features = getLicenseFeatures(license.tier)
          return { success: true, features, tier: license.tier }
        } else {
          // Return trial features as default
          const features = getLicenseFeatures('trial')
          return { success: true, features, tier: 'trial' }
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          // No license, return trial features
          const features = getLicenseFeatures('trial')
          return { success: true, features, tier: 'trial' }
        }
        throw err
      }
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

