module.exports = function (level) {
  var assert = require('assert')

    , db = level('encoding', { keyEncoding: 'binary', valueEncoding: 'json' })
    , getRange = require('../get-range')(db)
    , testsThatHasFinished = 0

  process.once('exit', function () {
    assert.equal(testsThatHasFinished, 5, 'all tests should be run')
  })

  db.batch([
          { type: 'put', key: new Buffer('1'),  value: [ 'one!' ] }
        , { type: 'put', key: new Buffer('1b'), value: [ 'one again!' ] }
        , { type: 'put', key: new Buffer('2'),  value: [ 'two' ] }
        , { type: 'put', key: new Buffer('3'),  value: [ 'three' ] }
        , { type: 'put', key: new Buffer('3b'), value: [ 'three one more time' ] }
        , { type: 'put', key: new Buffer('4'),  value: [ 'four' ] }
      ]
    , function () {
        getRange(function (err, range) {
          console.log('full range')
          assert.ifError(err)
          assert.deepEqual(
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
          testsThatHasFinished += 1
          console.log('\tpassed')
        })

        getRange({
                gt: '1'
              , lte: '4'
              , keys: false
            }
          , function (err, range) {
              console.log('keys: false')
              assert.ifError(err)
              assert.deepEqual(
                  range
                , [
                      [ 'one again!' ]
                    , [ 'two' ]
                    , [ 'three' ]
                    , [ 'three one more time' ]
                    , [ 'four' ]
                  ]
              )
              testsThatHasFinished += 1
              console.log('\tpassed')
            }
        )

        getRange({
                gte: '1'
              , lte: '1'
              , keyEncoding: 'utf8'
              , valueEncoding: 'utf8'
            }
          , function (err, range) {
              console.log('custom encoding (in getRange-options)')
              assert.equal(range[0].key, '1')
              assert.equal(range[0].value, '["one!"]')
              testsThatHasFinished += 1
              console.log('\tpassed')
            }
        )

        getRange({
                gt: '1'
              , lte: '4'
              , values: false
            }
          , function (err, range) {
              console.log('values: false')
              assert.ifError(err)
              assert.deepEqual(
                  range
                , [
                      new Buffer('1b')
                    , new Buffer('2')
                    , new Buffer('3')
                    , new Buffer('3b')
                    , new Buffer('4')
                  ]
              )
              testsThatHasFinished += 1
              console.log('\tpassed')
            }
        )

        getRange({
                gt: '5'
            }
          , function (err, range) {
            console.log('outside of range')
            assert.ifError(err)
            assert.deepEqual(range, [])
            testsThatHasFinished += 1
            console.log('\tpassed')
          }
        )

      }
  )
}