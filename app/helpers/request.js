'use strict'
exports.decodeQuery = (param = '') => param.split(',').map(value => parseInt(value) || value)
