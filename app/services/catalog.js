'use strict'
const axios = require('axios')

exports.getItems = async query => {
    return (await axios({
        method: 'get',
        url: `https://search.roblox.com/catalog/json?${query}`
    })).data
}
