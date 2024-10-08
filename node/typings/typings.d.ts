import type { RecorderState, ServiceContext } from '@vtex/api'
import type { Clients } from '../clients'

declare global {
  type Context = ServiceContext<Clients, State>

  interface State extends RecorderState {
    userData: User
  }

  interface User {
    email: string
    id: string
  }
}
