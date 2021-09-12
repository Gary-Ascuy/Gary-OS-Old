import { useState } from 'react'
import Window from '../../window/Window';

import style from './Terminal.module.css'

// { process }: TerminalProps extends AppicationProps
export default function Terminal() {
  const [value, setValue] = useState('')

  return (
    <Window title='gary -- -zsh -- 80x24'>
      <div style={{ position: 'relative' }}>
        <div className={style.output}>
          <div>gary @Gary-MacBook-Pro site % docker run -it -p 80:80 nginx</div>
          <div>zsh: command not found: docker</div>
          <div>gary @Gary-MacBook-Pro site % docker-compose build -d</div>
          <div>zsh: command not found: docker-compose</div>
          <div>gary @Gary-MacBook-Pro site %</div>
          <div>gary @Gary-MacBook-Pro site %</div>
          <div>gary @Gary-MacBook-Pro site %</div>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <span className={style.ps1}>gary @Gary-MacBook-Pro site %</span>

        <textarea className={style.input} value={value} onChange={(event) => setValue(event.target.value)}>
        </textarea>
      </div>
    </Window >
  )
}
