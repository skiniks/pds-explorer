'use client'

import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { FaGithub } from 'react-icons/fa'
import InputField from '@/components/InputField'
import FetchButton from '@/components/FetchButton'
import DidDoc from '@/components/DidDoc'
import Collection from '@/components/Collection'
import CollectionSelector from '@/components/CollectionSelector'
import { fetchCollectionData, fetchCollections, fetchDidDoc, fetchDidFromHandle } from '@/lib/atproto'
import type { DidDocResponse, RepoDataResponse, Service } from '@/types'

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
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
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
      if (error instanceof Error) {
        setError(error.message)
        console.error('Error resolving identifier to DID:', error)
      }
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
      if (error instanceof Error) {
        setError(error.message)
        console.error('Error fetching collections:', error)
      }
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
      if (error instanceof Error) {
        setError(error.message)
        console.error('Error fetching repo data:', error)
      }
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
          <FaGithub size={32} />
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
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}

export default Home
