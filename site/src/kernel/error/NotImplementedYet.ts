import { GOSError } from './GOSError'

export class NotImplementedYet extends GOSError {
  public static CODE: 100003

  constructor(message: string = 'Not Implemented Yet') {
    super(message, NotImplementedYet.CODE)
  }
}
