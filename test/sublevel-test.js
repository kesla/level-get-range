module.exports = function (name, factory) {
  var test = require('tape')
    , db = require('level-sublevel')(factory('sublevel', {}))
    , sub = db.sublevel('beep-boop')
    , sub2 = db.sublevel('chicka')
    , sub3 = db.sublevel('abc')
    , sub4 = db.sublevel('foobar', { valueEncoding: 'json' })
    , getRange = require('../get-range')(sub)
    , getRange2 = require('../get-range')(sub4)

  test('setup data (running tests using ' + name + ')', function (t) {
    sub.batch([
            { type: 'put', key: '1',  value: 'one!' }
          , { type: 'put', key: '1b', value: 'one again!' }
          , { type: 'put', key: '2',  value: 'two' }
          , { type: 'put', key: '3',  value: 'three' }
          , { type: 'put', key: '3b', value: 'three one more time' }
          , { type: 'put', key: '4',  value: 'four' }
          , { type: 'put', key: '5',  value: 'five', prefix: sub2 }
          , { type: 'put', key: '6',  value: 'six', prefix: sub3 }
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
              { key: '1',  value: 'one!' }
            , { key: '1b', value: 'one again!' }
            , { key: '2',  value: 'two' }
            , { key: '3',  value: 'three' }
            , { key: '3b', value: 'three one more time' }
            , { key: '4',  value: 'four' }
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
                  'one again!'
                , 'two'
                , 'three'
                , 'three one more time'
                , 'four'
              ]
          )
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
                  '1b'
                , '2'
                , '3'
                , '3b'
                , '4'
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

  test('low buffering limit (in leveldown)', function (t) {
    getRange({
          highWaterMark: 5
        }
      , function (err, range) {
        t.error(err)
        t.deepEqual(
            range
          , [
                { key: '1',  value: 'one!' }
              , { key: '1b', value: 'one again!' }
              , { key: '2',  value: 'two' }
              , { key: '3',  value: 'three' }
              , { key: '3b', value: 'three one more time' }
              , { key: '4',  value: 'four' }
            ]
        )
        t.end()        }
      )
  })

  test('custom valueEncoding in sublevel', function (t) {
    sub4.put('hello', ['foo', 'bar'], function () {
      getRange2(function (err, range) {
        t.error(err)
        t.deepEqual(
            range
          , [ { key: 'hello', value: ['foo', 'bar'] } ]
        )

        getRange2({ valueEncoding: 'utf8' }, function (err, range) {
          t.error(err)
          t.deepEqual(
              range
            , [ { key: 'hello', value: '["foo","bar"]' } ]
          )
          t.end()
        })
      })
    })
  })
}