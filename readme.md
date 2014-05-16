# level-get-range[![build status](https://secure.travis-ci.org/kesla/level-get-range.png)](http://travis-ci.org/kesla/level-get-range)

Get a range from levelup

[![NPM](https://nodei.co/npm/level-get-range.png?downloads&stars)](https://nodei.co/npm/level-get-range/)

[![NPM](https://nodei.co/npm-dl/level-get-range.png)](https://nodei.co/npm/level-get-range/)

## Installation

```
npm install level-get-range
```

## Note

Currently this is a wrapper around [levelup#createReadStream](https://github.com/rvagg/node-levelup#createReadStream) but in the future it will use (if available) the functionality to read a full range from leveldown, falling back to createReadStream.

## Example

### Input

```javascript
// level-get-range work directly on leveldown, so no support for encodings for example
var db = require('level-test')()('level-get-range').db
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
```

### Output

```
The default is to get the whole database out
[ { key: '1', value: 'one!' },
  { key: '1b', value: 'one again!' },
  { key: '2', value: 'two' },
  { key: '3', value: 'three' },
  { key: '3b', value: 'three one more time' },
  { key: '4', value: 'four' } ]
If it is outside of the range you get an empty array
[]
You can use the same options as a Readable Stream
[ 'one again!', 'two', 'three', 'three one more time', 'four' ]
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

