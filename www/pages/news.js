'use strict'

App.pages['news'].load = function () {
  const page = $('#page')
  Storage.set('news-' + App.electron.getVersion(), true)
}