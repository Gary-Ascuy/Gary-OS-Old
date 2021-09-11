import { atom } from 'recoil'

export const userState = atom({
  key: 'user',
  default: {
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
  },
})
