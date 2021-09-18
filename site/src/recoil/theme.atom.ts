import { atom } from 'recoil'

export enum ThemeState {
  Dark = 'dark',
  Light = 'light',
}

export const themeState = atom<ThemeState>({
  key: 'theme',
  default: ThemeState.Dark,
})
