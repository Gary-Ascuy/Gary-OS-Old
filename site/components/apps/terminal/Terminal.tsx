import { useCallback, useState } from 'react'
import Window from '../../window/Window';

import style from './Terminal.module.css'

// { process }: TerminalProps extends AppicationProps
export default function Terminal() {
  const [value, setValue] = useState('')
  const [PS1, setPS1] = useState('gary @Gary-MacBook-Pro site %')
  const [lines, setLines] = useState([
    'gary @Gary-MacBook-Pro site % docker run -it -p 80:80 nginx',
    'zsh: command not found: docker',
    'gary @Gary-MacBook-Pro site % docker-compose build -d',
    'zsh: command not found: docker-compose',
    'gary @Gary-MacBook-Pro site %',
    'gary @Gary-MacBook-Pro site %',
    'gary @Gary-MacBook-Pro site %',
  ])

  const addLines = useCallback((...newLines: string[]) => {
    setLines([...lines, ...newLines])
  }, [lines])

  const isNewCommand = (value: string) => /\r?\n$/.test(value) && !/\\\r?\n$/.test(value)

  return (
    <Window title='gary -- -zsh -- 80x24'>
      <div style={{ position: 'relative' }}>
        <div className={style.output}>
          {lines.map((line: string, index: number) => <div key={index}>{line}</div>)}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <span className={style.ps1}>{PS1}</span>

        <textarea rows={10} className={style.input} value={value} onChange={(event) => {
          const { value } = event.target

          if (isNewCommand(value)) {
            if (/clear/.test(value)) {
              setLines([])
              setValue('')
              return
            }

            if (!value.trim()) {
              addLines(PS1)
              return
            }

            const [command] = value.split(' ')
            addLines(`${PS1} ${value}`, `zsh: command not found: ${command}`)
            setValue('')
          } else setValue(value)
        }}>
        </textarea>
      </div>
    </Window >
  )
}
