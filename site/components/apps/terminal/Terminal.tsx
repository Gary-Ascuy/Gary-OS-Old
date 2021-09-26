import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WindowOption } from '../../../src/view/WindowOption'
import { useKernel } from '../../../src/kernel/Kernel'
import Window from '../../window/Window'

import style from './Terminal.module.css'
import { parseProcessOptions } from '../../../src/kernel/Utils'
import { ProcessManager, ApplicationLoader, MockApplicationLoader, MockStream } from '@garyos/process'
import { VirtualProcessManager, EnvironmentVariables } from '@garyos/kernel'

const loader: ApplicationLoader = new MockApplicationLoader()
const pm: VirtualProcessManager = new ProcessManager(loader)
const io: MockStream = new MockStream([])
const env: EnvironmentVariables = {
  HOME: '/root/gary',
  USER: 'gary',
}
let xlines: string[] = []

// { process }: TerminalProps extends AppicationProps
export default function Terminal({ title, box }: WindowOption) {
  const [value, setValue] = useState('A=gary env | uppercase')
  const [PS1, setPS1] = useState('gary @Gary-MacBook-Pro site %')
  const [lines, setLines] = useState<string[]>([
    // 'gary @Gary-MacBook-Pro site % docker run -it -p 80:80 nginx',
    // 'zsh: command not found: docker',
    // 'gary @Gary-MacBook-Pro site % docker-compose build -d',
    // 'zsh: command not found: docker-compose',
    // 'gary @Gary-MacBook-Pro site %',
    // 'gary @Gary-MacBook-Pro site %',
    // 'gary @Gary-MacBook-Pro site %',
  ])

  xlines = lines

  const ps1 = useRef<HTMLDivElement>(null)
  const [textIndent, setTextIndent] = useState('')
  const { open } = useKernel()

  useEffect(() => {
    const width = ps1?.current?.offsetWidth ?? 0
    setTextIndent(`${width + 5}px`)
  }, [ps1])

  const valueLines = useMemo(() => lines, [lines])

  const addLines = useCallback((...newLines: string[]) => {
    const old = xlines
    setLines([...old, ...newLines])
  }, [])

  const getStandardOutput = useCallback(() => {
    return new WritableStream({
      write: (chunck: string) => addLines(chunck)
    })
  }, [addLines])

  const isNewCommand = (value: string) => /\r?\n/.test(value) && !/\\\r?\n$/.test(value)

  return (
    <Window title={title || 'gary -- -zsh -- 80x24'} box={box}>
      <div style={{ position: 'relative' }}>
        <div className={style.output}>
          {lines.map((line: string, index: number) => <div key={index}>{line}</div>)}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className={style.ps1} ref={ps1}>{PS1}</div>

        <textarea rows={10}
          spellCheck='false' autoComplete='false'
          autoCorrect='false' autoCapitalize='false'
          data-gramm='false'
          className={style.input} value={value}
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

              const io = new MockStream([''])
              io.init()
              addLines(`${PS1} ${value}`)

              pm.execScript(value, io, env, {})
                .then((code) => console.log(`CODE: ${code}`))
                .catch(e => addLines(`gsh: command not found: ${command}`))

              io.getStdOut()
                .then(output => {
                  console.log(`OUTPUT: ${output}`)
                  addLines(output)
                })
                .catch(error => console.log(`ERROR: ${error}`))

              setValue('')
              return;

              const [command] = value.split(' ')
              // addLines(`${PS1} ${value}`, `zsh: command not found: ${command}`)

              const [options, _, grep] = parseProcessOptions(value)

              addLines(`${PS1} ${value}`)

              const transform = new TransformStream()
              options.stdout = grep ? transform.writable : getStandardOutput()
              options.stderr = getStandardOutput()

              if (grep) {
                grep.stdin = transform.readable
                grep.stdout = getStandardOutput()
                grep.stderr = getStandardOutput()
              }

              // setValue('')

              // Promise.all([options, grep].filter(Boolean).map(open))
              //   .then((a) => console.log(a))
              //   .catch(e => addLines(`zsh: command not found: ${command}`))

            } else setValue(value)
          }}>
        </textarea>
      </div>
    </Window >
  )
}
