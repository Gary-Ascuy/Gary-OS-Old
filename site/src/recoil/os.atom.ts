import { atom } from 'recoil'

export const osState = atom({
  key: 'os',
  default: {
    name: 'Gary OS',
    version: '0.0.1',
    github: 'https://github.com/Gary-Ascuy/Gary-OS',
  },
})
