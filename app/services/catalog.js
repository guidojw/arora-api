'use strict'
const axios = require('axios')

async function getItems(queryString) {
    return (await axios({
        method: 'get',
        url: `https://search.roblox.com/catalog/json?${queryString}`
    })).data
}

module.exports = {
    getItems
}
