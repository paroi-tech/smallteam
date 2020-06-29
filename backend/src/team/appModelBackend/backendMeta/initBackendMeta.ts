import accountMeta from "@smallteam/shared/meta/Account"
import commentMeta from "@smallteam/shared/meta/Comment"
import flagMeta from "@smallteam/shared/meta/Flag"
import gitCommitMeta from "@smallteam/shared/meta/GitCommit"
import projectMeta from "@smallteam/shared/meta/Project"
import stepMeta from "@smallteam/shared/meta/Step"
import taskMeta from "@smallteam/shared/meta/Task"
import taskLogEntryMeta from "@smallteam/shared/meta/TaskLogEntry"
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