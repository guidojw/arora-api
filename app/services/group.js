'use strict'
const { ForbiddenError, BadRequestError } = require('../errors')

const robloxConfig = require('../../config/roblox')

class GroupService {
    constructor(robloxManager, userService, discordMessageJob, webSocketManager) {
        this._robloxManager = robloxManager
        this._userService = userService
        this._discordMessageJob = discordMessageJob
        this._webSocketManager = webSocketManager
    }

    async getShout(groupId) {
        const group = await this.getGroup(groupId)
        return group.shout
    }

    getGroup(groupId) {
        const client = this._robloxManager.getClient(groupId)
        return client.apis.groupsAPI.getGroup({ groupId })
    }

    getRoles(groupId) {
        const client = this._robloxManager.getClient(groupId)
        return client.apis.groupsAPI.getGroupRoles({ groupId })
    }

    async shout(groupId, message, authorId) {
        const client = this._robloxManager.getClient(groupId)
        const shout = await client.apis.groupsAPI.updateGroupStatus({ groupId, message })

        if (authorId) {
            const authorName = await this._userService.getUsername(authorId)
            if (shout.body === '') {
                this._discordMessageJob.run('log', `**${authorName}** cleared the shout`)
            } else {
                this._discordMessageJob.run('log', `**${authorName}** shouted "*${shout.body}*"`)
            }
        }

        return shout
    }

    async setRank(groupId, userId, rank) {
        const roles = await this.getRoles(groupId)
        const role = roles.roles.find(role => role.rank === rank)
        const client = this._robloxManager.getClient(groupId)
        const group = await client.getGroup(groupId)
        await group.updateMember(userId, role.id)

        this._webSocketManager.broadcast('rankChanged', { groupId, userId, rank })

        return role
    }

    async changeRank(groupId, userId, { rank, authorId }) {
        const oldRank = await this._userService.getRank(userId, groupId)
        if (oldRank === 0) {
            throw new ForbiddenError('Can\'t change rank of non members.')
        }
        if (oldRank === 1 && authorId) {
            throw new ForbiddenError('Can\'t change rank of customers.')
        }
        if (oldRank === 2) {
            throw new ForbiddenError('Can\'t change rank of suspended members.')
        }
        if (oldRank === 99) {
            throw new ForbiddenError('Can\'t change rank of partners.')
        }
        if (oldRank >= 200) {
            throw new ForbiddenError('Can\'t change rank of HRs.')
        }
        if (!(rank === 1 || rank >= 3 && rank <= 5 || rank >= 100 && rank <= 102)) {
            throw new BadRequestError('Invalid rank.')
        }

        const newRole = await this.setRank(groupId, userId, rank)

        const mtRank = await this._userService.getRank(userId, robloxConfig.mtGroup)
        if (mtRank > 0) {
            if (rank < 100) {
                const client = this._robloxManager.getClient(robloxConfig.mtGroup)
                const group = await client.getGroup(robloxConfig.mtGroup)
                await group.kickMember(userId)
            } else {
                await this.setRank(robloxConfig.mtGroup, userId, { rank })
            }
        }

        const roles = await this.getRoles(groupId)
        const oldRole = roles.roles.find(role => role.rank === oldRank)
        const username = await this._userService.getUsername(userId)
        if (authorId) {
            const authorName = await this._userService.getUsername(authorId)
            this._discordMessageJob.run('log', `**${authorName}** ${rank > oldRank ? 'promoted' : 'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
        } else {
            this._discordMessageJob.run('log', `${rank > oldRank ? 'Promoted' : 'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
        }

        return { oldRole, newRole }
    }
}

module.exports = GroupService
