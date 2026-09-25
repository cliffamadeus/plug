import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import { InferenceClient } from '@huggingface/inference'

dotenv.config()

const app = express()

app.use(cors())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

const hf = new InferenceClient(process.env.HF_TOKEN)

app.post('/api/describe', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image uploaded.'
      })
    }

    console.log('Image received:')
    console.log('Filename:', req.file.originalname)
    console.log('Type:', req.file.mimetype)
    console.log('Size:', req.file.size)

    const base64Image = req.file.buffer.toString('base64')

    const imageData =
      `data:${req.file.mimetype};base64,${base64Image}`

    const result = await hf.chatCompletion({
      model: 'deepseek-ai/DeepSeek-V4.1-Flash:baseten',

      messages: [
        {
          role: 'user',

          content: [
            {
              type: 'text',
              text: 'Describe this image clearly in one or two sentences.'
            },

            {
              type: 'image_url',

              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],

      max_tokens: 150
    })

    const description =
      result.choices?.[0]?.message?.content

    if (!description) {
      return res.status(500).json({
        error: 'The AI did not return a description.'
      })
    }

    console.log('Description:', description)

    res.json({
      description
    })

  } catch (error) {

    console.error('Hugging Face error:')
    console.error(error)

    res.status(500).json({
      error:
        error?.message ||
        'Failed to generate image description.'
    })
  }
})

app.listen(3001, () => {
  console.log(
    'AI server running on http://localhost:3001'
  )
})