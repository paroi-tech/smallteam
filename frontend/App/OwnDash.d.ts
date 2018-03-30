import { Dash, EventName, EventCallback } from "bkb";
import App from "./App"
import { UpdateModelEvent } from "../AppModel/AppModel";

export interface OwnDash extends Dash<App> {
  listenToModel<ED = UpdateModelEvent>(eventName: EventName, listener: EventCallback<ED>, thisArg?: any): this
}