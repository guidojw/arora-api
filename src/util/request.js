'use strict'

function decodeScopeQueryParam (param = '') {
  const result = param
    .split(',')
    .filter(value => value !== '')

  return result.length > 0
    ? result
    : undefined
}

function decodeSortQueryParam (param = '') {
  let result = param
    .split(',')
    .filter(value => value !== '')

  result = result.map(sort => {
    if (sort.charAt(0) === '-') {
      return [sort.substring(1), 'DESC']
    } else {
      return [sort, 'ASC']
    }
  })

  return result.length > 0
    ? result
    : undefined
}

function hasScopes (model, scopes) {
  if (typeof scopes === 'undefined') {
    return true
  }
  const modelScopes = ['defaultScope', ...Object.values(model.options.scopes)]
  return scopes.every(scope => modelScopes.includes(scope))
}

module.exports = {
  decodeScopeQueryParam,
  decodeSortQueryParam,
  hasScopes
}
