import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'

import { Desktop } from '../components/core/Desktop'

import { userState } from '../src/recoil/user.atom'

const Home: NextPage = () => {
  const [user, setUser] = useRecoilState(userState)

  // const kernel = useRecoilState(userState)
  // const [fs, refresh] = useFileSystem()
  // const [kernel, open] = useKernel()
  // const test = useInfo()

  useEffect(() => {
    // console.log(user)
  }, [user])

  return (
    <div>
      <Head>
        <title>Gary OS</title>
        <meta name="description" content="gOS - Gary OS is Web Application Profile (Gary Ascuy)" />
        <link rel="icon" type="image/png" href="/assets/web/favicon.png" />
      </Head>

      <main>
        <Desktop></Desktop>
      </main>
    </div>
  )
}

export default Home
