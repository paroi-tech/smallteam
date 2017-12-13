import { addBackendFragmentMeta } from "./backendMetaStore"
import projectMeta from "../../isomorphic/meta/Project"
import taskMeta from "../../isomorphic/meta/Task"
import stepMeta from "../../isomorphic/meta/Step"
import taskLogEntryMeta from "../../isomorphic/meta/TaskLogEntry"
import flagMeta from "../../isomorphic/meta/Flag"
import commentMeta from "../../isomorphic/meta/Comment"
import contributorMeta from "../../isomorphic/meta/Contributor"
import fileInfoMeta from "../../isomorphic/meta/FileInfo"

addBackendFragmentMeta(
  projectMeta.read,
  {
    id: {
      column: "project_id",
      columnType: "bigint"
    },
    code: {},
    archived: {}
  }
)

addBackendFragmentMeta(
  contributorMeta.read,
  {
    id: {
      column: "contributor_id",
      columnType: "bigint"
    },
    name: {},
    login: {},
    email: {}
  }
)

addBackendFragmentMeta(
  taskMeta.read,
  {
    id: {
      column: "task_id",
      columnType: "bigint"
    },
    code: {},
    label: {},
    // createdById: {
    //   column: "created_by",
    //   columnType: "bigint"
    // },
    curStepId: {
      columnType: "bigint"
    },
    createTs: {
      columnType: "timestamp"
    },
    updateTs: {
      columnType: "timestamp"
    }
  }
)

addBackendFragmentMeta(
  stepMeta.read,
  {
    id: {
      column: "step_id",
      columnType: "bigint"
    },
    label: {},
    orderNum: {}
  }
)

addBackendFragmentMeta(
  taskLogEntryMeta.read,
  {
    id: {
      column: "task_log_id",
      columnType: "bigint"
    },
    taskId: {
      columnType: "bigint"
    },
    stepId: {
      columnType: "bigint"
    },
    contributorId: {
      columnType: "bigint"
    },
    entryTs: {
      columnType: "timestamp"
    }
  }
)

addBackendFragmentMeta(
  flagMeta.read,
  {
    id: {
      column: "flag_id",
      columnType: "bigint"
    },
    label: {},
    color: {}
  }
)

addBackendFragmentMeta(
  commentMeta.read,
  {
    id: {
      column: "flag_id",
      columnType: "bigint"
    },
    taskId: {
      columnType: "bigint"
    },
    // writtenById: {
    //   column: "written_by",
    //   columnType: "bigint"
    // },
    body: {},
    createTs: {
      columnType: "timestamp"
    },
    updateTs: {
      columnType: "timestamp"
    }
  }
)

addBackendFragmentMeta(
  fileInfoMeta.read,
  {
    id: {},
    name: {},
    weight: {},
    mimeType: {}
  }
)
