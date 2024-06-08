import { AtpAgent } from '@atproto/api'

export async function fetchDidFromHandle(handle: string) {
  const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`)
  const result = await res.json()
  return result.did
}

export async function fetchDidDoc(resolvedDid: string) {
  const res = await fetch(`https://plc.directory/${resolvedDid}`)
  return await res.json()
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
