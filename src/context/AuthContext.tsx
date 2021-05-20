import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { parseCookies, setCookie } from 'nookies'

import { api } from '../services/api'
import saveAuthTokens from '../utils/saveAuthTokens'

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

export const AuthContext = createContext({} as AuthContextData)

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
