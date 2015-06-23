var tape = require('tape')
var ac = require('../')

tape('no rules, deny write', function (t) {
  t.plan(5)

  t.notOk(ac.write(null, null, [ '' ]))
  t.notOk(ac.write(null, null, [ '', 'a' ]))
  t.notOk(ac.write(null, null, [ '', 'a', 'b', 'c' ]))
  t.notOk(ac.write(null, null, [ 'a' ]))
  t.notOk(ac.write(null, null, [ 'a', 'b', 'c' ]))
})

tape('allow write for valid paths', function (t) {
  t.plan(6)

  var rules = {
    '.write': true,
    b: {
      '.write': false
    }
  }

  t.ok(ac.write(rules, null, [ '' ]))
  t.ok(ac.write(rules, null, [ '', 'a' ]))
  t.ok(ac.write(rules, null, [ '', 'a', 'b', 'c' ]))
  t.notOk(ac.write(rules, null, [ '', 'b' ]))
  t.notOk(ac.write(rules, null, [ 'a' ]))
  t.notOk(ac.write(rules, null, [ 'a', 'b', 'c' ]))
})

tape('allow read dynamically', function (t) {
  t.plan(5)

  var rules = {
    '.write': function () {
      return true
    }
  }

  t.ok(ac.write(rules, null, [ '' ]))
  t.ok(ac.write(rules, null, [ '', 'a' ]))
  t.ok(ac.write(rules, null, [ '', 'a', 'b', 'c' ]))
  t.notOk(ac.write(rules, null, [ 'a' ]))
  t.notOk(ac.write(rules, null, [ 'a', 'b', 'c' ]))
})

tape('allow / deny write conditionally', function (t) {
  t.plan(6)

  var rules = {
    '.write': function () {
      return !this.x || this.x === '0'
    },
    things: {
      '$id': {
        '.write': function () {
          return this.id === '0'
        }
      }
    },
    createButNotDelete: {
      '.write': function (value) {
        return value !== undefined && value !== null
      }
    }
  }

  t.ok(ac.write(rules, { x: '0' }, [ '' ]))
  t.notOk(ac.write(rules, { x: '1' }, [ '' ]))

  t.ok(ac.write(rules, null, [ '', 'things', '0' ]))
  t.notOk(ac.write(rules, null, [ '', 'things', '1' ]))

  t.ok(ac.write(rules, null, [ '', 'createButNotDelete' ], 'value'))
  t.notOk(ac.write(rules, null, [ '', 'createButNotDelete' ]))
})

tape('allow write unless value contains reserved field', function (t) {
  t.plan(4)

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

  t.ok(ac.write(rules, null, '/things/0'.split('/'), { x: 42 }))
  t.ok(ac.write(rules, null, '/things/0'.split('/'), { nested: { x: 42 }}))

  t.notOk(ac.write(rules, null, '/things/0'.split('/'), { reserved: 42 }))
  t.notOk(ac.write(rules, null, '/things/0'.split('/'), { nested: { reserved: 42 }}))
})
