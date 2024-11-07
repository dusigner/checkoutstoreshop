import { IOClients } from '@vtex/api'

import { SaveVB } from './server-settings'
import SessionClient from './sessionClient'
// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get server() {
    return this.getOrSet('server', SaveVB)
  }

  public get getSession() {
    return this.getOrSet('SessionClient', SessionClient)
  }
}
