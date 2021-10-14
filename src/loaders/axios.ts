import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, {
  retryCondition: err => axiosRetry.isNetworkOrIdempotentRequestError(err) || err.response?.status === 429,
  retryDelay: retryCount => (retryCount === 1 ? 1 : ((retryCount - 1) ^ 2) + 1) * 60_000
})
