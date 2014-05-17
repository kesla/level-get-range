// parts of this file is copied from
// https://github.com/rvagg/node-levelup/blob/master/lib/read-stream.js

var extend = require('xtend')
  , util = require('levelup-util')

  , defaultOptions = { keys: true, values: true }

  , makeDataFactory = function (options) {
    var makeKeyValueData = function (key, value) {
          return {
              key: util.decodeKey(key, options)
            , value: util.decodeValue(value, options)
          }
        }
      , makeKeyData = function (key) {
          return util.decodeKey(key, options)
        }
      , makeValueData = function (_, value) {
          return util.decodeValue(value, options)
        }
      , makeNoData = function () { return null }

    return options.keys && options.values
      ? makeKeyValueData : options.keys
        ? makeKeyData : options.values
          ? makeValueData : makeNoData
  }

  , init = function (db, options, callback) {
      var iterator = db.db.iterator(options)
        , range = []
        , makeData = makeDataFactory(options)
        , read = function (err, key, value) {
            if (err) return callback(err)

            if (!arguments.length) {
              iterator.end(function (err) {
                if (err) return callback(err)
                callback(null, range)
              })
              return
            }

            range.push(makeData(key, value))

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