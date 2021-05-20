import { setCookie } from 'nookies'
import { api } from '../services/api'

interface Props {
  token: string
  refreshToken: string
  maxAge?: number
  path?: string
}

export default function saveAuthTokens({
  token,
  refreshToken,
  maxAge = 60 * 60,
  path = '/'
}: Props) {

  console.log(token, refreshToken)

  const options = { maxAge, path }

  setCookie(undefined, 'nextauth.token', token, options)
  setCookie(undefined, 'nextauth.refreshToken', refreshToken, options)

  api.defaults.headers['Authorization'] = `Bearer ${token}`
}
