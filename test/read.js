var tape = require('tape')
var ac = require('../')

tape('no rules, deny read', function (t) {
  t.plan(10)

  ac.read(null, null, [ '' ], function (err, allow) {
    t.error(err)
    t.notOk(allow)

    ac.read(null, null, [ '', 'a' ], function (err, allow) {
      t.error(err)
      t.notOk(allow)

      ac.read(null, null, [ '', 'a', 'b', 'c' ], function (err, allow) {
        t.error(err)
        t.notOk(allow)

        ac.read(null, null, [ 'a' ], function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.read(null, null, [ 'a', 'b', 'c' ], function (err, allow) {
            t.error(err)
            t.notOk(allow)
          })
        })
      })
    })
  })
})

tape('allow read for valid paths', function (t) {
  t.plan(12)

  var rules = {
    '.read': true,
    b: {
      '.read': false
    }
  }

  ac.read(rules, null, [ '' ], function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.read(rules, null, [ '', 'a' ], function (err, allow) {
      t.error(err)
      t.ok(allow)

      ac.read(rules, null, [ '', 'a', 'b', 'c' ], function (err, allow) {
        t.error(err)
        t.ok(allow)

        ac.read(rules, null, [ '', 'b' ], function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.read(rules, null, [ 'a' ], function (err, allow) {
            t.error(err)
            t.notOk(allow)

            ac.read(rules, null, [ 'a', 'b', 'c' ], function (err, allow) {
              t.error(err)
              t.notOk(allow)
            })
          })
        })
      })
    })
  })
})

tape('allow read dynamically', function (t) {
  t.plan(10)

  var rules = {
    '.read': function (cb) {
      cb(null, true)
    }
  }

  ac.read(rules, null, [ '' ], function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.read(rules, null, [ '', 'a' ], function (err, allow) {
      t.error(err)
      t.ok(allow)

      ac.read(rules, null, [ '', 'a', 'b', 'c' ], function (err, allow) {
        t.error(err)
        t.ok(allow)

        ac.read(rules, null, [ 'a' ], function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.read(rules, null, [ 'a', 'b', 'c' ], function (err, allow) {
            t.error(err)
            t.notOk(allow)
          })
        })
      })
    })
  })
})

tape('allow / deny read conditionally', function (t) {
  t.plan(8)

  var rules = {
    '.read': function (cb) {
      cb(null, !this.x || this.x === '0')
    },
    things: {
      '$id': {
        '.read': function (cb) {
          cb(null, this.id === '0')
        }
      }
    }
  }

  ac.read(rules, { x: '0' }, [ '' ], function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.read(rules, { x: '1' }, [ '' ], function (err, allow) {
      t.error(err)
      t.notOk(allow)

      ac.read(rules, null, [ '', 'things', '0' ], function (err, allow) {
        t.error(err)
        t.ok(allow)

        ac.read(rules, null, [ '', 'things', '1' ], function (err, allow) {
          t.error(err)
          t.notOk(allow)
        })
      })
    })
  })
})
