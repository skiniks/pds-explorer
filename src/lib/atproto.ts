import { AtpAgent } from '@atproto/api'

export async function fetchDidFromWebHandle(handle: string) {
  try {
    const res = await fetch(`https://${handle}/.well-known/did.json`)
    const didDoc = await res.json()
    if (didDoc.id.startsWith('did:web:')) {
      return didDoc.id
    }
    else {
      throw new Error('Not a did:web handle')
    }
  }
  catch (error) {
    throw new Error('Failed to resolve did:web handle')
  }
}

export async function fetchDidFromHandle(handle: string) {
  try {
    return await fetchDidFromWebHandle(handle)
  }
  catch (error) {
    const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`)
    const result = await res.json()
    return result.did
  }
}

export async function fetchDidDoc(resolvedDid: string) {
  if (resolvedDid.startsWith('did:plc:')) {
    const res = await fetch(`https://plc.directory/${resolvedDid}`)
    return await res.json()
  }
  else if (resolvedDid.startsWith('did:web:')) {
    const domain = resolvedDid.substring(8)
    const res = await fetch(`https://${domain}/.well-known/did.json`)
    return await res.json()
  }
  else {
    throw new Error('Unsupported DID method')
  }
}

export async function fetchCollections(repo: string, serviceEndpoint: string) {
  const agent = new AtpAgent({ service: serviceEndpoint })
  const res = await agent.com.atproto.repo.describeRepo({ repo })
  return res.data.collections
}

export async function fetchCollectionData(repo: string, recordType: string, cursor: string | undefined, serviceEndpoint: string) {
  const agent = new AtpAgent({ service: serviceEndpoint })
  const res = await agent.com.atproto.repo.listRecords({ repo, collection: recordType, cursor })
  return res
}
