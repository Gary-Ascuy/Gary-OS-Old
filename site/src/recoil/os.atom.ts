import { atom } from 'recoil'

export const theme = atom({
  key: 'theme',
  default: {
    name: 'Gary OS',
    version: '0.0.1',
    github: 'https://github.com/Gary-Ascuy/Gary-OS',
  },
})
