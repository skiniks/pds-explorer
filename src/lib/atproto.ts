import type { RepoDataResponse } from '@/types'
import { AtpAgent } from '@atproto/api'

const proxyApiRoute = '/api/proxy?url='

export async function fetchDidFromWebHandle(handle: string): Promise<string> {
  try {
    const url = `https://${handle}/.well-known/did.json`
    const proxyUrl = `${proxyApiRoute}${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl)
    if (res.ok) {
      const didDoc = await res.json()
      if (didDoc.id.startsWith('did:web:')) {
        return didDoc.id
      }
      else {
        throw new Error('Not a did:web handle')
      }
    }
    else {
      throw new Error('Failed to fetch did.json')
    }
  }
  catch (error) {
    throw new Error(`Failed to resolve did:web handle: ${(error as Error).message}`)
  }
}

export async function fetchDidFromHandle(handle: string): Promise<string> {
  try {
    return await fetchDidFromWebHandle(handle)
  }
  catch {
    const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`)
    if (!res.ok) {
      throw new Error('Failed to resolve handle to DID')
    }
    const result = await res.json()
    return result.did
  }
}

export async function fetchDidDoc(resolvedDid: string): Promise<any> {
  try {
    if (resolvedDid.startsWith('did:plc:')) {
      const res = await fetch(`https://plc.directory/${resolvedDid}`)
      if (!res.ok) {
        throw new Error('Failed to fetch PLC DID document')
      }
      return await res.json()
    }
    else if (resolvedDid.startsWith('did:web:')) {
      const domain = resolvedDid.substring(8)
      const url = `https://${domain}/.well-known/did.json`
      const proxyUrl = `${proxyApiRoute}${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl)
      if (!res.ok) {
        throw new Error('Failed to fetch did:web DID document')
      }
      return await res.json()
    }
    else {
      throw new Error('Unsupported DID method')
    }
  }
  catch (error) {
    throw new Error(`Failed to fetch DID document: ${(error as Error).message}`)
  }
}

export async function fetchCollections(repo: string, serviceEndpoint: string): Promise<string[]> {
  const agent = new AtpAgent({ service: serviceEndpoint })
  const res = await agent.com.atproto.repo.describeRepo({ repo })
  return res.data.collections
}

export async function fetchCollectionData(repo: string, recordType: string, cursor: string | undefined, serviceEndpoint: string): Promise<RepoDataResponse> {
  const agent = new AtpAgent({ service: serviceEndpoint })
  const res = await agent.com.atproto.repo.listRecords({ repo, collection: recordType, cursor })

  if (!res.data || !res.data.records) {
    throw new Error('No records found in the response')
  }

  return res
}
