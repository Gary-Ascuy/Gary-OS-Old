export class InvalidFileReferenceError extends Error {
  constructor(message: string = 'Error: Invalid file reference') {
    super(message)
  }
}
