export type IAddListener = (key: string, callback: Function) => void

export type IRemoveListener = (key: string, callback: Function) => void

export type IDispatch = (key: string, context: any, value: any) => void

export interface IEventBus {
  addEventListener: IAddListener
  removeEventListener: IRemoveListener
  dispatch: IDispatch
}

import * as EventBusAny from 'eventbusjs'
const EventBus: IEventBus = EventBusAny
export { EventBus }
