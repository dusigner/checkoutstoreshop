// @ts-check

/**
 * @typedef {{ message: string }} VTEXMessage
 */

/**
 * @typedef {{ message?: string; path?: (string|number)[] }} GraphQLErrorItem
 */

/**
 * @template TData
 * @template TVariables
 * @typedef {{ data?: TData, errors?: GraphQLErrorItem[], extensions?: unknown }} GraphQLResponse
 */

export class GraphQLRequestError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, errors?: GraphQLErrorItem[] }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "GraphQLRequestError";
    this.status = meta.status;
    this.errors = meta.errors;
  }
}

