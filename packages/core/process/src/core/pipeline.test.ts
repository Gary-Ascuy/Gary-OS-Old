import { AppicationMainResponse, EnvironmentVariables, Pipeline } from '@garyos/kernel'

import { ApplicationLoader } from '../loader/ApplicationLoader'
import { MockApplicationLoader } from '../loader/ApplicationLoader.mock'
import { MockStream } from '../loader/Stream.mock'
import { pipeline } from './pipeline'

describe('pipeline.ts', () => {
  let loader: ApplicationLoader
  let env: EnvironmentVariables
  let io: MockStream

  describe('.pipeline()', () => {
    beforeEach(() => {
      loader = new MockApplicationLoader()
      env = { USER: 'gary', HOME: '/root/gary/' }
      io = new MockStream([''])
      io.init()
    })

    test('should run a basic pipeline', async () => {
      const pipe: Pipeline = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a many echo pipeline', async () => {
      const pipe: Pipeline = [
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
        { argv: ['echo', 'info'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('info')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a long pipeline', async () => {
      const pipe: Pipeline = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['echo', 'gary'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('gary')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should run a long pipeline and return latest error code', async () => {
      const pipe: Pipeline = [
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
        { argv: ['failure'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.FAILURE)
    })

    test('should run a long pipeline and return latest success code', async () => {
      const pipe: Pipeline = [
        { argv: ['failure'], env: {}, execPath: '' },
        { argv: ['failure'], env: {}, execPath: '' },
        { argv: ['success'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe one process', async () => {
      const pipe: Pipeline = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('Gary Ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe two process', async () => {
      const pipe: Pipeline = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
        { argv: ['uppercase'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('GARY ASCUY')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe three process', async () => {
      const pipe: Pipeline = [
        { argv: ['echo', 'Gary Ascuy'], env: {}, execPath: '' },
        { argv: ['uppercase'], env: {}, execPath: '' },
        { argv: ['lowercase'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('gary ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many process (removelast 1)', async () => {
      const pipe: Pipeline = [
        { argv: ['echo', 'First Name Gary Ascuy Anturiano'], env: { DEBUG: '1' }, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('First Name Gary Ascuy')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many process (removelast 3)', async () => {
      const pipe: Pipeline = [
        { argv: ['echo', 'First Name Gary Ascuy Anturiano'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
        { argv: ['removelast'], env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('First Name')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })

    test('should pipe many greps', async () => {
      const io = new MockStream([
        'gary.zip\n',
        'gary_ascuy.png\n',
        'finalgary_ascuy.png\n',
        'figary_ascuy.zip\n',
        'final.zip\n',
        'gary_test.zip\n',
      ])
      io.init()

      const pipe: Pipeline = [
        { argv: 'grep .zip'.split(' '), env: {}, execPath: '' },
        { argv: 'grep --pattern ^gary'.split(' '), env: {}, execPath: '' },
      ]
      const execution = pipeline(loader, pipe, io, env)

      expect(io.getStdOut()).resolves.toBe('gary.zip\ngary_test.zip\n')
      return expect(execution).resolves.toBe(AppicationMainResponse.SUCCESS)
    })
  })
})
