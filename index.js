exports.read = function (rules, params, keys) {
  var allow = false
  params = params || {}

  while (keys.length && rules) {
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
        return false
      } else if (typeof rule === 'function' && !rule.call(params)) {
        return false
      } else if (rule) {
        allow = true
      }
    } else {
      return allow
    }

    rules = rulesForKey
    keys.shift()
  }

  return allow
}

exports.write = function (rules, params, keys, value, allow) {
  allow = allow || false
  params = params || {}

  while (keys.length && rules) {
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
        return false
      } else if (typeof rule === 'function' && !rule.call(params, value)) {
        return false
      } else if (rule) {
        allow = true
      }
    } else {
      return allow
    }

    rules = rulesForKey
    keys.shift()
  }

  if (allow && value && typeof value === 'object') {
    for (key in value) {
      var subparams = {}
      for (var p in params) subparams[p] = params[p]
      if (!exports.write(rules, subparams, [ key ], value[key], allow)) {
        return false
      }
    }
  }

  return allow
}
