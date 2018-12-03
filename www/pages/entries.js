'use strict'

App.pages['entries'].load = function () {
  const page = $('#page')
  const form = page.find('form')
  const formRowTpl = form.find('.template').clone()
  const table = page.find('.table.entries')
  const aescrypt = require(__dirname + '/../scripts/aescrypt')
  const commands = [
    ['backspace', '  ', ''],
    ['delete', '  ', ''],
    ['enter', '  ', ''],
    ['tab', '  ', ''],
    ['escape', '  ', ''],
    ['up', ' Up arrow key', ''],
    ['down', ' Down arrow key', ''],
    ['right', ' Right arrow key', ''],
    ['left', ' Left arrow key', ''],
    ['home', '  ', ''],
    ['end', '  ', ''],
    ['pageup', '  ', ''],
    ['pagedown', '  ', ''],
    ['f1', '  ', ''],
    ['f2', '  ', ''],
    ['f3', '  ', ''],
    ['f4', '  ', ''],
    ['f5', '  ', ''],
    ['f6', '  ', ''],
    ['f7', '  ', ''],
    ['f8', '  ', ''],
    ['f9', '  ', ''],
    ['f10', '  ', ''],
    ['f11', '  ', ''],
    ['f12', '  ', ''],
    ['command', '  ', ''],
    ['alt', '  ', ''],
    ['control', '  ', ''],
    ['shift', '  ', ''],
    ['right_shift', '  ', ''],
    ['space', '  ', ''],
    ['printscreen', '  ', 'No Mac support'],
    ['insert', '  ', 'No Mac support'],
    ['audio_mute', ' Mute the volume', ''],
    ['audio_vol_down', ' Lower the volume', ''],
    ['audio_vol_up', ' Increase the volume', ''],
    ['audio_play', ' Play', ''],
    ['audio_stop', ' Stop', ''],
    ['audio_pause', ' Pause', ''],
    ['audio_prev', ' Previous Track', ''],
    ['audio_next', ' Next Track', ''],
    ['audio_rewind', '  ', 'Linux only'],
    ['audio_forward', '  ', 'Linux only'],
    ['audio_repeat', '  ', 'Linux only'],
    ['audio_random', '  ', 'Linux only'],
    ['numpad_0', '  ', 'No Linux support'],
    ['numpad_1', '  ', 'No Linux support'],
    ['numpad_2', '  ', 'No Linux support'],
    ['numpad_3', '  ', 'No Linux support'],
    ['numpad_4', '  ', 'No Linux support'],
    ['numpad_5', '  ', 'No Linux support'],
    ['numpad_6', '  ', 'No Linux support'],
    ['numpad_7', '  ', 'No Linux support'],
    ['numpad_8', '  ', 'No Linux support'],
    ['numpad_9', '  ', 'No Linux support'],
    ['lights_mon_up', ' Turn up monitor brightness', 'No Windows support'],
    ['lights_mon_down', ' Turn down monitor brightness', 'No Windows support'],
    ['lights_kbd_toggle', ' Toggle keyboard backlight on/off', 'No Windows support'],
    ['lights_kbd_up', ' Turn up keyboard backlight brightness', 'No Windows support'],
    ['lights_kbd_down', ' Turn down keyboard backlight brightness', 'No Windows support'],
  ]
  let editId = null
  let entryData = null
  let entries = Storage.get('entries', {})

  /**
   * Start edit of entry with given id
   * You need the password for data decryption to edit something
   * @param {number|string} id
   * @param {string=} password Must be set if id > 0
   */
  function startEditEntry (id, password) {
    editId = id
    entryData = {}
    if (editId) {
      entryData = entries[id] || null
      if (!entryData) {
        editId = 0
      } else {
        let decryptedData = aescrypt.decrypt(entryData.encrypted, password)
        form.find('.command-rows .form-row').remove()
        if (decryptedData.form.row) {
          for (let i in decryptedData.form.row) {
            addEntryRow()
          }
        }
        App.setFormValues(form, decryptedData.form)
      }
    }
    buildTable()
  }

  function buildTable () {
    $(document).trigger('domchanged')
    if (!Object.keys(entries)) {
      table.addClass('hidden')
      return
    }
    const tbody = table.find('tbody')
    tbody.empty()
    table.removeClass('hidden')
    for (const id in entries) {
      const entryData = entries[id]
      const entry = $(`
        <tr>
            <td class="label"></td>
            <td style="white-space: nowrap">
                <span class="btn btn-danger btn-sm delete" title="Delete"><i class="fa fa-times"></i></span>
                <span class="btn btn-info btn-sm edit" title="Edit"><i class="fa fa-pen"></i></span>
            </td>
        </tr>
      `)
      entry.find('.label').text(entryData.label)
      entry.attr('data-id', id)
      tbody.append(entry)
    }
  }

  function addEntryRow () {
    const clone = formRowTpl.clone().removeClass('hidden')
    form.find('.command-rows').append(clone)
    let id = 0
    let rows = $('.command-rows .form-row')
    rows.each(function () {
      $(this).find('[data-name]').each(function () {
        $(this).attr('name', 'row[' + id + '][' + $(this).attr('data-name') + ']')
      })
      id++
    })
  }

  const modal = page.find('#myModal')

  page.find('.commands').on('click', function () {
    const commandsTable = $('<table class="table"><thead><tr><th>Command</th><th>Info</th></tr></thead><tbody></tbody></table>')
    commands.forEach(function (row) {
      commandsTable.find('tbody').append(`
          <tr>
              <td>${row[0]}</td>
              <td>${row[1]}</td>
              <td>${row[2]}</td>
          </tr>
        `)
    })
    modal.find('.modal-body').html(commandsTable)
    modal.modal('show')
  })

  form.on('click', '.add-row', function () {
    addEntryRow()
  }).on('click', '.remove-row', function () {
    if ($('.command-rows .form-row').length > 1) {
      $(this).closest('.form-row').remove()
    }
  })
  form.find('.command-rows .form-row').remove()
  addEntryRow()

  page.on('change', 'select[data-name="type"]', function (ev) {
    const t = $(ev.target)
    let text = ''
    switch(t.val()){
      case "1":
        text = 'Just type your text you want to be typed by the programm'
        break;
      case "2":
        text = 'Command key list see bellow - Modifier keys (ctrl, etc...) are combined with a +'
        break;
      case "3":
        text = 'Full path executable program (Same as you would use on command line)'
        break;
      case "4":
        text = 'Wait x milliseconds before next command (1000 = 1 second)'
        break;
    }
    t.closest('.form-row').find('[data-name="value"]').attr('placeholder', text)
  })

  table.on('click', 'tbody tr', function () {
    //
  }).on('click', '.delete', function () {
    let id = $(this).closest('tr').attr('data-id')
    if (confirm('Are you sure?')) {
      delete entries[id]
      Storage.set('entries', entries)
      buildTable()
    }
  }).on('click', '.edit', function () {
    modal.find('.modal-body').html(`
      Entries are encrypted with your fingerprint. You must open the edit mode from your device.
    `)
    modal.modal('show')
  })

  App.on('device-request.edit-entry', function (postData) {
    if (postData.action === 'entry-edit' && postData.id && postData.password) {
      startEditEntry(postData.id, postData.password)
      App.toast('Edit mode started from device', 'success')
      modal.modal('hide')
    }
    if (postData.action === 'entry-delete' && postData.id && postData.password) {
      delete entries[postData.id]
      Storage.set('entries', entries)
      App.toast('Entry successfully deleted from this device', 'success')
      App.loadPage('entries')
      modal.modal('hide')
    }
  })

  startEditEntry(0)

  form.parsley().on('form:submit', function () {
    let formData = App.getFormValues(form)
    if (!editId) {
      editId = Storage.get('entriesLastId', 0) + 1
      Storage.set('entriesLastId', editId)
    }

    modal.find('.modal-body').html(`
      <div class="text-center">
        To save the entry you must confirm it with your fingerprint on your device<br/>
        <small>This application only store encrypted data on your desktop</small><br/>
        <strong>Scan this QR Code with your device</strong>
        <canvas></canvas>
      </div>
    `)

    const ip = require('ip')

    let qrcodeData = {
      'protocol': 'http',
      'ip': ip.address(),
      'port': Storage.get("config").serverPort,
      'id': editId,
      'label': formData.label,
      'username': Math.random().toString(32).substring(2)
    }
    QRCode.toCanvas(modal.find('canvas')[0], btoa(JSON.stringify(qrcodeData)), function (error) {

    })
    modal.modal('show')

    App.on('device-request.add-entry', function (postData) {
      if (postData.action === 'entry-add' && postData.id.toString() === qrcodeData.id.toString()) {
        let dataToEncrypt = {
          'form': formData,
          'username': qrcodeData.username
        }
        let entryData = {
          'id': editId,
          'label': formData.label
        }
        entryData.encrypted = aescrypt.encrypt(dataToEncrypt, postData.password)
        entries[editId] = entryData
        Storage.set('entries', entries)
        modal.modal('hide')
        App.toast('Entry successfully stored and encrypted. Now you can only edit/execute it when using your fingerprint on your device', 'success')
        App.loadPage('entries')
      }
    })
    return false
  })

}