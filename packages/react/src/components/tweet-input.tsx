import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { clearContent, formatContent } from '@/utils/dom'

const TweetInput = forwardRef<
  { clear: () => void },
  { className?: string; onChange?: (content: string) => void }
>(({ className, onChange }, ref) => {
  const editRef = useRef<HTMLDivElement>(null)
  const [isComposition, setComposition] = useState(false)

  useImperativeHandle(
    ref,
    () => {
      return {
        clear: () => {
          if (editRef.current) {
            clearContent(editRef.current)
          }
        },
      }
    },
    [],
  )

  useEffect(() => {
    if (editRef.current) {
      formatContent(editRef.current)
    }
  }, [editRef])

  const formatEdit = () => {
    if (!editRef.current) return

    formatContent(editRef.current)
    onChange?.(editRef.current.innerText)
  }

  const handleBeforeInput = (event: React.FormEvent<HTMLDivElement>) => {
    console.log('before input', event);
  }
  const handleInput = () => {
    if (!isComposition) {
      formatEdit()
    }
  }
  const handleCompositionStart = () => {
    setComposition(true)
  }
  const handleCompositionEnd = () => {
    setComposition(false)
    formatEdit()
  }

  return (
    <div
      ref={editRef}
      className={className}
      contentEditable
      onBeforeInput={handleBeforeInput}
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    ></div>
  )
})

export default TweetInput
