interface CollectionSelectorProps {
  collections: string[]
  recordType: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  fetchRepoData: () => void
}

export default function CollectionSelector({
  collections,
  recordType,
  onChange,
  fetchRepoData,
}: CollectionSelectorProps) {
  return (
    <div>
      <div className="relative mb-4">
        <select
          value={recordType}
          onChange={onChange}
          className="w-full p-3 pr-10 border border-gray-600 rounded bg-gray-700 text-gray-100 appearance-none focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="" disabled>
            Select collection
          </option>
          {collections.map(collection => (
            <option key={collection} value={collection}>
              {collection}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            >
            </path>
          </svg>
        </div>
      </div>
      <button
        onClick={fetchRepoData}
        className={`w-full p-3 rounded ${recordType ? 'bg-green-600 text-white hover:bg-green-700 transition' : 'bg-gray-300 text-gray-700 cursor-not-allowed'}`}
        disabled={!recordType}
        type="button"
      >
        Fetch Collection Data
      </button>
    </div>
  )
}
