import { addBackendFragmentMeta } from "./backendMetaStore"
import projectMeta from "../../../../shared/meta/Project"
import taskMeta from "../../../../shared/meta/Task"
import stepMeta from "../../../../shared/meta/Step"
import taskLogEntryMeta from "../../../../shared/meta/TaskLogEntry"
import flagMeta from "../../../../shared/meta/Flag"
import commentMeta from "../../../../shared/meta/Comment"
import accountMeta from "../../../../shared/meta/Account"
import gitCommitMeta from "../../../../shared/meta/GitCommit"

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
  accountMeta.read,
  {
    id: {
      column: "account_id",
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
    accountId: {
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
  gitCommitMeta.read,
  {
    id: {
      column: "commit_id",
      columnType: "bigint"
    },
    externalId: {},
    message: {},
    authorName: {},
    ts: {
      columnType: "timestamp"
    }
  }
)