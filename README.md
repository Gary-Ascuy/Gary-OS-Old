## Gary OS - Web Based Operation System

Gary OS (gOS) is a web based operation system that simulate base functionalities from *nix and MacOS theme

## Kernel Architecture

![FileSystem Architecture](https://docs.google.com/drawings/d/1pQMD4cKdM1GkHRSgBIBvwZN4SC0PEASshsUh-OwQZzs/export/svg)

### Process Architecture

![FileSystem Architecture](https://docs.google.com/drawings/d/1EliGOwXV4tWl2-ztheYHi1927YtWE5PrXNhkJXmn0PY/export/svg)

```ts
import { ProcessManager } from '@garyos/process'

const pm: ProcessManager = new ProcessManager()

// command line interface 
pm.open(['com.garyos.echo', 'Hello', 'World']) // => $ echo Hello Word
pm.open(['com.garyos.ls', '-la']) // => $ ls -la
pm.open(['./gary.gos', '--format', '%d-%m-%y %H:%M']) // => $ ./gary.gos --format "%d-%m-%y %H:%M"

// open applications
pm.open(['com.garyos.terminal']) // => $ open Terminal Window
pm.open(['com.garyos.preview']) // => $ open Preview Window

// pipes
pm.open('echo hello world | uppercase | code') // => $ open VSCode with (echo hello world | uppercase = 'HELLO WORLD')
pm.open('ls ./github | latest | code') // => $ open VSCode with latest Repository of GitHub
```

### File System Architecture

![FileSystem Architecture](https://docs.google.com/drawings/d/1MmX5D0Ub24ifzQzs3tWR7nqnjXTo3f-xdEh9DQjLWk0/export/svg)

Code Example

```ts
import { FileSystemManager } from '@garyos/filesystem'

const fs: FileSystemManager = new FileSystemManager()
await manager.mount()
```

```ts
const path = '/root/gary.txt'
const file = await fs.open(path, 'w') as WritableStream
const writer = file.getWriter()

await writer.write('FirstLine\n')
await writer.write('SecondLine\n')
await writer.close()
```

```ts
const path = '/root/gary.txt'
const content = 'Some Data To Save'

await fs.writeFile(path, content)
const data = await fs.readFile(path)

expect(data).toBe(content)
```
