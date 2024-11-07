import { AuthenticationError } from '@vtex/api'

import { checkOrigin } from '../../utils/checkOrigin'

export async function securityMiddleware(
  ctx: Context,
  next: () => Promise<void>
): Promise<void> {
  const checkSameOrigin = checkOrigin({
    headerOrigin: ctx.request.headers['sec-fetch-site'] as string,
  })

  if (!checkSameOrigin) {
    throw new AuthenticationError('Smallest page value is 1')
  }

  await next()
}
