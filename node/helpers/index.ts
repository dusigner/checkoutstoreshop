import { Apps } from '@vtex/api'

export async function getAppSettings(vtex: Context['vtex']) {
  const apps = new Apps(vtex)

  const data = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  return data
}
