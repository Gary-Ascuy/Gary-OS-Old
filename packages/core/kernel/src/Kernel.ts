import { VirtualFileSystem } from './filesystem/VirtualFileSystem'
import { EnvironmentVariables } from './process/EnvironmentVariables'
import { VirtualProcessManager } from './process/VirtualProcessManager'

/**
 * Kernel's Services
 *
 * @example```
 * const kernel: Kernel = ...
 *
 * asycn function echo(pid: string, { env }: Process, { fs, pm }: Kernel) {
 *   // files
 *   fs.writeFile('/root/gary/logs.txt', 'example save')
 *   const file = fs.open('/root/gary/logs.txt', 'r')
 *   const reader = file.getReader()
 *   ...
 *
 *   // process
 *   pm.exec('ls -la')
 * }
 *
 * await echo( , , kernel)
 * ```
 */
export interface Kernel {
  get pm(): VirtualProcessManager
  get fs(): VirtualFileSystem

  get env(): EnvironmentVariables
}
