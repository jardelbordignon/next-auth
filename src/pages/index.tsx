import { GetServerSideProps } from 'next'
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

import styles from '../styles/Home.module.css'
import { onlySSRGuest } from '../utils/onlySSRGuest'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { signIn, isAuthenticated } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = { email, password }

    await signIn(data)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        
        <label htmlFor='email'>E-mail</label>
        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label htmlFor='password'>Senha</label>
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type='submit'>Entrar</button>
      </form>
    </div>
  )
}

export const getServerSideProps = onlySSRGuest(async (ctx) => {
  
  return {
    props: {},
  }
})
