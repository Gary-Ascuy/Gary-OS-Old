export class FileDoesNotExistError extends Error {
  constructor(message: string = 'Error: File does not exist') {
    super(message)
  }
}
