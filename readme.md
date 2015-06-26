# access-control-rules
Access control for hierarchical data.

## Why
Factored out of a [hyperbase](https://github.com/jessetane/hyperbase) server implementation.

## How
Make some rules:

``` javascript
var rules = {
  '.read': true,
  things: {
    '$id': {
      '.read': function (cb) {
        cb(null, this.id === '0')
      },
      '.write': function (value, cb) {
        cb(null, value && this.id === '0')
      },
      nested: {
        reserved: {
          '.write': false
        }
      }
    }
  }
}
```

Then check to see if you have permission to read and write stuff:
``` javascript
var ac = require('access-control-rules')

ac.read(rules, null, '/things/0'.split('/'), function (err, allow) {
  // allow === true
})

ac.read(rules, null, '/things/1'.split('/'), function (err, allow) {
  // allow === false
})

ac.write(rules, null, '/things/0'.split('/'), 'thing!', , function (err, allow) {
  // allow === true
})

ac.write(rules, null, '/things/1'.split('/'), 'thing!', function (err, allow) {
  // allow === false
})

ac.write(rules, null, '/things/0'.split('/'))
  // allow === false
})

ac.write(rules, null, '/things/0'.split('/'), { nested: { x: 42 }}, function (err, allow) {
  // allow === true
})

ac.write(rules, null, '/things/0'.split('/'), { nested: { reserved: 42 }}, function (err, allow) {
  // allow === false
})
```

## Test
`$ npm test`  
`$ npm run test-browser` (depends on a globally installed [zuul](https://github.com/defunctzombie/zuul))

## Prior art
The idea is based on [Firebase's security rules](https://www.firebase.com/docs/security/guide/). The main important difference is that ".read" rules do not check any nested rules - this allows masking specific fields when reading objects.

## License
WTFPL
