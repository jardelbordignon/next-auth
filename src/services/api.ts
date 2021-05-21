import axios, { AxiosError } from 'axios'
import { parseCookies } from 'nookies'

import { saveAuthTokens, signOut } from '../context/AuthContext'

let cookies = parseCookies()
let isRefreshing = false
let failedRequestsQueue = []

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
})

api.interceptors.response.use(response => {
  return response
}, (error: AxiosError) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === 'token.expired') {
      cookies = parseCookies()

      const { 'nextauth.refreshToken': refreshToken } = cookies
      const originalRequestConfig = error.config

      if (!isRefreshing) {
        isRefreshing = true

        api.post('/refresh', { refreshToken })
        .then(response => {
          const { token, refreshToken } = response.data

          saveAuthTokens({ token, refreshToken })

          failedRequestsQueue.forEach(request => request.onSuccess(token))
        })
        .catch(error => {
          failedRequestsQueue.forEach(request => request.onFailure(error))
        })
        .finally(() => {
          isRefreshing = false
          failedRequestsQueue = []
        })
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalRequestConfig.headers['Authorization'] = `Bearer ${token}`

            resolve(api(originalRequestConfig))
          },
          onFailure: (error: AxiosError) => {
            reject(error)
          }
        })
      })
      
    } else {
      signOut()
    }
  }

  return Promise.reject(error)
})
