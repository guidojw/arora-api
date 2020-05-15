'use strict'
exports.decodeQuery = (param = '') => {
    const result = param.split(',').filter(value => value !== '').map(value => parseInt(value) || value)
    return result.length > 0 ? result : undefined
}
