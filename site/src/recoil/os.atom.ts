import { atom } from 'recoil'

export interface OsState {
  name: string
  version: string
  github: string
}

export const osState = atom<OsState>({
  key: 'os',
  default: {
    name: 'Gary OS',
    version: '0.0.1',
    github: 'https://github.com/Gary-Ascuy/Gary-OS',
  },
})
