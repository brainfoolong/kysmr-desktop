module.exports = {
  'get': function (key) {
    if (!process.argv) {
      return null
    }
    for (let i in process.argv) {
      if (i === 0) {continue}
      let valueSplit = process.argv[i].split('=')
      if (valueSplit[0] === key) {
        return valueSplit.length > 1 ? valueSplit[1] : true
      }
    }
    return null
  }
}