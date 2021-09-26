export class ParallelReadableStream extends TransformStream<string> {
  constructor(chunks: string[] = []) {
    super();

    this.write(chunks);
  }

  async write(chunks: string[]): Promise<void> {
    const writer = this.writable.getWriter();
    for (const chunk of chunks) {
      await writer.write(chunk);
    }
    await writer.close();
  }
}
