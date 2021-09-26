import {
  AppicationMainResponse, EnvironmentVariables, Pipeline, StandardStream,
  StandardStreamCreator, StringReadableStream, StringWritableStream,
} from "@garyos/kernel"
import { TransformStream } from 'web-streams-polyfill'

import { ApplicationLoader } from '../loader/ApplicationLoader'
import { executeAndFlush } from './exec'

export function getStdOut(isLatest: boolean, pipe: TransformStream<string, string>, io: StandardStreamCreator): StringWritableStream {
  return isLatest ? io.stdout : (pipe.writable as StringWritableStream)
}

export async function buildPipelineStreams(pipeline: Pipeline, io: StandardStreamCreator): Promise<StandardStream[]> {
  let pipe: TransformStream<string, string> = new TransformStream<string, string>()
  let stdin: StringReadableStream = io.stdin

  const latest = pipeline.length - 1
  const stderrs = await Promise.all(pipeline.map(() => io.new_stderr()))

  const streams = pipeline.map((_, index: number) => {
    const stderr = stderrs[index]
    const stdout = getStdOut(index === latest, pipe, io)
    const stream: StandardStream = { stderr, stdin, stdout }

    stdin = pipe.readable
    pipe = new TransformStream<string, string>()
    return stream
  })

  return streams
}

export async function pipeline(loader: ApplicationLoader, pipeline: Pipeline, io: StandardStreamCreator, system: EnvironmentVariables): Promise<number> {
  if (pipeline && pipeline.length === 0) throw new Error('Invalid Pipeline')

  const streams = await buildPipelineStreams(pipeline, io)
  const processes = pipeline
    .map((task, index: number) => ({ task, io: streams[index] }))
    .map(({ task, io }) => executeAndFlush(loader, task, io, system))

  const codes = await Promise.all(processes)
  return codes.pop() ?? AppicationMainResponse.ERROR
}
