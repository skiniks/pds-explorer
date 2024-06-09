export interface Service {
  type: string
  serviceEndpoint: string
}

export interface DidDocResponse {
  service: Service[]
}

export interface RepoDataResponse {
  data: {
    records: object[]
    cursor?: string
  }
  error?: string
}
