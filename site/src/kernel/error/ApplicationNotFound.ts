import { GOSError } from './GOSError'

export class ApplicationNotFound extends GOSError {
  public static CODE: 100001

  constructor(message: string = 'Application Not Found') {
    super(message, ApplicationNotFound.CODE)
  }
}
