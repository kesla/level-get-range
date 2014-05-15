var endpoint = require('endpoint')

  , getRange = function (db) {
      return function (options, callback) {
        if (typeof(options) === 'function') {
          callback = options
          options = {}
        }

        db.createReadStream(options).pipe(endpoint({objectMode: true}, callback))
      }
    }

module.exports = getRange