var db = require('level-test')()('level-get-range')
  , getRange = require('./get-range')(db)

//first put in some data
db.batch([
        { key: '1',  value: 'one!', type: 'put' }
      , { key: '1b',  value: 'one again!', type: 'put' }
      , { key: '2',  value: 'two', type: 'put' }
      , { key: '3',  value: 'three', type: 'put' }
      , { key: '3b',  value: 'three one more time', type: 'put' }
      , { key: '4',  value: 'four', type: 'put' }
    ]
  , function () {
      getRange(function (err, range) {
        console.log('The default is to get the whole database out')
        console.log(range)

        getRange({
                gt: '5'
            }
          , function (err, range) {
            console.log('If it is outside of the range you get an empty array')
            console.log(range)
          }
        )

        getRange({
                gt: '1'
              , lte: '4'
              , keys: false
            }
          , function (err, values) {
              console.log('You can use the same options as a Readable Stream')
              console.log(values)
            }
        )
      })
    }
)