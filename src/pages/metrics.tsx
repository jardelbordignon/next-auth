import { setupAPIClient } from '../services/api'
import { onlySSRAuth } from '../utils/onlySSRAuth'
import styles from '../styles/Home.module.css'

export default function Metrics() {

  return (
    <div className={styles.container}>
      <h1>Metrics</h1>
    </div>
  )
}

export const getServerSideProps = onlySSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me')

  return {
    props: {},
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})
