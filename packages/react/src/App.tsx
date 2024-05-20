import { useRef, useState, ElementRef } from 'react'
import './App.css'
import TweetInput from './components/tweet-input'

function App() {
  const tweetInput = useRef<ElementRef<typeof TweetInput>>(null)
  const [draft, setDraft] = useState<string>('')
  const [tweets, setTweets] = useState<string[]>([])

  const handleChange = (val: string) => {
    setDraft(val)
  }
  const handleClick = () => {
    setTweets([...tweets, draft])
    setDraft('')
    tweetInput.current?.clear()
  }

  return (
    <div className="container">
      <TweetInput ref={tweetInput} className="input" onChange={handleChange} />

      <div style={{ textAlign: 'right', marginTop: '12px', marginBottom: '24px' }}>
        <button onClick={handleClick}>Post</button>
      </div>

      <ul style={{ textAlign: 'left' }}>
        {tweets.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
