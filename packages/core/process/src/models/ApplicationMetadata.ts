import { ApplicationAuthor } from './ApplicationAuthor'

export interface ApplicationMetadata {
  /**
   * Application Unique Identifier
   *
   * @example com.garyos.echo
   * @example com.garyos.ls
   * @example io.ziogd.deluxterminal
   */
  identifier: string

  /**
   * General Information about the app
   *
   * @example { name: 'Echo', version: '1.0.0', description: 'Write arguments to the standard output' }
   * @example { name: 'Ls', version: '0.0.1-alpha', description: 'List directory contents' }
   */
  name: string
  version: string
  description?: string

  /**
   * References
   * @example { icon: 'https://something.com/echo_icon.webp', source: 'https://github.com/gary-ascuy/echo' }
   * @example { source: 'https://github.com/gary-ascuy/ls' }
   */
  icon?: string
  source?: string

  /**
   * List of authors of the application
   *
   * @example [{ name: 'Gary Ascuy', email: 'gary.ascuy@gmail.com' }]
   * @example [{ name: 'Zio Game Development', email: 'info@ziogd.com' }]
   */
  authors: ApplicationAuthor[]
}
