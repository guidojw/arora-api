'use strict'
const axios = require('axios')

exports.getItems = async queryString => {
    return (await axios({
        method: 'get',
        url: `https://search.roblox.com/catalog/json?${queryString}`
    })).data
}
