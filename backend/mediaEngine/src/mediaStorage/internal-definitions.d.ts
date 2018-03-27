import { DatabaseConnectionWithSqlBricks } from "../../../utils/mycn-with-sqlbricks"
import { ImageVariantsConfiguration } from "./exported-definitions";

export interface MediaStorageContext {
  cn: DatabaseConnectionWithSqlBricks
  imagesConf: ImageVariantsConfiguration
}
