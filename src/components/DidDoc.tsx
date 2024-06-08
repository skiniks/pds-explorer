import CodeHighlighter from './CodeHighlighter'
import type { DidDocResponse } from '@/types'

interface DidDocProps {
  data: DidDocResponse
  show: boolean
  onToggle: () => void
}

export default function DidDoc({ data, show, onToggle }: DidDocProps) {
  return (
    <div className="w-full max-w-4xl mt-5">
      <button onClick={onToggle} type="button" className="w-full bg-gray-600 text-white p-3 rounded mb-4 hover:bg-gray-700 transition">
        {show ? 'Hide' : 'Show'}
        {' '}
        DID Doc
      </button>
      {show && (
        <div className="bg-gray-800 shadow-md rounded-lg p-5">
          <h1 className="text-xl font-mono font-semibold mb-2 text-gray-100">DID Doc</h1>
          <CodeHighlighter language="json" data={data} />
        </div>
      )}
    </div>
  )
}
