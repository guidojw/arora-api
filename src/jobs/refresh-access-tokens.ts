import { createConnection, getRepository } from 'typeorm'
import { AccessToken } from '../entities'
import { parentPort } from 'node:worker_threads'
import { plainToInstance } from 'class-transformer'
import { robloxOAuthAdapter } from '../adapters'

async function refreshAccessTokens (): Promise<void> {
  await createConnection()

  const repository = getRepository(AccessToken)

  const accessTokens = await repository.find()
  for (const accessToken of accessTokens) {
    const result = await robloxOAuthAdapter('POST', 'token/introspect', {
      token: accessToken.refreshToken
    })

    if (result.data.active === false) {
      await repository.delete(accessToken.id)
    } else if (result.data.exp - Math.floor(Date.now() / 1000) <= 7 * 24 * 60 * 60) {
      try {
        const result = await robloxOAuthAdapter('POST', 'token', {
          grant_type: 'refresh_token',
          refresh_token: accessToken.refreshToken
        })
        await repository.save(repository.create(plainToInstance(
          AccessToken,
          {
            ...result.data,
            id: accessToken.id
          }
        )))
      } catch {
        continue
      }
    }
  }
}

refreshAccessTokens().finally(() => parentPort?.postMessage('done') ?? process.exit(0))
