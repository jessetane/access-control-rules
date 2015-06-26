exports.read = function (rules, params, keys, cb, allow) {
  allow = allow || false
  params = params || {}

  if (rules && keys.length) {
    var key = keys[0]
    var rulesForKey = !key ? rules : rules[key]

    if (!rulesForKey) {
      var re = /^\$/
      for (var i in rules) {
        if (re.test(i)) {
          rulesForKey = rules[i]
          params[i.slice(1)] = key
          break
        }
      }
    }

    if (rulesForKey) {
      var rule = rulesForKey['.read']
      if (rule === false) {
        cb(null, false)
        return
      } else if (typeof rule === 'function') {
        rule.call(params, function (err, _allow) {
          if (err) return cb(err)
          if (!_allow) return cb(null, _allow)

          rules = rulesForKey
          keys.shift()
          exports.read(rules, params, keys, cb, _allow)
        })
        return
      } else if (rule) {
        allow = true
      }
    } else {
      cb(null, allow)
      return
    }

    rules = rulesForKey
    keys.shift()
    exports.read(rules, params, keys, cb, allow)
    return
  }

  cb(null, allow)
}

exports.write = function (rules, params, keys, value, cb, allow) {
  allow = allow || false
  params = params || {}

  if (rules && keys.length) {
    var key = keys[0]
    var rulesForKey = !key ? rules : rules[key]

    if (!rulesForKey) {
      var re = /^\$/
      for (var i in rules) {
        if (re.test(i)) {
          rulesForKey = rules[i]
          params[i.slice(1)] = key
          break
        }
      }
    }

    if (rulesForKey) {
      var rule = rulesForKey['.write']
      if (rule === false) {
        cb(null, false)
        return
      } else if (typeof rule === 'function') {
        rule.call(params, value, function (err, _allow) {
          if (err) return cb(err)
          if (!_allow) return cb(null, _allow)

          rules = rulesForKey
          keys.shift()
          exports.write(rules, params, keys, value, cb, _allow)
        })
        return
      } else if (rule) {
        allow = true
      }
    } else {
      cb(null, allow)
      return
    }

    rules = rulesForKey
    keys.shift()
    exports.write(rules, params, keys, value, cb, allow)
    return
  }

  if (allow && value && typeof value === 'object') {
    var n = Object.keys(value).length
    for (key in value) {
      if (!cb) return
      var subparams = {}
      for (var p in params) subparams[p] = params[p]
      exports.write(rules, subparams, [ key ], value[key], function (err, _allow) {
        if (err || !_allow) {
          cb && cb(err, _allow)
          cb = null
          return
        }
        if (--n === 0) {
          cb && cb(null, allow)
        }
      }, allow)
    }
    return
  }

  cb(null, allow)
}
