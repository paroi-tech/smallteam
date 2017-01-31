import { addBackendFragmentMeta } from "./backendMetaStore"
import { projectMeta } from "../../isomorphic/fragments/Project"
import { taskMeta } from "../../isomorphic/fragments/Task"
import { stepMeta } from "../../isomorphic/fragments/Step"

addBackendFragmentMeta(
  projectMeta,
  {
    id: {
      column: "project_id"
    },
    code: {}
  }
)

addBackendFragmentMeta(
  taskMeta,
  {
    id: {
      column: "task_id"
    },
    code: {},
    createdById: {
      column: "created_by"
    },
    affectedToId: {
      column: "affected_to"
    },
    curStepId: {},
    createTs: {
      columnType: "timestamp"
    },
    updateTs: {
      columnType: "timestamp"
    }
  }
)

addBackendFragmentMeta(
  stepMeta,
  {
    id: {
      column: "step_id"
    },
    typeId: {},
    projectId: {}
  }
)