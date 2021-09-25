
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

export class ParallelReadableStream extends TransformStream {
  constructor(chunks: string[] = [],) {
    super()

    this.write(chunks)
  }

  async write(chunks: string[]): Promise<void> {
    const writer = this.writable.getWriter()
    for (const chunk of chunks) {
      await writer.write(chunk)
    }
    await writer.close()
  }
}
