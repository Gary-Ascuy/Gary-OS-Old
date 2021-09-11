import { atom } from 'recoil'

export interface UserState {
  name: string
  role?: string
  fullName?: string
  email?: string
  github?: string
  bio?: string[]
}

const defaultUser: UserState = {
  name: 'Gary Ascuy',
  role: 'Senior Software Developer',
  fullName: 'Gary Ascuy Anturiano',
  email: 'gary.ascuy@gmail.com',
  github: 'github.com/gary-ascuy',
  bio: [
    'Senior Software Developer',
    'Cat & Robotics Lover',
    'Chef Amateur',
  ],
}

export const userState = atom<UserState>({
  key: 'user',
  default: defaultUser,
})
