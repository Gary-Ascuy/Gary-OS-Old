import { useEffect, useState } from 'react'
import format from 'date-fns/format'

import style from './MenuItem.module.css'

const TimeInterval = 60 * 1000
const TimeFormat = 'iii dd LLL hh:mm aa'

export default function Clock(): JSX.Element {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), TimeInterval)
    return () => clearInterval(timer)
  }, [setTime])

  return (
    <span className={style.item}>{format(time, TimeFormat)}</span>
  )
}
