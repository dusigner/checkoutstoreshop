/**
 * @returns {string}
 */
export function getWorkspace() {
  return window?.__RUNTIME__?.workspace ?? 'master'
}
