module.exports = function (name, factory) {
  var test = require('tape')
    , db = factory('simple', {})
    , getRange = require('../get-range')(db)

  test('setup data (running tests using ' + name + ')', function (t) {
    db.batch([
            { type: 'put', key: '1',  value: 'one!' }
          , { type: 'put', key: '1b', value: 'one again!' }
          , { type: 'put', key: '2',  value: 'two' }
          , { type: 'put', key: '3',  value: 'three' }
          , { type: 'put', key: '3b', value: 'three one more time' }
          , { type: 'put', key: '4',  value: 'four' }
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
}