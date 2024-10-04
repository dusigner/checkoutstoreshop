import { UserInputError } from '@vtex/api'
import jwt from 'jsonwebtoken'

async function verifyCookie(ctx: Context, next: () => Promise<void>) {
  const {
    params: { docId },
  } = ctx.vtex.route

  const orderParam = ctx.request.header.userauthtoken

  let compareRequest = null

  if (docId !== undefined) {
    compareRequest = docId
  } else if (orderParam !== undefined) {
    compareRequest = orderParam
    const decodedEmail = Buffer.from(orderParam as string, 'base64').toString()

    compareRequest = decodedEmail
  }

  const sessionToken = ctx.vtex.storeUserAuthToken

  if (!ctx.request.header?.cookie) {
    throw new UserInputError('Header is required')
  }

  const cookieSession = ctx.request.header.cookie?.split('; ')

  const vtexSession = cookieSession
    ?.find((element: any) => element.indexOf('vtex_session') !== -1)
    ?.split('=')[1]

  if (!vtexSession) {
    throw new UserInputError('cookie is required')
  }

  try {
    const vtexSessionDecoded: any = jwt.decode(vtexSession as string)
    const sessionTokenDecoded: any = jwt.decode(sessionToken as string)

    if (sessionTokenDecoded.sub !== compareRequest) {
      ctx.response.status = 400

      return (ctx.response.body = `Server error`)
    }

    if (!vtexSessionDecoded.id) {
      throw new UserInputError('session is not defined')
    }

    return await next()
  } catch (error) {
    console.error(error)
  }
}

export { verifyCookie }
