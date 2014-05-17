module.exports = function (name, factory) {
  var test = require('tape')
    , db = factory('encoding', { keyEncoding: 'binary', valueEncoding: 'json' })
    , getRange = require('../get-range')(db)

  test('setup data (running tests using ' + name + ')', function (t) {
    db.batch([
            { type: 'put', key: new Buffer('1'),  value: [ 'one!' ] }
          , { type: 'put', key: new Buffer('1b'), value: [ 'one again!' ] }
          , { type: 'put', key: new Buffer('2'),  value: [ 'two' ] }
          , { type: 'put', key: new Buffer('3'),  value: [ 'three' ] }
          , { type: 'put', key: new Buffer('3b'), value: [ 'three one more time' ] }
          , { type: 'put', key: new Buffer('4'),  value: [ 'four' ] }
        ]
        , t.end.bind(t)
    )
  })

  test('full range', function (t) {
    getRange(function (err, range) {
      t.error(err)
      t.deepEqual(
          range
        , [
              { key: new Buffer('1'),  value: [ 'one!' ] }
            , { key: new Buffer('1b'), value: [ 'one again!' ] }
            , { key: new Buffer('2'),  value: [ 'two' ] }
            , { key: new Buffer('3'),  value: [ 'three' ] }
            , { key: new Buffer('3b'), value: [ 'three one more time' ] }
            , { key: new Buffer('4'),  value: [ 'four' ] }
          ]
      )
      t.end()
    })
  })

  test('keys: false', function (t) {
    getRange({
            gt: '1'
          , lte: '4'
          , keys: false
        }
      , function (err, range) {
          t.error(err)
          t.deepEqual(
              range
            , [
                  [ 'one again!' ]
                , [ 'two' ]
                , [ 'three' ]
                , [ 'three one more time' ]
                , [ 'four' ]
              ]
          )
          t.end()
        }
    )
  })

  test('custom encoding (in getRange-options)', function (t) {
    getRange({
            gte: '1'
          , lte: '1'
          , keyEncoding: 'utf8'
          , valueEncoding: 'utf8'
        }
      , function (err, range) {
          t.error(err)
          t.equal(range[0].key, '1')
          t.equal(range[0].value, '["one!"]')
          t.end()
        }
    )
  })

  test('values: false', function (t) {
    getRange({
            gt: '1'
          , lte: '4'
          , values: false
        }
      , function (err, range) {
          t.error(err)
          t.deepEqual(
              range
            , [
                  new Buffer('1b')
                , new Buffer('2')
                , new Buffer('3')
                , new Buffer('3b')
                , new Buffer('4')
              ]
          )
          t.end()
        }
    )
  })

  test('outside of range', function (t) {
    getRange({
            gt: '5'
        }
      , function (err, range) {
        t.error(err)
        t.deepEqual(range, [])
        t.end()
      }
    )

  })
}