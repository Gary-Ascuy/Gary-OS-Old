
export class InvalidFileReferenceError extends Error {
  constructor(message: string = 'Error: Invalid File Reference') {
    super(message);
  }
}
