import { WritableStream, UnderlyingSink } from 'web-streams-polyfill'

export class ParallelWritableStream extends WritableStream<string> {
  private writer: WritableStreamDefaultWriter

  constructor(underlyingSink?: UnderlyingSink<string>, strategy?: QueuingStrategy<string>) {
    super(underlyingSink, strategy)

    this.writer = this.getWriter()
  }

  getInstance(): WritableStream {
    const write = (chunk: string) => { this.writer.write(chunk) }
    return new WritableStream<string>({ write })
  }
}
