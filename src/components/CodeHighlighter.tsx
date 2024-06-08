import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'

SyntaxHighlighter.registerLanguage('json', json)

interface CodeHighlighterProps {
  language: string
  data: object | string
  style?: any
}

export default function CodeHighlighter({ language, data, style = dracula }: CodeHighlighterProps) {
  return (
    <SyntaxHighlighter language={language} style={style}>
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </SyntaxHighlighter>
  )
}
