import axios, { AxiosError } from 'axios'
import { parseCookies } from 'nookies'

import saveAuthTokens from '../utils/saveAuthTokens'

let cookies = parseCookies()

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

      api.post('/refresh', { refreshToken }).then(response => {       
        saveAuthTokens({
          token: response.data.token,
          refreshToken: response.data.refreshToken })
      })
    } else {
      // deslogar o usuário
    }
  }
})
