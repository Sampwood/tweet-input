export const createSpan = (content?: string) => {
  const span = document.createElement('span')
  if (content) {
    span.textContent = content
  } else {
    const br = document.createElement('br')
    span.appendChild(br)
  }
  return span
}
const createDiv = (content?: string) => {
  const div = document.createElement('div')
  const span = createSpan(content)
  div.appendChild(span)
  return div
}

// TODO: 优化方法; 获取编辑器下的行元素，并计算光标所在位置
export const getRangePosition = (root: Element) => {
  const selection = getSelection()
  if (!selection) {
    return { lineNode: null, offset: 0 }
  }
  const range = selection.getRangeAt(0)

  const { startContainer } = range
  const parentNode = startContainer.parentNode
  let offset = range.startOffset

  if (parentNode === root) {
    if (startContainer.nodeType === Node.TEXT_NODE) {
      // first input
      return { lineNode: null, offset: 0 }
    } else {
      return { lineNode: startContainer, offset }
    }
  } else if (!parentNode?.parentNode) {
    return { lineNode: null, offset: 0 }
  }

  const lineNode = parentNode.parentNode
  for (const child of lineNode.children) {
    if (child === parentNode) {
      break
    } else {
      offset += child.textContent?.length || 0
    }
  }

  return { lineNode, offset }
}

const setCursorPosition = (node: Node, offset: number) => {
	const selection = document.getSelection();

	if (!selection) {
		return;
	}

	selection.removeAllRanges();

  const range = document.createRange();
	range.setStart(node, offset);
	range.collapse(true);

	selection.addRange(range);
}

// TODO: 考虑 1.换行的情况; 2. 后退；3. 复制粘贴富文本的情况；
export const formatContent = (edit: HTMLElement) => {
  if (!edit.textContent && edit.firstChild?.nodeName.toUpperCase() !== 'DIV') {
    clearContent(edit)
    setCursorPosition(edit.firstChild || edit, 0  )
    return
  }

  edit.focus()
  const { lineNode, offset } = getRangePosition(edit)
  let startNode = null
  let startOffset = offset

  const children = []
  for (const node of edit.childNodes) {
    // first input
    if (node.nodeType == Node.TEXT_NODE) {
      const newNode = createDiv(node.textContent|| undefined)
      children.push(newNode)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.textContent?.replace(/&nbsp;/g, ' ') || ''
      const words = text.split(' ')
      if (words.some((w) => w.length > 1 && w.startsWith('#'))) {
        // convert to span
        const newNode = document.createElement('div')
        let preStr = ''
        for (let i = 0; i < words.length; i++) {
          const word = words[i]
          const isFirstWord = i === 0
          const isLastWord = i === words.length - 1
          const data = isLastWord ? (isFirstWord ? word : ' ' + word) : word + ' '
          if (word.startsWith('#')) {
            if (preStr) {
              const span = createSpan(preStr)
              newNode.appendChild(span)
              preStr = ''
            }

            const span = createSpan(word)
            span.style.color = 'blue'
            newNode.appendChild(span)
          } else {
            preStr += data
          }
        }
        if (preStr) {
          const span = createSpan(preStr)
          newNode.appendChild(span)
          preStr = ''
        }
        children.push(newNode)
      } else {
        const span = createSpan(text)
        ;(node as Element).replaceChildren(span)
        children.push(node)
      }
    }

    // set selection range
    if (node === lineNode) {
      const parentNode = children[children.length - 1]
      for (const child of parentNode.childNodes) {
        const text = child.textContent || ''
        if (text.length >= startOffset) {
          startNode = child.childNodes[0] || child
          break
        } else {
          startOffset -= text.length
        }
      }
    }
  }

  edit.replaceChildren(...children)
  if (children.length) {
    // set selection
    const newRange = document.createRange()
    if (startNode) {
      newRange.setStart(startNode, startOffset)
    } else {
      const lastChild = children[children.length - 1]
      newRange.setStart(lastChild, lastChild.childNodes.length)
    }
    const selection = getSelection()!
    selection.removeAllRanges()
    selection.addRange(newRange)
  }
}

export const clearContent = (editor: HTMLElement) => {
  editor.replaceChildren(createDiv())
  // editor.replaceChildren()
}
