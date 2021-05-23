import { useContext, useEffect } from 'react'

import { AuthContext } from '../context/AuthContext'
import { api, setupAPIClient } from '../services/api'
import { onlySSRAuth } from '../utils/onlySSRAuth'
import styles from '../styles/Home.module.css'
import { Can } from '../components/Can'

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me')
      .then((response) => console.log(response))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className={styles.container}>
      <h1>Dashboard: { user?.email }</h1>

      <button onClick={signOut}>Sign out</button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
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
