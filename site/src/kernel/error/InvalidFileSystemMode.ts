import { GOSError } from './GOSError'

export class InvalidFileSystemMode extends GOSError {
  public static CODE: 100004

  constructor(message: string = 'Invalid FileSystem Mode') {
    super(message, InvalidFileSystemMode.CODE)
  }
}
