import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

import { api } from '../services/api'

interface User {
  email: string
  permissions: string[]
  roles: string[]
}

interface SignInCredentials {
  email: string
  password: string
}

interface AuthContextData {
  signIn(credentials: SignInCredentials): Promise<void>
  isAuthenticated: boolean
  user: User
}

interface AuthProviderProps {
  children: ReactNode
}

interface SaveAuthTokensProps {
  token: string
  refreshToken: string
  maxAge?: number
  path?: string
}


export const AuthContext = createContext({} as AuthContextData)

export function saveAuthTokens({
  token,
  refreshToken,
  maxAge = 60 * 60,
  path = '/'
}: SaveAuthTokensProps) {
  const options = { maxAge, path }

  setCookie(undefined, 'nextauth.token', token, options)
  setCookie(undefined, 'nextauth.refreshToken', refreshToken, options)

  api.defaults.headers['Authorization'] = `Bearer ${token}`
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  const { 'nextauth.token': token } = parseCookies()

  useEffect(() => {
    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({ email, permissions, roles })
      })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', { email, password })
      
      const { permissions, roles, token, refreshToken } = response.data

      saveAuthTokens({ token, refreshToken })

      setUser({ email, permissions, roles })

      Router.push('/dashboard')

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      { children }
    </AuthContext.Provider>
  )
}
