import type { UpdateGroupStatus as BloxyUpdateGroupStatus } from '@guidojw/bloxy/dist/client/apis/GroupsAPI'
import { ForbiddenError, UnprocessableError } from '../errors'
import { RobloxManager, WebSocketManager } from '../managers'
import { constants, util } from '../util'
import { inject, injectable } from 'inversify'
import { DiscordMessageJob } from '../jobs'
import UserService from './user'
import applicationConfig from '../configs/application'
import { robloxOpenCloudAdapter } from '../adapters'

const { TYPES } = constants

export interface ChangeMemberRole { oldRole: GetGroupRole, newRole: GetGroupRole }
export type UpdateGroupStatus = Exclude<BloxyUpdateGroupStatus, null>

export interface GetGroup {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly id: string
  readonly displayName: string
  readonly description: string
  readonly owner: string
  readonly memberCount: number
  readonly publicEntryAllowed: number
  readonly locked: boolean
  readonly verified: boolean
}

export interface GetGroupJoinRequest {
  readonly path: string
  readonly createTime: string
  readonly user: string
}

export interface GetGroupJoinRequests {
  readonly groupJoinRequests: Array<GetGroupJoinRequest>
  readonly nextPageToken: string
}

export interface GetGroupMembership {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly user: string
  readonly role: string
}

export interface GetGroupMemberships {
  readonly groupMemberships: Array<GetGroupMembership>
  readonly nextPageToken: string
}

export interface GetGroupRole {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly id: string
  readonly displayName: string
  readonly description: string
  readonly rank: number
  readonly memberCount: number
  readonly permissions: GroupRolePermissions
}

export interface GetGroupRoles {
  readonly groupRoles: Array<GetGroupRole>
  readonly nextPageToken: string
}

export interface GroupRolePermissions {
  viewWallPosts: boolean
  createWallPosts: boolean
  deleteWallPosts: boolean
  viewGroupShout: boolean
  createGroupShout: boolean
  changeRank: boolean
  acceptRequests: boolean
  exileMembers: boolean
  manageRelationships: boolean
  viewAuditLog: boolean
  spendGroupFunds: boolean
  advertiseGroup: boolean
  createAvatarItems: boolean
  manageAvatarItems: boolean
  manageGroupUniverses: boolean
  viewUniverseAnalytics: boolean
  createApiKeys: boolean
  manageApiKeys: boolean
  banMembers: boolean
  viewForums: boolean
  manageCategories: boolean
  createPosts: boolean
  lockPosts: boolean
  pinPosts: boolean
  removePosts: boolean
  createComments: boolean
  removeComments: boolean
}

export interface GetGroupShout {
  readonly path: string
  readonly createTime: string
  readonly updateTime: string
  readonly content: string
  readonly poster: string
}

@injectable()
export default class GroupService {
  @inject(TYPES.DiscordMessageJob) private readonly discordMessageJob!: DiscordMessageJob
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager
  @inject(TYPES.UserService) private readonly userService!: UserService
  @inject(TYPES.WebSocketManager) private readonly webSocketManager!: WebSocketManager

  public async getGroupShout (groupId: number): Promise<GetGroupShout> {
    return (await robloxOpenCloudAdapter('GET', `groups/${groupId}/shout`)).data
  }

  public async getGroup (groupId: number): Promise<GetGroup> {
    return (await robloxOpenCloudAdapter('GET', `groups/${groupId}`)).data
  }

  public async getRank (groupId: number, userId: number): Promise<number> {
    const role = await this.getRole(groupId, userId)
    return role.rank
  }

  public async getRole (groupId: number, userId: number): Promise<GetGroupRole> {
    const memberships = (await robloxOpenCloudAdapter(
      'GET',
      `groups/${groupId}/memberships?filter=user == 'users/${userId}'`
    )).data as GetGroupMemberships
    const membership = memberships.groupMemberships[0]
    const roles = await this.getRoles(groupId)
    if (typeof membership === 'undefined') {
      return roles.find(role => role.rank === 0) as GetGroupRole
    }
    return roles.find(role => role.path === membership.role) as GetGroupRole
  }

  public async getRoles (groupId: number): Promise<GetGroupRoles['groupRoles']> {
    const roles: Array<GetGroupRole> = []
    let cursor = null
    do {
      const result = (await robloxOpenCloudAdapter(
        'GET',
        `groups/${groupId}/roles${cursor === null ? '' : `?cursor=${cursor}`}`)
      ).data as GetGroupRoles
      roles.push(...result.groupRoles)
      cursor = result.nextPageToken
    } while (cursor !== "")
    return roles
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

  public async getJoinRequests (groupId: number): Promise<GetGroupJoinRequests['groupJoinRequests']> {
    const joinRequests: Array<GetGroupJoinRequest> = []
    let cursor = null
    do {
      const result = (await robloxOpenCloudAdapter(
        'GET',
        `groups/${groupId}/join-requests${cursor === null ? '' : `?cursor=${cursor}`}`)
      ).data as GetGroupJoinRequests
      joinRequests.push(...result.groupJoinRequests)
      cursor = result.nextPageToken
    } while (cursor !== "")
    return joinRequests
  }

  public async acceptJoinRequest (path: string): Promise<void> {
    await robloxOpenCloudAdapter('POST', `${path}:accept`, {})
  }

  public async declineJoinRequest (path: string): Promise<void> {
    await robloxOpenCloudAdapter('POST', `${path}:decline`, {})
  }

  public async setMemberRole (groupId: number, userId: number, role: GetGroupRole | number): Promise<GetGroupRole> {
    if (typeof role === 'number') {
      const roles = await this.getRoles(groupId)
      const roleResolvable = roles.find(otherRole => otherRole.rank === role)
      if (typeof roleResolvable === 'undefined') {
        throw new UnprocessableError('Invalid role.')
      }
      role = roleResolvable
    }
    await robloxOpenCloudAdapter('PATCH', `groups/${groupId}/memberships/${userId}`, {
      role: role.path
    })

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
        await this.discordMessageJob.run(`**${authorName}** changed **${username}**'s role from **${oldRole.displayName}** to **${newRole.displayName}**`)
      } else {
        await this.discordMessageJob.run(`Changed **${username}**'s role from **${oldRole.displayName}** to **${newRole.displayName}**`)
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
    const role = roles
      .sort((roleA, roleB) => roleA.rank - roleB.rank)
      .slice(roles.findIndex(role => role.rank === rank) + 1)
      .find(role => !applicationConfig.skippedRanks.some(range => util.inRange(role.rank, range)))
    if (typeof role === 'undefined' || role.rank === 255) {
      throw new UnprocessableError('User is already the highest obtainable role.')
    }
    return await this.changeMemberRole(groupId, userId, { role, authorId })
  }

  public async demoteMember (groupId: number, userId: number, authorId?: number): Promise<ChangeMemberRole> {
    const rank = await this.getRank(groupId, userId)
    if ([0, 255].includes(rank)) {
      throw new UnprocessableError('Cannot promote users on this role.')
    } else if (applicationConfig.undemotableRanks.some(range => util.inRange(rank, range))) {
      throw new ForbiddenError('User\'s role is undemotable.')
    }
    const roles = await this.getRoles(groupId)
    const role = roles
      .sort((roleA, roleB) => roleB.rank - roleA.rank)
      .slice(roles.findIndex(role => role.rank === rank) + 1)
      .find(role => !applicationConfig.skippedRanks.some(range => util.inRange(role.rank, range)))
    if (typeof role === 'undefined' || role.rank === 0) {
      throw new UnprocessableError('User is already the lowest obtainable role.')
    }
    return await this.changeMemberRole(groupId, userId, { role, authorId })
  }

  public async kickMember (groupId: number, userId: number): Promise<void> {
    const client = this.robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.kickMember(userId)

    this.webSocketManager.broadcast('rankChange', { groupId, userId, rank: 0 })
  }
}
