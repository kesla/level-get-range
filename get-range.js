// parts of this file is copied from
// https://github.com/rvagg/node-levelup/blob/master/lib/read-stream.js

var extend = require('xtend')
  , util = require('levelup-util')

  , defaultOptions = { keys: true, values: true }

  , init = function (db, options, callback) {
      var iterator = db.db.iterator(options)
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

            if (options.keys && options.values) {
              range.push({
                  key: util.decodeKey(key, options)
                , value: util.decodeValue(value, options)
              })
            } else if (options.keys) {
              range.push(util.decodeKey(key, options))
            } else if (options.values) {
              range.push(util.decodeValue(value, options))
            } else {
              range.push(null)
            }

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

        options = extend(db.options, defaultOptions, options)

        options.keyAsBuffer = util.isKeyAsBuffer(options)
        options.valueAsBuffer = util.isValueAsBuffer(options)

        if (db.isOpen())
          init(db, options, callback)
        else
          db.once('ready', function () {
            init(db, options, callback)
          })
      }
    }

module.exports = getRange