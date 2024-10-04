import { AuthenticationError } from '@vtex/api'

interface AuthChangeProps {
  storeUserAuthToken: string | undefined
  authUser: string | undefined
}

function authChange({ storeUserAuthToken, authUser }: AuthChangeProps) {
  if (storeUserAuthToken !== undefined) {
    return {
      changeAuth: storeUserAuthToken,
    }
  }

  if (authUser) {
    return {
      changeAuth: authUser,
    }
  }

  return {
    changeAuth: undefined,
  }
}

export async function verifyUser(ctx: Context, next: () => Promise<void>) {
  const {
    vtex: { storeUserAuthToken },
    clients: { getSession },
  } = ctx

  const vtexSession = ctx.request.header['vtex-session'] as string

  const { changeAuth: auth } = authChange({
    authUser: vtexSession,
    storeUserAuthToken,
  })

  if (auth !== undefined) {
    const data = await getSession.decode({
      storeUserAuthToken: auth as string,
    })

    if (data !== null) {
      ctx.state.body = {
        user: data.user,
        userId: data.userId,
      }

      return next()
    }

    return new AuthenticationError('Required referesh login credentials')
  }

  return new AuthenticationError('User not logged')
}
