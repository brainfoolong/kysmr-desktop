'use strict'

let App = {}

/**
 * @type {Electron.App}
 */
App.electron = require('electron').remote.app

/**
 * @type {number}
 */
App.disclaimerVersion = 1

/**
 * Setup the app
 */
App.setup = function () {
  let start = function () {
    App.initialize()
  }
  start()
}

/**
 * Existing pages, will be filled when first called, or prefill with some data if required
 */
App.pages = {}

/**
 * Get object value
 * @param {object=} object
 * @param {string} key
 * @returns {*}
 */
App.getObjectValue = function (object, key) {
  if (!object) {
    return undefined
  }
  let s = key.split('[')
  let v = object
  for (let i in s) {
    let subKey = s[i].replace(/\]/ig, '')
    if (typeof v[subKey] === 'undefined') {
      return undefined
    }
    v = v[subKey]
  }
  return v
}

/**
 * Set the page title
 * @param {string=} overrideTitle
 */
App.setPageTitle = function (overrideTitle) {
  let text = 'Keysenda'
  if (overrideTitle) {
    text = overrideTitle
  }
  $('.navbar .title').html(text)
}

/**
 * Initialize the app - Set all to defaults
 * Could be called multiple times on app lifetime
 */
App.initialize = function () {
  App.loadPage('entries')
}

/**
 * Load a page
 * @param {string} page
 * @param {object=} params
 * @param {function=} callback
 */
App.loadPage = function (page, params, callback) {
  // jump to news on version change
  if (!Storage.get('news-' + App.electron.getVersion()) && page !== 'news') {
    page = 'news'
  }
  // stay to disclaimer page if it is not yet accepted
  if (!Storage.get('disclaimer-' + App.disclaimerVersion) && page !== 'disclaimer') {
    page = 'disclaimer'
    App.toast('You must accept the disclaimer to proceed', 'error')
  }

  if (typeof App.pages[page] === 'undefined') {
    App.pages[page] = {}
  }
  $.get('pages/' + page + '.html', function (html) {
    $('#page').html(html)
    $('body').attr('data-page', page)
    $.getScript('pages/' + page + '.js', function () {
      setTimeout(function () {
        try {
          if (App.pages[page] && App.pages[page].load) {
            App.pages[page].load()
          }
          if (callback) callback()
        } catch (e) {
          console.error(e)
        }
        App.emit('page-loaded', [page, params])
      }, 50)
    })
  })
}

/**
 * A quick way to display a toast
 * @param {string} message
 * @param {string} type
 * @param {number=} delay
 */
App.toast = function (message, type, delay) {
  if (!type) {
    type = 'info'
  }
  if (!delay) {
    delay = 5000
  }
  let cssClass = 'info'
  if (type === 'success') {
    cssClass = 'success'
  }
  if (type === 'error') {
    cssClass = 'danger'
  }
  $.notify({
    message: '&nbsp; ' + message,
    icon: 'fas fa-info'
  }, {
    'type': cssClass,
    'delay': delay,
    'position': 'fixed',
    'spacing': 5,
    'offset': 0,
    placement: {
      from: 'top',
      align: 'center'
    },
  })
}

/**
 * Get form values as object
 * @param {jQuery} el
 * @return {Object}
 */
App.getFormValues = function (el) {
  return $(el).serializeJSON({checkboxUncheckedValue: 'false'})
}

/**
 * Set form values that are previously retreived by getFormValues
 * @param {jQuery} el
 * @param {object} formValues
 * @param {string=} fieldNamePrefix
 * @return {Object}
 */
App.setFormValues = function (el, formValues, fieldNamePrefix) {
  if (!formValues) {
    return
  }
  for (let key in formValues) {
    let fieldName = key
    if (fieldNamePrefix) {
      fieldName = fieldNamePrefix + '[' + fieldName + ']'
    }
    let input = el.find('[name=\'' + fieldName + '\']')
    if (!input.length) {
      input = el.find('[name^=\'' + fieldName + ':\']')
    }
    let value = formValues[key]
    if (input.length) {
      // radio and checkboxes are specials
      if (input.is('[type=\'checkbox\'],[type=\'radio\']')) {
        input.prop('checked', false).filter('[value=\'' + value + '\']').prop('checked', true).trigger('change')
      } else {
        input.val(value).trigger('change')
      }
    }
    if (value === Object(value)) {
      App.setFormValues(el, value, fieldName)
    }
  }
}

// start the magic
App.setup()

Events(App)