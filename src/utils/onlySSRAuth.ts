import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { parseCookies } from 'nookies'
import jwtDecode from 'jwt-decode'

import { signOut } from '../context/AuthContext'
import { AuthTokenError } from '../services/errors/AuthTokenError'
import { validateUserPermissions } from './validateUserPermissions'

interface OnlySSRAuthOptions {
  permissions?: string[]
  roles?: string[]
}

export function onlySSRAuth<T>(fn: GetServerSideProps<T>, options?: OnlySSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx)
    const token = cookies['nextauth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if (options) {
      const user = jwtDecode<{ permissions: string[], roles: string[] }>(token)
      const { permissions, roles } = options
      
      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      })

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof AuthTokenError) {
        return signOut(ctx)
      }
    }
    
  }  
}
