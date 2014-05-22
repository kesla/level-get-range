var path = require('path')

  , levelup = require('levelup')
  , extend = require('xtend')
  , rimraf = require('rimraf')
  , tmpdir = require('os').tmpdir()

  , memdownFactory = function (name, opts) {
      return levelup(name, extend(opts, { db: require('memdown') }))
    }
  , levelupFactory = function (name, opts) {
      var dir = path.join(tmpdir, name)

      rimraf.sync(dir)

      return levelup(dir, extend(opts, { db: require('leveldown') }))
    }


require('./simple-test.js')('memdown', memdownFactory)
require('./simple-test.js')('memdown', memdownFactory)

require('./encoding-test.js')('leveldown-0.11-wip', levelupFactory)
require('./simple-test.js')('leveldown-0.11-wip', levelupFactory)
require('./sublevel-test.js')('leveldown-0.11-wip-sublevel', levelupFactory)
