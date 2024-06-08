'use client'

import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import InputField from '@/components/InputField'
import FetchButton from '@/components/FetchButton'
import DidDoc from '@/components/DidDoc'
import Collection from '@/components/Collection'
import CollectionSelector from '@/components/CollectionSelector'
import { fetchCollectionData, fetchCollections, fetchDidDoc, fetchDidFromHandle } from '@/lib/atproto'
import type { DidDocResponse, RepoDataResponse, Service } from '@/types'

function GitHubIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.241c-3.338.726-4.033-1.609-4.033-1.609-.546-1.387-1.333-1.757-1.333-1.757-1.089-.746.083-.73.083-.73 1.204.085 1.838 1.238 1.838 1.238 1.07 1.835 2.807 1.306 3.492.998.108-.775.418-1.306.76-1.606-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.467-2.381 1.235-3.221-.123-.303-.535-1.523.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.003.404 2.292-1.552 3.299-1.23 3.299-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.625-5.48 5.922.43.372.814 1.102.814 2.222v3.293c0 .319.192.694.8.576C20.565 21.796 24 17.299 24 12 24 5.373 18.627 0 12 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function Home() {
  const [identifier, setIdentifier] = useState<string>('')
  const [data, setData] = useState<DidDocResponse | null>(null)
  const [repo, setRepo] = useState<string>('')
  const [recordType, setRecordType] = useState<string>('')
  const [repoData, setRepoData] = useState<object[]>([])
  const [collections, setCollections] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showDidDoc, setShowDidDoc] = useState<boolean>(true)
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [fetching, setFetching] = useState<boolean>(false)

  const resetState = () => {
    setIdentifier('')
    setData(null)
    setRepo('')
    setRecordType('')
    setRepoData([])
    setCollections([])
    setCursor(undefined)
    setFetching(false)
    setLoading(false)
    setShowDidDoc(true)
  }

  const resolveIdentifier = async () => {
    resetState()
    setLoading(true)
    try {
      const resolvedDid = identifier.startsWith('did:') ? identifier : await fetchDidFromHandle(identifier)
      if (resolvedDid) {
        setRepo(resolvedDid)
        const didDoc = await fetchDidDoc(resolvedDid)
        setData(didDoc)
      }
      else {
        console.error('Failed to resolve handle to DID')
      }
    }
    catch (error) {
      console.error('Error resolving identifier to DID:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const getServiceEndpoint = () => data?.service.find((service: Service) => service.type === 'AtprotoPersonalDataServer')?.serviceEndpoint

  const handleFetchCollections = async () => {
    try {
      const serviceEndpoint = getServiceEndpoint()
      if (serviceEndpoint) {
        const collections = await fetchCollections(repo, serviceEndpoint)
        setCollections(collections)
      }
    }
    catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const handleFetchRepoData = async (append = false) => {
    try {
      setFetching(true)
      const serviceEndpoint = getServiceEndpoint()
      if (serviceEndpoint) {
        const res: RepoDataResponse = await fetchCollectionData(repo, recordType, cursor, serviceEndpoint)

        setRepoData(prevData => (append ? [...prevData, ...res.data.records] : res.data.records))

        if (!res.data.cursor) {
          setCursor(undefined)
        }
        else {
          setCursor(res.data.cursor)
        }
      }
    }
    catch (error) {
      console.error('Error fetching repo data:', error)
    }
    finally {
      setFetching(false)
    }
  }

  const loadMore = () => {
    if (cursor)
      handleFetchRepoData(true)
  }

  const handleRecordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRecordType(e.target.value)
    setCursor(undefined)
    setRepoData([])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-10 flex flex-col items-center">
      <Analytics />
      <div className="w-full flex justify-end mb-4">
        <a href="https://github.com/skiniks/pds-explorer" target="_blank" rel="noopener noreferrer" className="text-gray-100 hover:text-gray-300 transition">
          <GitHubIcon />
        </a>
      </div>
      <h1 className="text-3xl sm:text-4xl font-mono font-bold mb-6 sm:mb-8">PDS Explorer</h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6 sm:p-8 w-full max-w-4xl space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <InputField value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Enter DID or handle" />
            <FetchButton onClick={resolveIdentifier} disabled={!identifier} text="Fetch DID Doc" />
          </div>
          {data && (
            <div>
              <InputField value={repo} onChange={e => setRepo(e.target.value)} placeholder="Enter repository name (DID)" />
              <FetchButton onClick={handleFetchCollections} disabled={!repo} text="Fetch Collections" />
            </div>
          )}
        </div>
        {collections.length > 0 && <CollectionSelector collections={collections} recordType={recordType} onChange={handleRecordTypeChange} fetchRepoData={handleFetchRepoData} />}
        {loading && <p className="text-gray-300 text-center">Loading...</p>}
        <div className="mt-4 sm:mt-6">
          <button onClick={resetState} className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition" type="button">
            Reset
          </button>
        </div>
        {repoData.length > 0 && <Collection collectionData={repoData} cursor={cursor} fetching={fetching} loadMore={loadMore} />}
      </div>
      {data && <DidDoc data={data} show={showDidDoc} onToggle={() => setShowDidDoc(!showDidDoc)} />}
    </div>
  )
}

export default Home
