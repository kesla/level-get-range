var seriesify = require('seriesify')
  , db = require('level-test')()('benchmark')
  , batch = function (callback) {
      var data = []
        , i

      for(i = 0; i < 10000; ++i)
        data.push({
            key: i + 'foo'
          , value: 'beep boop'
          , type: 'put'
        })

      db.batch(data, callback)
    }
  , stream = function (callback) {
      console.time('stream')
      var data = []

      db.createReadStream()
        .on('data', function (chunk) {
          data.push(chunk)
        })
        .once('end', function () {
          console.log(data.length)
          console.timeEnd('stream')
          callback(null, data)
        })
    }
  , getRange = function (callback) {
      console.time('getRange')

      var getRange = require('./get-range')(db)
      getRange(function () {
        console.timeEnd('getRange')
        callback()
      })
    }


seriesify()
  .add(batch)
  .add(getRange)
  .add(stream)
  .exec(function (err) {
    console.log('benchmarks finished')
  })