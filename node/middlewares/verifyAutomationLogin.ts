import { getAppSettings } from '../helpers'
import { statusCode } from '../utils/statusCode'

export async function verifyAutomationLogin(ctx: Context) {
  const { email } = ctx.query

  const appConfig = await getAppSettings(ctx.vtex)

  if (!appConfig?.automationEmails?.includes(email)) {
    ctx.status = 400
    ctx.response.body = {
      isValid: false,
      statusCode: statusCode.STORE_CHECKOUT_INVALID_AUTOMATION_LOGIN,
    }

    return
  }

  ctx.status = 200
  ctx.response.body = {
    isValid: true,
  }
}
