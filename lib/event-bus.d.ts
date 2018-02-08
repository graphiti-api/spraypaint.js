export interface IAddListener {
    (key: string, callback: Function): void;
}
export interface IRemoveListener {
    (key: string, callback: Function): void;
}
export interface IDispatch {
    (key: string, context: any, value: any): void;
}
export interface IEventBus {
    addEventListener: IAddListener;
    removeEventListener: IRemoveListener;
    dispatch: IDispatch;
}
declare const EventBus: IEventBus;
export { EventBus };
