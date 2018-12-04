// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray} = require('electron')
const qs = require('querystring')
const http = require('http')
const Storage = require(__dirname + '/storage')
const path = require('path')
const cliargs = require(__dirname + '/cliargs')
const exec = require('child_process').exec

if (!app.requestSingleInstanceLock()) {
  app.quit()
  return
}

if (cliargs.get('--dev')) {
  require('electron-reload')(path.join(__dirname, '..', 'www'), {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  })
}

let server
let tray
let mainWindow

function serverStart () {
  if (server) {
    server.close(() => {})
    setImmediate(function () {server.emit('close')})
  }
  let config = Storage.get('config') || {}
  let defaults = {
    serverPort: 8732,
    serverHost: '0.0.0.0'
  }
  let update = false
  for (let i in defaults) {
    if (typeof config[i] === 'undefined') {
      config[i] = defaults[i]
      update = true
    }
  }
  if (update) Storage.set('config', config)
  server = http.createServer(serverResponse)
  server.listen(config.serverPort, config.serverHost, (err) => {
    if (err) {
      return console.error(err)
    }
  })
}

function serverResponse (request, response) {
  if (request.method === 'POST') {
    let body = ''
    request.on('data', function (data) {
      body += data
    })
    request.on('end', async function () {
      const postData = qs.parse(body)
      if (postData.action === 'entry-execute' && postData.password) {
        const aescrypt = require(__dirname + '/aescrypt')
        const robot = require('robotjs')
        const entryData = Storage.get('entries')[postData.id]
        let decryptedData = aescrypt.decrypt(entryData.encrypted, postData.password)
        if (decryptedData.form.row) {
          for (let i in decryptedData.form.row) {
            let rowData = decryptedData.form.row[i]
            switch (rowData.type.toString()) {
              case '1':
                robot.typeString(rowData.value)
                break
              case '2':
                let commands = rowData.value.toLowerCase().replace(/\s/ig, '').split(',')
                commands.forEach(function (command) {
                  let modifiers = []
                  let useKey = null
                  let split = command.split('+')
                  split.forEach(function (key) {
                    if (key.match(/^(command|control|shift|alt)$/)) {
                      modifiers.push(key)
                    } else {
                      useKey = key
                    }
                  })
                  robot.keyTap(useKey, modifiers)
                })
                break
              case '3':
                exec(rowData.value, function callback (error, stdout, stderr) {

                })
                break
              case '4':
                await new Promise(function (resolve) {
                  setTimeout(resolve, parseInt(rowData.value))
                })
                break
            }
          }
        }
      }
      if (mainWindow) {
        mainWindow.webContents.send('device-request', postData)
      }
      response.end('1')
    })
  }
}

function openWindow () {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      show: true,
      icon: __dirname + '/../www/img/appicon-white.ico',
      frame: false
    })
    mainWindow.setMenu(null)
    mainWindow.on('minimize', function (event) {
      event.preventDefault()
      mainWindow.hide()
    })
    mainWindow.on('close', function (event) {
      if (!app.isQuiting) {
        event.preventDefault()
        mainWindow.hide()
      }
      return false
    })
    mainWindow.loadFile('www/index.html')
    mainWindow.webContents.on('new-window', function (event, url) {
      event.preventDefault()
      require('electron').shell.openExternal(url)
    })
  } else {
    mainWindow.show()
  }
}

function ready () {
  let contextMenu = Menu.buildFromTemplate([
    {label: 'Open Interface', click: openWindow},
    {label: 'Quit', click: quit}
  ])

  tray = new Tray(__dirname + '/../www/img/appicon-white.ico')
  tray.setContextMenu(contextMenu)
  tray.on('click', openWindow)

  serverStart()

  if (!cliargs.get('--nowindow')) {
    openWindow()
  }
}

function quit () {
  setTimeout(function () {
    app.quit()
  }, 1000)
  if (mainWindow) {
    mainWindow.destroy()
  }
  if (tray) {
    tray.destroy()
  }
  try {
    if (server) {
      server.close(() => {})
      setImmediate(function () {server.emit('close')})
    }
  } catch (e) {

  }
}

app.on('ready', ready)
app.on('second-instance', openWindow)