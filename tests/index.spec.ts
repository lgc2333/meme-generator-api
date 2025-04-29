import { readFileSync } from 'node:fs'
import path from 'node:path'

import { HTTP } from '@cordisjs/plugin-http'
import { expect, use } from 'chai'
import ChaiAsPromised from 'chai-as-promised'
import dotenv from 'dotenv'
import { MemeAPI, RenderMemeListRequest } from 'meme-generator-api'

use(ChaiAsPromised)

dotenv.config({ path: '.env.test' })

const examplePicBuf = readFileSync(path.join(__dirname, 'res', 'emoji_u1f970.png'))
function getExamplePic() {
  return new Blob([examplePicBuf], { type: 'image/png' })
}

describe('MemeAPI', () => {
  const http = new HTTP({ baseURL: process.env.MEME_GENERATOR_BASE_URL })
  const memeAPI = new MemeAPI(http)

  describe('renderList', () => {
    it('with meme list', async () => {
      const data: RenderMemeListRequest = {
        meme_list: (await memeAPI.getKeys()).map((k) => ({ meme_key: k })),
      }
      const result = await memeAPI.renderList(data)
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)

    it('with no meme list', async () => {
      const result = await memeAPI.renderList()
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)

    it('invalid param, should throw error', async () => {
      const data = { meme_list: '1145141919810' }
      await expect(memeAPI.renderList(data as any)).to.be.rejectedWith(
        'Input should be a valid list',
      )
    })
  })

  describe('getKeys', () => {
    it('get', async () => {
      const result = await memeAPI.getKeys()
      expect(result).to.be.an('array')
    })
  })

  describe('getInfo', () => {
    it('valid key', async () => {
      const key = 'petpet'
      const result = await memeAPI.getInfo(key)
      expect(result).to.be.an('object')
    })

    it('invalid key should throw error', async () => {
      const key = 'invalid_key_114514'
      await expect(memeAPI.getInfo(key)).to.be.rejectedWith('no-such-meme')
    })
  })

  describe('renderPreview', () => {
    it('valid key', async () => {
      const key = 'petpet'
      const result = await memeAPI.renderPreview(key)
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)

    it('invalid key should throw error', async () => {
      const key = 'invalid_key_1919810'
      await expect(memeAPI.renderPreview(key)).to.be.rejectedWith('no-such-meme')
    })
  })

  describe('renderMeme', () => {
    it('pic only', async () => {
      const key = 'petpet'
      const options: MemeAPI.RenderOptions = { images: [getExamplePic()] }
      const result = await memeAPI.renderMeme(key, options)
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)

    it('image number mismatch should throw error', async () => {
      const key = 'petpet'
      const options: MemeAPI.RenderOptions = {
        images: [getExamplePic(), getExamplePic()],
      }
      await expect(memeAPI.renderMeme(key, options)).to.be.rejectedWith(
        'image-number-mismatch',
      )
    })

    it('pic and arg', async () => {
      const key = 'petpet'
      const options: MemeAPI.RenderOptions = {
        images: [getExamplePic()],
        args: { circle: true },
      }
      const result = await memeAPI.renderMeme(key, options)
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)

    it('invalid arg should throw error', async () => {
      const key = 'petpet'
      const options: MemeAPI.RenderOptions = {
        images: [getExamplePic()],
        args: { circle: 'homo senpai' },
      }
      await expect(memeAPI.renderMeme(key, options)).to.be.rejectedWith(
        'arg-model-mismatch',
      )
    })

    it('text only', async () => {
      const key = 'osu'
      const options: MemeAPI.RenderOptions = { texts: ['hso!'] }
      const result = await memeAPI.renderMeme(key, options)
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)

    it('text number mismatch should throw error', async () => {
      const key = 'osu'
      const options: MemeAPI.RenderOptions = { texts: ['hso!', 'esu!'] }
      await expect(memeAPI.renderMeme(key, options)).to.be.rejectedWith(
        'text-number-mismatch',
      )
    })

    it('pic and text and user info', async () => {
      const key = 'little_angel'
      const options: MemeAPI.RenderOptions = {
        images: [getExamplePic()],
        texts: ['野兽先辈'],
        args: { user_infos: [{ name: '野兽先辈', gender: 'male' }] },
      }
      const result = await memeAPI.renderMeme(key, options)
      expect(result).to.be.instanceOf(Blob)
    }).timeout(10000)
  })
})
