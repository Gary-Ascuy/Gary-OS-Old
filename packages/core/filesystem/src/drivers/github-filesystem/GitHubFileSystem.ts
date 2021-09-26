import { BaseFileSystem, FileStream, VirtualFile } from '@garyos/kernel'
import { Octokit } from '@octokit/rest'

/**
 * mount /root/gary-ascuy/ -d github -p username:gary-ascuy -p public-only -p map:branches
 * mount /root/data/ -d localstorage -p namespace:gary
 *
 * https://github1s.com/Gary-Ascuy/Gary-OS/tree/develop
 * root::mount(username=Gary-Ascuy) => /root/gary-ascuy
 *    - 'Gary-OS'
 *      - develop
 *        - site
 *      - main
 *        - site
 *        - tools
 *          - docker
 *        - packages
 *          - core
 *            - kernel
 *            - virtual-filesystem
 *              - github-filesystem
 *              - localstorage-filesystem
 *              - memory-filesystem
 *          - apps
 *    - 'Gary-Ascuy'
 *      - main
 *    - 'CertiCovidSite'
 *    - 'ci-as-code'
 */
export class GitHubFileSystem extends BaseFileSystem {
  constructor(
    public username: string = 'Gary-Ascuy',
    public octokit: Octokit = new Octokit({
      userAgent: 'GaryOS v1.0.0',
      baseUrl: 'https://api.github.com',
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })
  ) {
    super()
  }

  async mount(): Promise<void> {
    // const repos = await this.octokit.rest.repos.listForUser({
    //   username: this.username
    // })

    // const data = repos.data.map((repo) => pick(repo, ['id', 'node_id', 'name', 'full_name', 'html_url', 'description', 'owner']))
    // console.log(data)
  }

  unmount(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getFile(path: string, exclusive: boolean): Promise<VirtualFile> {
    throw new Error('Method not implemented.')
  }

  free(file: string | VirtualFile): Promise<void> {
    throw new Error('Method not implemented.')
  }

  open(path: string, mode: string): Promise<FileStream> {
    throw new Error('Method not implemented.')
  }

  exist(path: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  remove(path: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  readAllContent(path: string): Promise<string | null> {
    throw new Error('Method not implemented.')
  }
}
