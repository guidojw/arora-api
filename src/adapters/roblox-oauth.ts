import axios, { type AxiosPromise, type AxiosRequestConfig, type Method } from 'axios'

export default async function robloxOAuthAdapter (
  method: Method,
  pathname: string,
  data?: any
): Promise<AxiosPromise> {
  const options: AxiosRequestConfig = {
    url: `https://apis.roblox.com/oauth/v1/${pathname}`,
    method,
    data: new URLSearchParams(data)
  }
  options.headers = {
    Authorization: `Basic ${Buffer.from(
        `${process.env.ROBLOX_APP_CLIENT_ID as string}:${process.env.ROBLOX_APP_CLIENT_SECRET as string}`
      ).toString('base64')}`
  }
  return await axios(options)
}
