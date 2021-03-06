import { createContext, ReactNode, useEffect, useState } from 'react'
import Router from 'next/router'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { GetServerSidePropsContext } from 'next'

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
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
  user: User
}

interface AuthProviderProps {
  children: ReactNode
}

interface SaveAuthTokensProps {
  ctx?: GetServerSidePropsContext
  token: string
  refreshToken: string
  maxAge?: number
  path?: string
}


export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut(ctx = undefined) {
  destroyCookie(ctx, 'nextauth.token')
  destroyCookie(ctx, 'nextauth.refreshToken')

  authChannel.postMessage('signOut')

  if (process.browser) {
    Router.push('/')
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
}

export function saveAuthTokens({
  ctx = undefined,
  token,
  refreshToken,
  maxAge = 60 * 60,
  path = '/'
}: SaveAuthTokensProps) {
  const options = { maxAge, path }

  setCookie(ctx, 'nextauth.token', token, options)
  setCookie(ctx, 'nextauth.refreshToken', refreshToken, options)

  api.defaults.headers['Authorization'] = `Bearer ${token}`
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  const { 'nextauth.token': token } = parseCookies()

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut()
          authChannel.close()
          break;
        default:
          break;
      } 
    }
  }, [])

  useEffect(() => {
    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({ email, permissions, roles })
      })
      .catch(() => signOut())
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
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      { children }
    </AuthContext.Provider>
  )
}
