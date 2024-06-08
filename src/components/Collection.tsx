import CodeHighlighter from './CodeHighlighter'

interface CollectionProps {
  collectionData: object[]
  cursor: string | undefined
  fetching: boolean
  loadMore: () => void
}

export default function Collection({ collectionData, cursor, fetching, loadMore }: CollectionProps) {
  return (
    <div className="mt-5">
      <h2 className="text-2xl font-mono font-semibold mb-2">Collection Data</h2>
      <CodeHighlighter language="json" data={collectionData} />
      {cursor && cursor !== 'self' && (
        <button onClick={loadMore} type="button" className="w-full mt-4 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition" disabled={fetching}>
          {fetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
