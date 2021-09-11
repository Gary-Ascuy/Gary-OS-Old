import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

import { userState } from '../src/recoil/user.atom'

const Home: NextPage = () => {
  const [user, setUser] = useRecoilState(userState)

  useEffect(() => {
    console.log(user)
  }, [user])

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <pre>{JSON.stringify(user, null, 2)}</pre>

      </main>

      <footer>
        GARY
      </footer>
    </div>
  )
}

export default Home
