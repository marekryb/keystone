import { createReadStream } from 'node:fs'
import { resolve, basename } from 'node:path'
// @ts-expect-error
import Upload from 'graphql-upload/Upload.js'
import cloudinary from 'cloudinary'
import { cloudinaryImage } from './index'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'cloudinary_cloud_name',
  api_key: process.env.CLOUDINARY_KEY || 'cloudinary_key',
  api_secret: process.env.CLOUDINARY_SECRET || 'cloudinary_secret',
})

function prepareFile(path_: string) {
  const path = resolve(`packages/cloudinary/src/test-files/${path_}`)
  const upload = new Upload()
  upload.resolve({
    createReadStream: () => createReadStream(path),
    filename: basename(path),
    mimetype: 'image/jpeg',
    encoding: 'utf-8',
  })
  return upload
}

// Configurations
export const name = 'CloudinaryImage'
export const typeFunction = cloudinaryImage
export const supportsUnique = false
export const skipRequiredTest = true
export const supportsNullInput = true
export const supportsDbMap = true
export const fieldName = 'image'
export const subfieldName = 'originalFilename'

// This function will run after all the tests are completed.
// We use it to cleanup the resources (e.g Cloudinary images) which are no longer required.
export const afterAll = () => cloudinary.v2.api.delete_resources_by_prefix('cloudinary-test')
export const exampleValue = () => prepareFile('graphql.jpeg')
export const exampleValue2 = () => prepareFile('keystone.jpeg')
export const createReturnedValue = exampleValue().file.filename
export const updateReturnedValue = exampleValue2().file.filename

export const fieldConfig = () => ({
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'cloudinary_cloud_name',
    apiKey: process.env.CLOUDINARY_KEY || 'cloudinary_key',
    apiSecret: process.env.CLOUDINARY_SECRET || 'cloudinary_secret',
    folder: 'cloudinary-test',
  },
})
export const getTestFields = () => ({
  image: cloudinaryImage({
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'cloudinary_cloud_name',
      apiKey: process.env.CLOUDINARY_KEY || 'cloudinary_key',
      apiSecret: process.env.CLOUDINARY_SECRET || 'cloudinary_secret',
      folder: 'cloudinary-test',
    },
  }),
})

export const initItems = () => [
  { image: prepareFile('graphql.jpeg'), name: 'file0' },
  { image: prepareFile('keystone.jpeg'), name: 'file1' },
  { image: prepareFile('react.jpeg'), name: 'file2' },
  { image: prepareFile('thinkmill.jpeg'), name: 'file3' },
  { image: prepareFile('thinkmill1.jpeg'), name: 'file4' },
  { image: null, name: 'file5' },
  { image: null, name: 'file6' },
]

export const storedValues = () => [
  { image: { originalFilename: 'graphql.jpeg' }, name: 'file0' },
  { image: { originalFilename: 'keystone.jpeg' }, name: 'file1' },
  { image: { originalFilename: 'react.jpeg' }, name: 'file2' },
  { image: { originalFilename: 'thinkmill.jpeg' }, name: 'file3' },
  { image: { originalFilename: 'thinkmill1.jpeg' }, name: 'file4' },
  { image: null, name: 'file5' },
  { image: null, name: 'file6' },
]
