'use strict';
(function () {

  const body = $('body')
  const page = $('#page')
  const remote = require('electron').remote

  function init (el) {
    // auto label fixes
    var count = 1
    el.find('.form-group').each(function () {
      $(this).find('label').attr('for', 'field-' + count)
      $(this).find(':input').first().attr('id', 'field-' + count)
      count++
    })
    // auto sizes
    autosize(el.find('textarea'))
  }

  init(body)

  // tooltips
  body.tooltip({
    'selector': '[title]',
    'trigger': 'hover'
  })

  body.find('.appversion').text(App.electron.getVersion())

  // on page loaded
  App.on('page-loaded', function () {
    init(page)
    // mark current page
    body.find('[data-page-goto]').removeClass('current-page').filter('[data-page-goto=\'' + body.attr('data-page') + '\']').addClass('current-page')
  })

  $(document).on('click', '.submit', function () {
    $(this).closest('form').trigger('submit')
  }).on('domchanged', function () {
    $('.tooltip').remove()
  }).on('click', '[data-page-goto]', function () {
    App.loadPage($(this).attr('data-page-goto'))
  }).on('click', '.action', function () {
    switch ($(this).attr('data-action')) {
      case 'close':
        remote.getCurrentWindow().hide()
        break
    }
  })

  // devtools for f12 and reload f5
  document.addEventListener('keydown', function (e) {
    if (e.which === 123) {
      remote.getCurrentWindow().toggleDevTools()
    } else if (e.which === 116) {
      location.reload()
    } else if (e.which === 27) {
      let focusedInputs = $(':input:focus')
      if (focusedInputs.length > 0) {
        focusedInputs.blur()
        return
      }
      if (body.attr('data-page') !== 'entries') {
        App.loadPage('entries')
      } else {
        remote.getCurrentWindow().close()
      }
    }
  })

  // pipe device request to the app event listener
  require('electron').ipcRenderer.on('device-request', function (event, postData) {
    App.emit('device-request', postData)
  })
})()