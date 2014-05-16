var init = function (leveldown, options, callback) {
      var iterator = leveldown.iterator(options)
        , range = []
        , read = function (err, key, value) {
            if (err) return callback(err)

            if (!arguments.length) {
              iterator.end(function (err) {
                if (err) return callback(err)
                callback(null, range)
              })
              return
            }

            if (options.keys === false)
              range.push(value)
            else if (options.values === false)
              range.push(key)
            else
              range.push({ key: key, value: value })

            iterator.next(read)
          }

      iterator.next(read)
    }
  , getRange = function (db) {
      return function (options, callback) {
        if (typeof(options) === 'function') {
          callback = options
          options = {}
        }

        if (db.isOpen())
          init(db.db, options, callback)
        else
          db.once('ready', function () {
            init(db.db, options, callback)
          })
      }
    }

module.exports = getRange