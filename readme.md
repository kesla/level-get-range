# level-get-range[![build status](https://secure.travis-ci.org/kesla/level-get-range.png)](http://travis-ci.org/kesla/level-get-range)

Get a range from levelup

[![NPM](https://nodei.co/npm/level-get-range.png?downloads&stars)](https://nodei.co/npm/level-get-range/)

[![NPM](https://nodei.co/npm-dl/level-get-range.png)](https://nodei.co/npm/level-get-range/)

## Installation

```
npm install level-get-range
```

## How does it work?

If you are running with a leveldown-compatible version that support buffering (as the time of this writing that's only available in the upcoming [leveldown 0.11](https://github.com/rvagg/node-leveldown/pull/91)) it'll use that - otherwise it'll buffer up from the iterator manually and then respond with the buffered array.

## Example

### Input

```javascript
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
```

### Output

```
The default is to get the whole database out
It is pretty neat that custom encodings are supported
[ { key: '1', value: [ 'one!', '1', 'ett' ] },
  { key: '1b', value: [ 'one again!', 'ett igen' ] },
  { key: '2', value: 'two' },
  { key: '3', value: 'three' },
  { key: '3b', value: { three: 'one more time' } },
  { key: '4', value: 'four' } ]
If it is outside of the range you get an empty array
[]
You can use the same options as to a Readable Stream
[ [ 'one again!', 'ett igen' ],
  'two',
  'three',
  { three: 'one more time' },
  'four' ]
builtin support for sublevel!
[ { key: '5', value: 'five' },
  { key: '6', value: 'six' },
  { key: '7', value: 'seven' } ]
```

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

