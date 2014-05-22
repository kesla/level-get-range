var level = require('level-test')()
  , subLevel = require('level-sublevel')

  , db = level('level-get-range', { valueEncoding: 'json' })
  , sub = subLevel(db).sublevel('test')
  , getRange = require('./get-range')(db)
  , subRange = require('./get-range')(sub)

//first put in some data
db.batch([
        { key: '1',  value: [ 'one!', '1', 'ett' ], type: 'put' }
      , { key: '1b',  value: [ 'one again!', 'ett igen'], type: 'put' }
      , { key: '2',  value: 'two', type: 'put' }
      , { key: '3',  value: 'three', type: 'put' }
      , { key: '3b',  value: { three: 'one more time' }, type: 'put' }
      , { key: '4',  value: 'four', type: 'put' }
    ]
  , function () {
      getRange(function (err, range) {
        console.log('The default is to get the whole database out')
        console.log('It is pretty neat that custom encodings are supported')
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
              console.log('You can use the same options as to a Readable Stream')
              console.log(values)

              sub.batch([
                      { key: '5', value: 'five', type: 'put' }
                    , { key: '6', value: 'six', type: 'put' }
                    , { key: '7', value: 'seven', type: 'put' }
                  ]
                , function () {
                    subRange(function (err, range) {
                      console.log('builtin support for sublevel!')
                      console.log(range)
                    })
                  }
              )
            }
        )
      })
    }
)
