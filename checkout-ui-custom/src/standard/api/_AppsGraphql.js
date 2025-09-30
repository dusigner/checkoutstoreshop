// @ts-check
import { GraphQLClient } from "./_graphQLClient"

const QUERY_PUBLIC_SETTINGS = /* GraphQL */ `
  query PublicSettings($app: String!, $version: String!) {
    publicSettingsForApp(app: $app, version: $version)
    @context(provider: "vtex.apps-graphql") {
    message
    }
  }
`;

/**
 * @typedef {{ message: string }} VTEXMessage
 * @typedef {{ app: string, version: string }} VTEXAppVars 
 * @typedef {{ publicSettingsForApp: VTEXMessage }} PublicSettingsData 
 */

export class AppsGraphql {
  #graphQLClient

  constructor(_GraphQLClient = GraphQLClient) {
  this.#graphQLClient = new _GraphQLClient()
  }

  /**
   * @template {unknown} T
   * @param {VTEXAppVars} vars
   * @returns {Promise<T>}
   */
  async publicSettingsForApp({ app, version }) {
  /** @type {PublicSettingsData} */
  const publicData = await this.#graphQLClient.request(QUERY_PUBLIC_SETTINGS, { app, version }, { operationName: "PublicSettings" });
  return this.#parseSettings(publicData.publicSettingsForApp.message);
  }

  /**
   * Parses a JSON string message into a JavaScript object.
   * @template {unknown} T
   * @param {string} message - The JSON string to be parsed
   * @returns {T} 
   * @throws {Error} Throws an error with a descriptive message if parsing fails
   */
  #parseSettings(message) {
  try {
    return JSON.parse(message)
  } catch (_) {
    throw new Error(`AppsGraphql.parseSettings: failed to parse settings message: ${message}`)
  }
  }
}