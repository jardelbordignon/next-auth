import { useContext } from 'react'

import { AuthContext } from '../context/AuthContext'
import styles from '../styles/Home.module.css'

export default function Dashboard() {
  const { user } = useContext(AuthContext)

  return (
    <div className={styles.container}>
      <h1>Dashboard: { user?.email }</h1>
    </div>
  )
}
