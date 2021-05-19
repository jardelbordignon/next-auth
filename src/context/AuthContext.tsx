import { createContext, ReactNode, useState } from 'react'
import Router from 'next/router'
import { setCookie } from 'nookies'

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

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('/sessions', { email, password })
      
      const { permissions, roles, token, refreshToken } = response.data

      const options = {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      }

      setCookie(undefined, 'nextauth.token', token, options)
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, options)

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
