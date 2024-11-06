import { InstanceOptions, IOContext, ExternalClient } from '@vtex/api'

interface PayloadDecodeProps {
  storeUserAuthToken: string
}

interface ResponseDecodeProps {
  userId: string
  user: string
  userType: string
}

export default class SessionClient extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`http://vtexid.vtex.com.br`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: ctx.authToken,
        'x-vtex-use-https': 'true',
        'Content-Type': 'application/json',
      },
    })
  }

  public async decode({ storeUserAuthToken }: PayloadDecodeProps) {
    try {
      const data = await this.http.get<ResponseDecodeProps | null>(
        `/api/vtexid/pub/authenticated/user?authToken=${storeUserAuthToken}`
      )

      return data
    } catch (error) {
      return {} as ResponseDecodeProps
    }
  }
}
