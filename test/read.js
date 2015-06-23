var tape = require('tape')
var ac = require('../')

tape('no rules, deny read', function (t) {
  t.plan(5)

  t.notOk(ac.read(null, null, [ '' ]))
  t.notOk(ac.read(null, null, [ '', 'a' ]))
  t.notOk(ac.read(null, null, [ '', 'a', 'b', 'c' ]))
  t.notOk(ac.read(null, null, [ 'a' ]))
  t.notOk(ac.read(null, null, [ 'a', 'b', 'c' ]))
})

tape('allow read for valid paths', function (t) {
  t.plan(6)

  var rules = {
    '.read': true,
    b: {
      '.read': false
    }
  }

  t.ok(ac.read(rules, null, [ '' ]))
  t.ok(ac.read(rules, null, [ '', 'a' ]))
  t.ok(ac.read(rules, null, [ '', 'a', 'b', 'c' ]))
  t.notOk(ac.read(rules, null, [ '', 'b' ]))
  t.notOk(ac.read(rules, null, [ 'a' ]))
  t.notOk(ac.read(rules, null, [ 'a', 'b', 'c' ]))
})

tape('allow read dynamically', function (t) {
  t.plan(5)

  var rules = {
    '.read': function () {
      return true
    }
  }

  t.ok(ac.read(rules, null, [ '' ]))
  t.ok(ac.read(rules, null, [ '', 'a' ]))
  t.ok(ac.read(rules, null, [ '', 'a', 'b', 'c' ]))
  t.notOk(ac.read(rules, null, [ 'a' ]))
  t.notOk(ac.read(rules, null, [ 'a', 'b', 'c' ]))
})

tape('allow / deny read conditionally', function (t) {
  t.plan(4)

  var rules = {
    '.read': function () {
      return !this.x || this.x === '0'
    },
    things: {
      '$id': {
        '.read': function () {
          return this.id === '0'
        }
      }
    }
  }

  t.ok(ac.read(rules, { x: '0' }, [ '' ]))
  t.notOk(ac.read(rules, { x: '1' }, [ '' ]))

  t.ok(ac.read(rules, null, [ '', 'things', '0' ]))
  t.notOk(ac.read(rules, null, [ '', 'things', '1' ]))
})
