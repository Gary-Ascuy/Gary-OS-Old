export class GOSError extends Error {
  constructor(message: string, public code: number = 0, public details: string[] = []) {
    super(message)
  }
}
