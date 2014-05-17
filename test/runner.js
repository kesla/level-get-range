var level = require('level-test')()

require('./simple-test.js')(level)
require('./encoding-test.js')(level)