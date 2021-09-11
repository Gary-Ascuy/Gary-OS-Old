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
        <title>Gary OS</title>
        <meta name="description" content="gOS - Gary OS is Web Application Profile (Gary Ascuy)" />
        <link rel="icon" type="image/png" href="/assets/web/favicon_small.png" />
      </Head>

      <main>
        <pre style={{ color: 'white', fontSize: '15px', padding: '5px 20px' }}>{JSON.stringify(user, null, 2)}</pre>
      </main>

      <footer style={{ borderTop: '1px solid gray', margin: '0px 20px', padding: '10px', color: 'white', fontSize: '15px', textAlign: 'center' }}>
        Gary Ascuy &lt;gary.ascuy@gmail.com&gt;
      </footer>
    </div>
  )
}

export default Home
