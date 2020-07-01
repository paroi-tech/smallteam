import accountMeta from "@smallteam/shared/dist/meta/Account"
import commentMeta from "@smallteam/shared/dist/meta/Comment"
import flagMeta from "@smallteam/shared/dist/meta/Flag"
import gitCommitMeta from "@smallteam/shared/dist/meta/GitCommit"
import projectMeta from "@smallteam/shared/dist/meta/Project"
import stepMeta from "@smallteam/shared/dist/meta/Step"
import taskMeta from "@smallteam/shared/dist/meta/Task"
import taskLogEntryMeta from "@smallteam/shared/dist/meta/TaskLogEntry"
import { addBackendFragmentMeta } from "./backendMetaStore"

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