'use strict'
exports.decodeScopeQueryParam = (param = '') => {
    const result = param.split(',').filter(value => value !== '').map(value => parseInt(value) || value)
    return result.length > 0 ? result : undefined
}

exports.decodeSortQueryParam = (param = '') => {
    let result = param.split(',').filter(value => value !== '').map(value => parseInt(value) || value)
    result = result.map(sort => {
        if (sort.charAt(0) === '-') {
            return [sort.substring(1), 'DESC']
        } else {
            return [sort, 'ASC']
        }
    })
    return result.length > 0 ? result : undefined
}
