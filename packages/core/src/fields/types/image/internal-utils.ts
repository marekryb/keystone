import { JPG } from 'image-size/types/jpg'
import { PNG } from 'image-size/types/png'
import { WEBP } from 'image-size/types/webp'
import { GIF } from 'image-size/types/gif'
import { PassThrough, type Readable } from 'node:stream'

export function getImageMetadata(bytes: Uint8Array) {
  for (const [type, checker] of types) {
    if (checker.validate(bytes)) {
      const result = checker.calculate(bytes)
      if (result.width === undefined || result.height === undefined) {
        return
      }
      return {
        width: result.width,
        height: result.height,
        extension: type,
      }
    }
  }
}

const types = [
  ['jpg', JPG],
  ['png', PNG],
  ['webp', WEBP],
  ['gif', GIF],
] as const

export type ImageExtension = (typeof types)[number][0]

export async function getBytesFromStream(stream: Readable, maxBytes: number): Promise<Buffer> {
  let chunks: Buffer[] = []
  for await (const chunk of stream) {
    maxBytes -= chunk.length
    chunks.push(chunk)
    if (maxBytes <= 0) {
      break
    }
  }
  stream.destroy()
  return Buffer.concat(chunks)
}

export function teeStream(source: Readable): [Readable, Readable] {
  const passThrough1 = new PassThrough()
  const passThrough2 = new PassThrough()

  source.pipe(passThrough1)
  source.pipe(passThrough2)

  source.on('error', err => {
    passThrough1.destroy(err)
    passThrough2.destroy(err)
  })

  return [passThrough1, passThrough2]
}
