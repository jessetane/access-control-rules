var tape = require('tape')
var ac = require('../')

tape('no rules, deny write', function (t) {
  t.plan(10)

  ac.write(null, null, [ '' ], null, function (err, allow) {
    t.error(err)
    t.notOk(allow)

    ac.write(null, null, [ '', 'a' ], null, function (err, allow) {
      t.error(err)
      t.notOk(allow)

      ac.write(null, null, [ '', 'a', 'b', 'c' ], null, function (err, allow) {
        t.error(err)
        t.notOk(allow)

        ac.write(null, null, [ 'a' ], null, function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.write(null, null, [ 'a', 'b', 'c' ], null, function (err, allow) {
            t.error(err)
            t.notOk(allow)
          })
        })
      })
    })
  })
})

tape('allow write for valid paths', function (t) {
  t.plan(12)

  var rules = {
    '.write': true,
    b: {
      '.write': false
    }
  }

  ac.write(rules, null, [ '' ], null, function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.write(rules, null, [ '', 'a' ], null, function (err, allow) {
      t.error(err)
      t.ok(allow)

      ac.write(rules, null, [ '', 'a', 'b', 'c' ], null, function (err, allow) {
        t.error(err)
        t.ok(allow)

        ac.write(rules, null, [ '', 'b' ], null, function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.write(rules, null, [ 'a' ], null, function (err, allow) {
            t.error(err)
            t.notOk(allow)

            ac.write(rules, null, [ 'a', 'b', 'c' ], null, function (err, allow) {
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
    '.write': function (value, cb) {
      cb(null, true)
    }
  }

  ac.write(rules, null, [ '' ], null, function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.write(rules, null, [ '', 'a' ], null, function (err, allow) {
      t.error(err)
      t.ok(allow)

      ac.write(rules, null, [ '', 'a', 'b', 'c' ], null, function (err, allow) {
        t.error(err)
        t.ok(allow)

        ac.write(rules, null, [ 'a' ], null, function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.write(rules, null, [ 'a', 'b', 'c' ], null, function (err, allow) {
            t.error(err)
            t.notOk(allow)
          })
        })
      })
    })
  })
})

tape('allow / deny write conditionally', function (t) {
  t.plan(12)

  var rules = {
    '.write': function (value, cb) {
      cb(null, !this.x || this.x === '0')
    },
    things: {
      '$id': {
        '.write': function (value, cb) {
          cb(null, this.id === '0')
        }
      }
    },
    createButNotDelete: {
      '.write': function (value, cb) {
        cb(null, value !== undefined && value !== null)
      }
    }
  }

  ac.write(rules, { x: '0' }, [ '' ], null, function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.write(rules, { x: '1' }, [ '' ], null, function (err, allow) {
      t.error(err)
      t.notOk(allow)

      ac.write(rules, null, [ '', 'things', '0' ], null, function (err, allow) {
        t.error(err)
        t.ok(allow)

        ac.write(rules, null, [ '', 'things', '1' ], null, function (err, allow) {
          t.error(err)
          t.notOk(allow)

          ac.write(rules, null, [ '', 'createButNotDelete' ], 'value', function (err, allow) {
            t.error(err)
            t.ok(allow)

            ac.write(rules, null, [ '', 'createButNotDelete' ], null, function (err, allow) {
              t.error(err)
              t.notOk(allow)
            })
          })
        })
      })
    })
  })
})

tape('allow write unless value contains reserved field', function (t) {
  t.plan(8)

  var rules = {
    things: {
      '$id': {
        '.write': true,
        reserved: {
          '.write': false
        },
        nested: {
          reserved: {
            '.write': false
          }
        }
      }
    }
  }

  ac.write(rules, null, '/things/0'.split('/'), { x: 42 }, function (err, allow) {
    t.error(err)
    t.ok(allow)

    ac.write(rules, null, '/things/0'.split('/'), { nested: { x: 42 }}, function (err, allow) {
      t.error(err)
      t.ok(allow)

      ac.write(rules, null, '/things/0'.split('/'), { reserved: 42 }, function (err, allow) {
        t.error(err)
        t.notOk(allow)

        ac.write(rules, null, '/things/0'.split('/'), { nested: { reserved: 42 }}, function (err, allow) {
          t.error(err)
          t.notOk(allow)
        })
      })
    })
  })
})
