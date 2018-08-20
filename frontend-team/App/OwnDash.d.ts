import { Dash, EventName, EventCallback } from "bkb";
import App from "./App"
import { UpdateModelEvent, ReorderModelEvent, TaskModel, FlagModel } from "../AppModel/AppModel";

export interface OwnDash extends Dash<App> {
  listenToModel(eventName: "reorder", listener: EventCallback<ReorderModelEvent>, thisArg?: any): this
  listenToModel(eventName: "reorderFlag", listener: EventCallback<ReorderModelEvent>, thisArg?: any): this
  listenToModel(eventName: "reorderStep", listener: EventCallback<ReorderModelEvent>, thisArg?: any): this
  listenToModel(eventName: "reorderTask", listener: EventCallback<ReorderModelEvent>, thisArg?: any): this
  listenToModel(eventName: "reorderAccount", listener: EventCallback<ReorderModelEvent>, thisArg?: any): this

  listenToModel(eventName: "changeTask", listener: EventCallback<UpdateModelEvent<TaskModel>>, thisArg?: any): this
  listenToModel(eventName: "updateTask", listener: EventCallback<UpdateModelEvent<TaskModel>>, thisArg?: any): this
  listenToModel(eventName: "deleteTask", listener: EventCallback<UpdateModelEvent<undefined>>, thisArg?: any): this

  listenToModel(eventName: "changeFlag", listener: EventCallback<UpdateModelEvent<FlagModel>>, thisArg?: any): this
  listenToModel(eventName: "updateFlag", listener: EventCallback<UpdateModelEvent<FlagModel>>, thisArg?: any): this
  listenToModel(eventName: "deleteFlag", listener: EventCallback<UpdateModelEvent<undefined>>, thisArg?: any): this

  listenToModel<ED = UpdateModelEvent>(eventName: EventName, listener: EventCallback<ED>, thisArg?: any): this
}