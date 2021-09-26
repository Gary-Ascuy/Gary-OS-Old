
import { WritableStream, UnderlyingSink } from 'web-streams-polyfill'

export class ParallelWritableStream<W = any> extends WritableStream {
  private writer: WritableStreamDefaultWriter

  constructor(underlyingSink?: UnderlyingSink<W>, strategy?: QueuingStrategy<W>) {
    super(underlyingSink, strategy)

    this.writer = this.getWriter()
  }

  getInstance(): WritableStream {
    const write = (chunk: any) => { this.writer.write(chunk) }
    return new WritableStream({ write })
  }
}
