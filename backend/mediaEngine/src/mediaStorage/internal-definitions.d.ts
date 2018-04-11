import { DatabaseConnectionWithSqlBricks } from "mycn-with-sql-bricks"
import { ImageVariantsConfiguration } from "./exported-definitions";

export interface MediaStorageContext {
  cn: DatabaseConnectionWithSqlBricks
  imagesConf: ImageVariantsConfiguration
}
