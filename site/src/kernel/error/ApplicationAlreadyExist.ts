import { GOSError } from './GOSError'

export class ApplicationAlreadyExist extends GOSError {
  public static CODE: 100002

  constructor(message: string = 'Application Already Exist') {
    super(message, ApplicationAlreadyExist.CODE)
  }
}
