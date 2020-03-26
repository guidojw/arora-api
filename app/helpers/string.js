'use strict'
exports.toPascalCase = string => {
    return string.replace(/\w\S*/g, m => m.charAt(0).toUpperCase() + m.substr(1).toLowerCase())
}
