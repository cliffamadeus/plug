import { useState } from 'react'
import './App.css'

function App() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
    setDescription('')
    setError('')
  }

  const describeImage = async () => {
    if (!image) {
      setError('Please select an image first.')
      return
    }

    setLoading(true)
    setDescription('')
    setError('')

    try {
      const formData = new FormData()

      formData.append('image', image)

      const response = await fetch(
        'http://localhost:3001/api/describe',
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to describe image.'
        )
      }

      setDescription(data.description)

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">

      <section className="container">

        <h1>Image Description</h1>

        <p>
          Upload an image and let AI describe what it sees.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="preview">
            <img
              src={preview}
              alt="Selected"
            />
          </div>
        )}

        <button
          onClick={describeImage}
          disabled={!image || loading}
        >
          {loading
            ? 'Analyzing...'
            : 'Describe Image'}
        </button>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {description && (
          <section className="result">

            <h2>Description</h2>

            <p>
              {description}
            </p>

          </section>
        )}

      </section>

    </main>
  )
}

export default App