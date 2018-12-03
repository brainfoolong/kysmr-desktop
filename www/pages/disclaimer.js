'use strict'

App.pages['disclaimer'].load = function () {
  const page = $('#page')
  if (!Storage.get('disclaimer-'+App.disclaimerVersion)) {
    page.find('.accept').removeClass('hidden')
  }
  page.find('.accept').on('click', function () {
    Storage.set('disclaimer-' + App.disclaimerVersion, true)
    App.toast('Thanks. Have fun in here.', 'success')
    App.loadPage('news')
  })
}