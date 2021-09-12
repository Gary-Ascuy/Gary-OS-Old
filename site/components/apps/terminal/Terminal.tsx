import { useCallback, useEffect, useRef, useState } from 'react'
import { WindowOption } from '../../../src/core/WindowOption'
import { useKernel } from '../../../src/kernel/Kernel'
import { ProcessOptions } from '../../../src/kernel/options/ProcessOptions'
import Window from '../../window/Window'

import style from './Terminal.module.css'

// { process }: TerminalProps extends AppicationProps
export default function Terminal({ title, box }: WindowOption) {
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

  const ps1 = useRef<HTMLDivElement>(null)
  const [textIndent, setTextIndent] = useState('')
  const { open } = useKernel()

  useEffect(() => {
    const width = ps1?.current?.offsetWidth ?? 0
    setTextIndent(`${width + 5}px`)
  }, [ps1])

  const addLines = useCallback((...newLines: string[]) => {
    setLines([...lines, ...newLines])
  }, [lines])

  const isNewCommand = (value: string) => /\r?\n$/.test(value) && !/\\\r?\n$/.test(value)

  return (
    <Window title={title || 'gary -- -zsh -- 80x24'} box={box}>
      <div style={{ position: 'relative' }}>
        <div className={style.output}>
          {lines.map((line: string, index: number) => <div key={index}>{line}</div>)}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className={style.ps1} ref={ps1}>{PS1}</div>

        <textarea rows={10} className={style.input} value={value}
          style={{ textIndent }}
          onChange={(event) => {
            const { value } = event.target

            if (isNewCommand(value)) {
              if (/clear/.test(value)) {
                setLines([])
                setValue('')
                return
              }

              if (/^PS1=/i.test(value)) {
                const [_, name] = value.trim().split('=')
                const val = `${name.trim()} %`

                setPS1(val)
                setValue('')

                const width = ps1?.current?.offsetWidth ?? 0
                setTextIndent(`${(val.length / PS1.length * width) + 5}px`)
                return
              }

              if (!value.trim()) {
                addLines(PS1)
                return
              }

              const [command] = value.split(' ')
              addLines(`${PS1} ${value}`, `zsh: command not found: ${command}`)
              setValue('')

              open({ env: {} } as ProcessOptions).then((a) => console.log(a))
            } else setValue(value)
          }}>
        </textarea>
      </div>
    </Window >
  )
}
