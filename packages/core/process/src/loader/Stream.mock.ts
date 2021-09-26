import { TransformStream, ReadableStream } from 'web-streams-polyfill';
import { StandardStream, StringReadableStream, StringWritableStream, StringTransformStream} from '@garyos/kernel';

export class MockStream implements StandardStream {
  public _stdin: StringTransformStream = new TransformStream<string>();
  public _stdout: StringTransformStream = new TransformStream<string>();
  public _stderr: StringTransformStream = new TransformStream<string>();

  public stdin: StringReadableStream;
  public stdout: StringWritableStream;
  public stderr: StringWritableStream;

  constructor(
    private inputChunks: string[]
  ) {
    this.stdin = this._stdin.readable;
    this.stdout = this._stdout.writable;
    this.stderr = this._stderr.writable;
  }

  async init() {
    await this.writeInput(this.inputChunks);
  }

  async writeInput(chunks: string[]) {
    const writer = this._stdin.writable.getWriter();
    for (const chunk of chunks) {
      await writer.write(chunk);
    }
    await writer.close();
  }

  async getStdOut() {
    const chunks = await this.getReadableChunks(this._stdout.readable);
    return chunks.join('');
  }

  async getStdErr() {
    const chunks = await this.getReadableChunks(this._stderr.readable);
    return chunks.join('');
  }

  async getReadableChunks(readable: ReadableStream<string>): Promise<string[]> {
    const reader = readable.getReader();

    let chunks: string[] = [];
    let done;
    do {
      const chunk = await reader.read();
      if (chunk.value) chunks.push(chunk.value);
      done = chunk.done;
    } while (!done);

    return chunks;
  }
}
