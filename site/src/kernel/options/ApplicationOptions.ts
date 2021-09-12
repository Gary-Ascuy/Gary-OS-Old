export interface Author {
  name: string
  email: string
}

export interface ApplicationOptions {
  name: string
  icon: string
  source: string

  author: string | string[] | Author | Author[]
}
