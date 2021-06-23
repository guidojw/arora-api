import { UpdateGroupStatus as BloxyUpdateGroupStatus, GetGroup, GetGroupRoles } from 'bloxy/dist/client/apis/GroupsAPI'
import { ForbiddenError, UnprocessableError } from '../errors'
import { RobloxManager, WebSocketManager } from '../managers'
import { constants, util } from '../util'
import { inject, injectable } from 'inversify'
import { DiscordMessageJob } from '../jobs'
import UserService from './user'
import applicationConfig from '../configs/application'

const { TYPES } = constants

export type GetGroupStatus = GetGroup['shout'] | null
export type GetGroupRole = GetGroupRoles['roles'][0]
export type UpdateGroupStatus = Exclude<BloxyUpdateGroupStatus, null>
export interface ChangeMemberRole { oldRole: GetGroupRole, newRole: GetGroupRole }

@injectable()
export default class GroupService {
  @inject(TYPES.DiscordMessageJob) private readonly discordMessageJob!: DiscordMessageJob
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager
  @inject(TYPES.UserService) private readonly userService!: UserService
  @inject(TYPES.WebSocketManager) private readonly webSocketManager!: WebSocketManager

  public async getGroupStatus (groupId: number): Promise<GetGroupStatus> {
    const group = await this.getGroup(groupId)
    return group.shout
  }

  public async getGroup (groupId: number): Promise<GetGroup> {
    const client = this.robloxManager.getClient(groupId)
    return await client.apis.groupsAPI.getGroup({ groupId })
  }

  public async getRank (groupId: number, userId: number): Promise<number> {
    const client = this.robloxManager.getClient(groupId)
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.data.find(group => group.group.id === groupId)
    return typeof group !== 'undefined' ? group.role.rank : 0
  }

  public async getRole (groupId: number, userId: number): Promise<GetGroupRole> {
    const client = this.robloxManager.getClient(groupId)
    const user = await client.getUser(userId)
    const groups = await user.getGroups()
    const group = groups.data.find(group => group.group.id === groupId)
    let role = group?.role
    if (typeof group === 'undefined') {
      const roles = await this.getRoles(groupId)
      role = roles.roles.find(role => role.rank === 0)
    }
    return role as GetGroupRole
  }

  public async getRoles (groupId: number): Promise<GetGroupRoles> {
    const client = this.robloxManager.getClient(groupId)
    return await client.apis.groupsAPI.getGroupRoles({ groupId })
  }

  public async updateGroupStatus (groupId: number, message: string, authorId?: number): Promise<UpdateGroupStatus> {
    const client = this.robloxManager.getClient(groupId)
    const shout = await client.apis.groupsAPI.updateGroupStatus({ groupId, message }) as UpdateGroupStatus

    if (typeof authorId !== 'undefined') {
      const authorName = await this.userService.getUsername(authorId)
      if (shout.body === '') {
        await this.discordMessageJob.run(`**${authorName}** cleared the shout`)
      } else {
        await this.discordMessageJob.run(`**${authorName}** shouted "*${shout.body}*"`)
      }
    }

    return shout
  }

  public async setMemberRole (groupId: number, userId: number, role: GetGroupRole | number): Promise<GetGroupRole> {
    if (typeof role === 'number') {
      const roles = await this.getRoles(groupId)
      const roleResolvable = roles.roles.find(otherRole => otherRole.rank === role)
      if (typeof roleResolvable === 'undefined') {
        throw new UnprocessableError('Invalid role.')
      }
      role = roleResolvable
    }
    const client = this.robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.updateMember(userId, role.id)

    this.webSocketManager.broadcast('rankChange', { groupId, rank: role.rank, userId })

    return role
  }

  public async changeMemberRole (groupId: number, userId: number, { role, authorId }: { role: GetGroupRole | number
    authorId?: number }): Promise<ChangeMemberRole> {
    const oldRole = await this.getRole(groupId, userId)
    if ([0, 255].includes(oldRole.rank)) {
      throw new UnprocessableError('Cannot change role of users on this role.')
    }

    const newRole = await this.setMemberRole(groupId, userId, role)
    const username = await this.userService.getUsername(userId)
    if (oldRole.id !== newRole.id) {
      if (typeof authorId !== 'undefined') {
        const authorName = await this.userService.getUsername(authorId)
        await this.discordMessageJob.run(`**${authorName}** changed **${username}**'s role from **${oldRole.name}** to **${newRole.name}**`)
      } else {
        await this.discordMessageJob.run(`Changed **${username}**'s role from **${oldRole.name}** to **${newRole.name}**`)
      }
    }

    return { oldRole, newRole }
  }

  public async promoteMember (groupId: number, userId: number, authorId?: number): Promise<ChangeMemberRole> {
    const rank = await this.getRank(groupId, userId)
    if ([0, 255].includes(rank)) {
      throw new UnprocessableError('Cannot promote users on this role.')
    } else if (applicationConfig.unpromotableRanks.some(range => util.inRange(rank, range))) {
      throw new ForbiddenError('User\'s role is unpromotable.')
    }
    const roles = await this.getRoles(groupId)
    const role = roles.roles
      .sort((roleA, roleB) => roleA.rank - roleB.rank)
      .slice(roles.roles.findIndex(role => role.rank === rank) + 1)
      .find(role => !applicationConfig.skippedRanks.some(range => util.inRange(role.rank, range)))
    if (typeof role === 'undefined' || role.rank === 255) {
      throw new UnprocessableError('User is already the highest obtainable role.')
    }
    return this.changeMemberRole(groupId, userId, { role, authorId })
  }

  public async demoteMember (groupId: number, userId: number, authorId?: number): Promise<ChangeMemberRole> {
    const rank = await this.getRank(groupId, userId)
    if ([0, 255].includes(rank)) {
      throw new UnprocessableError('Cannot promote users on this role.')
    } else if (applicationConfig.undemotableRanks.some(range => util.inRange(rank, range))) {
      throw new ForbiddenError('User\'s role is undemotable.')
    }
    const roles = await this.getRoles(groupId)
    const role = roles.roles
      .sort((roleA, roleB) => roleB.rank - roleA.rank)
      .slice(roles.roles.findIndex(role => role.rank === rank) + 1)
      .find(role => !applicationConfig.skippedRanks.some(range => util.inRange(role.rank, range)))
    if (typeof role === 'undefined' || role.rank === 0) {
      throw new UnprocessableError('User is already the lowest obtainable role.')
    }
    return this.changeMemberRole(groupId, userId, { role, authorId })
  }

  public async kickMember (groupId: number, userId: number): Promise<void> {
    const client = this.robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.kickMember(userId)

    this.webSocketManager.broadcast('rankChange', { groupId, userId, rank: 0 })
  }
}
