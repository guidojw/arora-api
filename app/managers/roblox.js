'use strict'
const { Client } = require('bloxy')

const clients = { authenticated: {} }

let initiated = false

async function init() {
    if (initiated) {
        return
    }
    initiated = true

    // Authenticated client(s)
    try {
        const client = new Client({
            credentials: {
                cookie: process.env.ROBLOX_COOKIE
            }
        })
        // Set the client's requester to the custom requester.
        // Needs to be done after instantiation as we need to
        // know what the original requester was.
        client.rest.requester = requester.bind(client.rest.requester)

        await client.login()
        console.log('Roblox account logged in!')

        const groups = await client.user.getGroups()
        const groupIds = groups.data.map(group => group.group.id)
        for (const groupId of groupIds) {
            clients.authenticated[groupId] = client
        }

    } catch (err) {
        console.error(err.message)
    }

    // Unauthenticated client
    const client = new Client()
    // Set custom requester again, like with the authenticated clients.
    client.rest.requester = requester.bind(client.rest.requester)
    clients.unauthenticated = client
}

function getClient(groupId) {
    return groupId ? clients.authenticated[groupId] : clients.unauthenticated
}

// Custom requester that uses Bloxy's default requester but
// enables its throwHttpErrors option as the project relies on that.
function requester(options) {
    // HTTP 403 is thrown on fetching a new X-CSRF token, Bloxy however
    // relies on this so don't throw HTTP errors then.
    if (options.xcsrf !== false && options.url !== 'https://auth.roblox.com/v2/login') {
        options.throwHttpErrors = true
    }

    // this refers to Bloxy's original requester.
    return this(options)
}

module.exports = {
    init,
    getClient
}
