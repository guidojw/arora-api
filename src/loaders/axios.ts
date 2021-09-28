import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, {
  retryCondition: err => axiosRetry.isNetworkOrIdempotentRequestError(err) || err.response?.status === 429,
  retryDelay: axiosRetry.exponentialDelay
})
