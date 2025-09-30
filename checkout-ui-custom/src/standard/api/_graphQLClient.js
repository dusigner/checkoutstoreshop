// @ts-check

import { rootPath } from "../components/utils/_rootPath";
import { getWorkspace } from "../components/utils/_workspace";
import { GraphQLRequestError } from "../errors/_graphQLRequestError";

export class GraphQLClient {
  #endpoint;
  #baseHeaders;
  #credentials;

  /**
   * @returns {string}
   */
  #buildEndpoint() {
    const url = new URL(`${rootPath()}/_v/public/graphql/v1`, window.location.origin);
    url.searchParams.set("workspace", getWorkspace());
    url.searchParams.set("maxAge", "long");
    url.searchParams.set("appsEtag", "remove");
    url.searchParams.set("domain", "store");
    url.searchParams.set("locale", "pt-BR");
    return url.toString();
  }

  /**
   * @param {{ headers?: Record<string,string>, credentials?: RequestCredentials }} [init]
   */
  constructor(init = {}) {
    this.#endpoint = this.#buildEndpoint();
    this.#baseHeaders = {
      "content-type": "application/json",
      accept: "application/json",
      ...(init.headers || {}),
    };
    // Em store domain normalmente não precisa de cookies; ainda assim deixo configurável
    this.#credentials = init.credentials ?? "same-origin";
  }

  /**
   * Faz uma requisição GraphQL.
   * @template TData
   * @template TVars extends Record<string, any>=Record<string, any>
   * @param {string} query
   * @param {TVars} [variables]
   * @param {{ operationName?: string } & RequestInit} [options]
   * @returns {Promise<TData>}
   */
  async request(query, variables, options = {}) {
    const { operationName, headers, ...rest } = options;
    const res = await fetch(this.#endpoint, {
      method: "POST",
      credentials: this.#credentials,
      headers: { ...this.#baseHeaders, ...(headers || {}) },
      body: JSON.stringify({ query, variables, operationName }),
      ...rest,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GraphQLRequestError(
        `HTTP ${res.status} – ${res.statusText}\n${text}`.trim(),
        { status: res.status }
      );
    }

    /** @type {import("../errors/_graphQLRequestError").GraphQLResponse<TData, TVars>} */
    const json = await res.json();

    if (json.errors?.length) {
      const msg = json.errors.map(e => e.message).filter(Boolean).join(" | ") || "Unknown GraphQL error";
      throw new GraphQLRequestError(msg, { status: res.status, errors: json.errors });
    }

    return /** @type {TData} */ (json.data);
  }
}