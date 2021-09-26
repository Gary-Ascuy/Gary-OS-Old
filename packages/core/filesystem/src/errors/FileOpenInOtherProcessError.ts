export class FileOpenInOtherProcessError extends Error {
  constructor(message: string = 'Error: Folder or File is open in another process') {
    super(message)
  }
}
