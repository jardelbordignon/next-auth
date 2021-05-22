import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { parseCookies } from 'nookies'

import { signOut } from '../context/AuthContext'
import { AuthTokenError } from '../services/errors/AuthTokenError'

export function onlySSRAuth<T>(fn: GetServerSideProps<T>): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx)

    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
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
