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

  , init = function (db, root, options, callback) {
      var iterator = root.db.iterator(options)
        , range = []
        , makeData = makeDataFactory(options)
        , finish = function () {
            iterator.end(function (err) {
              if (err) return callback(err)

              if (db.prefix) {
                var p = db.prefix()

                if (options.values === false) {
                  range = range.map(function (key) {
                    return key.slice(p.length)
                  })
                } else if (!(options.keys === false)) {
                  range.forEach(function (obj) {
                    obj.key = obj.key.slice(p.length)
                  })
                }
              }

              callback(null, range)
            })
          }
        , readBuffer = function (err, array) {
            if (array[array.length - 1] === null) {
              array.length = array.length - 1
              range = range.concat(array.map(function (obj) {
                return makeData(obj.key, obj.value)
              }))
              return finish()
            }

            range = range.concat(array.map(function (obj) {
              return makeData(obj.key, obj.value)
            }))
            iterator.binding.next(readBuffer)

          }
        , read = function (err, key, value) {
            if (err) return callback(err)

            if (!arguments.length) {
              return finish()
            }

            range.push(makeData(key, value))

            iterator.next(read)
          }

      if (iterator.binding)
        iterator.binding.next(readBuffer)
      else
        iterator.next(read)
    }
  , getRoot = function (db) {
      if(!db._parent) return db
      return getRoot(db._parent)
    }
  , noop = function () {}
  , getRange = function (db) {
      var root = getRoot(db)
        , prefix = noop

      if (db.prefix) {
        prefix = function (options) {
          ['gt', 'gte', 'lt', 'lte'].forEach(function (key) {
            if (options[key] !== undefined)
              options[key] = db.prefix(options[key])
          })
          options.start = db.prefix(options.start)
          options.end = db.prefix(options.end || db.options.sep)
        }
      }

      return function (options, callback) {
        if (typeof(options) === 'function') {
          callback = options
          options = {}
        }

        options = extend(root.options, db.options, defaultOptions, options)

        prefix(options)

        options.keyAsBuffer = util.isKeyAsBuffer(options)
        options.valueAsBuffer = util.isValueAsBuffer(options)

        if (root.isOpen())
          init(db, root, options, callback)
        else
          root.once('ready', function () {
            init(db, root, options, callback)
          })
      }
    }

module.exports = getRange