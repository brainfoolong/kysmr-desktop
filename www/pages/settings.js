'use strict'

App.pages['settings'].load = function () {
  const page = $('#page')
  const form = page.find('form')
  const config = Storage.get('config') || {}

  App.setFormValues(form, config)

  form.parsley().on('form:submit', function () {
    let formData = App.getFormValues(form)
    Storage.set('config', $.extend({}, config, formData))
    App.toast('Config changed - You should restart this application', 'success')

    let AutoLaunch = require('auto-launch')
    let autoLauncher = new AutoLaunch({
      name: 'kysmr'
    })
    if (formData.autostart) {
      autoLauncher.enable()
    } else {
      autoLauncher.disable()
    }
    return false
  })
}