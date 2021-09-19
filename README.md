## Gary OS - Web Based Operation System

Gary OS (gOS) is a web based operation system that simulate base functionalities from *nix and MacOS theme

## Kernel Architecture

![FileSystem Architecture](https://docs.google.com/drawings/d/1pQMD4cKdM1GkHRSgBIBvwZN4SC0PEASshsUh-OwQZzs/export/svg)

### Process Architecture

TBD

### File System Architecture

![FileSystem Architecture](https://docs.google.com/drawings/d/1MmX5D0Ub24ifzQzs3tWR7nqnjXTo3f-xdEh9DQjLWk0/export/svg)

Code Example

```ts
import { FileSystemManager } from '@garyos/filesystem'

const fs: FileSystemManager = new FileSystemManager()
await manager.mount()

const file = await fs.open(path, 'w') as WritableStream
const writer = file.getWriter()

await writer.write('FirstLine\n')
await writer.write('SecondLine\n')
await writer.close()
```
