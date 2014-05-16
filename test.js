var assert = require('assert')

  , db = require('level-test')()('level-get-range')
  // use leveldown
  , getRange = require('./get-range')(db)
  , testsThatHasFinished = 0

process.once('exit', function () {
  assert.equal(testsThatHasFinished, 3, 'all tests should be run')
})

db.batch([
        { key: '1',  value: 'one!', type: 'put' }
      , { key: '1b',  value: 'one again!', type: 'put' }
      , { key: '2',  value: 'two', type: 'put' }
      , { key: '3',  value: 'three', type: 'put' }
      , { key: '3b',  value: 'three one more time', type: 'put' }
      , { key: '4',  value: 'four', type: 'put' }
    ]
  , function () {
      getRange({ keyAsBuffer: false, valueAsBuffer: false }, function (err, range) {
        assert.ifError(err)
        assert.deepEqual(
            range
          , [
                { key: '1', value: 'one!' }
              , { key: '1b', value: 'one again!' }
              , { key: '2', value: 'two' }
              , { key: '3', value: 'three' }
              , { key: '3b', value: 'three one more time' }
              , { key: '4', value: 'four' }
            ]
          )
        testsThatHasFinished += 1
      })

      getRange({
              gt: '1'
            , lte: '4'
            , keys: false
            , valueAsBuffer: false
          }
        , function (err, range) {
            assert.ifError(err)
            assert.deepEqual(
                range
              , [ 'one again!', 'two', 'three', 'three one more time', 'four' ]
            )
            testsThatHasFinished += 1
          }
      )


      getRange({
              gt: '5'
          }
        , function (err, range) {
          assert.ifError(err)
          assert.deepEqual(range, [])
          testsThatHasFinished += 1
        }
      )

    }
)