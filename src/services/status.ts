import { injectable } from 'inversify'

export enum StatusState {
  Running = 'RUNNING'
}
export interface GetStatus { state: StatusState }

@injectable()
export default class StatusService {
  public getStatus (): GetStatus {
    return {
      state: StatusState.Running
    }
  }
}
