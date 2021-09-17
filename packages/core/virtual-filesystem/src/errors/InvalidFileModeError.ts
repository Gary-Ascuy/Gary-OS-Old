export class InvalidFileModeError extends Error {
  constructor(message: string = 'Error: Invalid file mode') {
    super(message)
  }
}
