import { TransformStream, ReadableStream, WritableStream } from 'web-streams-polyfill';
import { StandardStream } from '@garyos/kernel';

export class MockStream implements StandardStream {
  public _stdin: TransformStream = new TransformStream();
  public _stdout: TransformStream = new TransformStream();
  public _stderr: TransformStream = new TransformStream();

  public stdin: ReadableStream;
  public stdout: WritableStream;
  public stderr: WritableStream;

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

  async getReadableChunks(readable: ReadableStream): Promise<string[]> {
    const reader = readable.getReader();

    let chunks: string[] = [];
    let done;
    do {
      const chunk = await reader.read();
      chunks.push(chunk.value);
      done = chunk.done;
    } while (!done);

    return chunks;
  }
}
