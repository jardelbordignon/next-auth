import { useContext, useEffect } from 'react'

import { AuthContext } from '../context/AuthContext'
import { api, setupAPIClient } from '../services/api'
import { onlySSRAuth } from '../utils/onlySSRAuth'
import styles from '../styles/Home.module.css'

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me')
      .then((response) => console.log(response))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className={styles.container}>
      <h1>Dashboard: { user?.email }</h1>
    </div>
  )
}

export const getServerSideProps = onlySSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  console.log(response.data)

  return {
    props: {},
  }
})
