const CryptoJS = require('crypto-js')
const toJson = {
  stringify: function (cipherParams) {
    let j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)}
    if (cipherParams.iv) j.iv = cipherParams.iv.toString()
    if (cipherParams.salt) j.s = cipherParams.salt.toString()
    return JSON.stringify(j).replace(/\s/g, '')
  },
  parse: function (jsonStr) {
    let j = JSON.parse(jsonStr)
    let cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)})
    if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
    if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
    return cipherParams
  }
}
module.exports = {
  'decrypt': function (encryptedData, password) {
    return JSON.parse(CryptoJS.AES.decrypt(encryptedData, password, {format: toJson}).toString(CryptoJS.enc.Utf8))
  },
  'encrypt': function (dataToEncrypt, password) {
    return CryptoJS.AES.encrypt(JSON.stringify(dataToEncrypt), password, {format: toJson}).toString()
  }
}