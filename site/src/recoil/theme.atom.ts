import { atom } from 'recoil'

export enum Theme {
  Dark = 'dark',
  Light = 'light',
}

export const themeState = atom({
  key: 'theme',
  default: Theme.Dark,
})
