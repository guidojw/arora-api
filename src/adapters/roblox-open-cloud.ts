import axios, { type AxiosPromise, type AxiosRequestConfig, type Method } from 'axios'

export default async function robloxOpenCloudAdapter (method: Method, pathname: string, data?: any): Promise<AxiosPromise> {
  const options: AxiosRequestConfig = {
    url: `https://apis.roblox.com/cloud/v2/${pathname}`,
    method,
    data
  }
  if (typeof process.env.ROBLOX_API_KEY !== 'undefined') {
    options.headers = { 'x-api-key': process.env.ROBLOX_API_KEY }
  }
  return await axios(options)
}
