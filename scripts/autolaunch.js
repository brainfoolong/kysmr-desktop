// this code is mainly from https://www.npmjs.com/package/auto-launch

let AutoLaunch, bind = function (fn, me) { return function () { return fn.apply(me, arguments) } }
const fs = require('fs')
const path = require('path')
const Winreg = require('winreg')

const regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
})

module.exports = AutoLaunch = (function () {
  function AutoLaunch (arg) {
    let isHidden, mac, name, fullPath, versions
    name = arg.name
    isHidden = arg.isHidden
    mac = arg.mac
    fullPath = arg.path
    this.fixOpts = bind(this.fixOpts, this)
    this.isEnabled = bind(this.isEnabled, this)
    this.disable = bind(this.disable, this)
    this.enable = bind(this.enable, this)
    if (name == null) {
      throw new Error('You must specify a name')
    }
    this.opts = {
      appName: name,
      isHiddenOnLaunch: isHidden != null ? isHidden : false,
      mac: mac != null ? mac : {},
      args: arg.args
    }
    versions = typeof process !== 'undefined' && process !== null ? process.versions : void 0
    if (fullPath != null) {
      this.opts.appPath = fullPath
    } else if ((versions != null) && ((versions.nw != null) || (versions['node-webkit'] != null) || (versions.electron != null))) {
      this.opts.appPath = process.execPath
    } else {
      throw new Error('You must give a path (this is only auto-detected for NW.js and Electron apps)')
    }
    this.fixOpts()
    this.api = null
    if (/^win/.test(process.platform)) {
      this.api = {
        enable: function (arg) {
          let appName, appPath, isHiddenOnLaunch
          appName = arg.appName, appPath = arg.appPath, isHiddenOnLaunch = arg.isHiddenOnLaunch
          console.log(arg)
          return new Promise(function (resolve, reject) {
            let args, pathToAutoLaunchedApp, ref, updateDotExe
            pathToAutoLaunchedApp = appPath
            let startArgs = ''
            if (arg.args) {
              startArgs += ' ' + arg.args
            }
            if (isHiddenOnLaunch) {
              startArgs += ' --hidden '
            }
            args = startArgs
            updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe')
            if ((((ref = process.versions) != null ? ref.electron : void 0) != null) && fs.existsSync(updateDotExe)) {
              pathToAutoLaunchedApp = updateDotExe
              args = ' --processStart "' + (path.basename(process.execPath)) + '"'
              args += ' --process-start-args "' + startArgs + '"'
            }
            return regKey.set(appName, Winreg.REG_SZ, '"' + pathToAutoLaunchedApp + '"' + args, function (err) {
              if (err != null) {
                return reject(err)
              }
              return resolve()
            })
          })
        },
        disable: function (appName) {
          return new Promise(function (resolve, reject) {
            return regKey.remove(appName, function (err) {
              if (err != null) {
                if (err.message.indexOf('The system was unable to find the specified registry key or value') !== -1) {
                  return resolve(false)
                }
                return reject(err)
              }
              return resolve()
            })
          })
        },
        isEnabled: function (appName) {
          return new Promise(function (resolve, reject) {
            return regKey.get(appName, function (err, item) {
              if (err != null) {
                return resolve(false)
              }
              return resolve(item != null)
            })
          })
        }
      }
    } else {
      throw new Error('Unsupported platform')
    }
  }

  AutoLaunch.prototype.enable = function () {
    return this.api.enable(this.opts)
  }

  AutoLaunch.prototype.disable = function () {
    return this.api.disable(this.opts.appName, this.opts.mac)
  }

  AutoLaunch.prototype.isEnabled = function () {
    return this.api.isEnabled(this.opts.appName, this.opts.mac)
  }

  AutoLaunch.prototype.fixOpts = function () {
    let tempPath
    this.opts.appPath = this.opts.appPath.replace(/\/$/, '')
    if (this.opts.appPath.indexOf('/') !== -1) {
      tempPath = this.opts.appPath.split('/')
      this.opts.appName = tempPath[tempPath.length - 1]
    } else if (this.opts.appPath.indexOf('\\') !== -1) {
      tempPath = this.opts.appPath.split('\\')
      this.opts.appName = tempPath[tempPath.length - 1]
      this.opts.appName = this.opts.appName.substr(0, this.opts.appName.length - '.exe'.length)
    }
  }

  return AutoLaunch

})()