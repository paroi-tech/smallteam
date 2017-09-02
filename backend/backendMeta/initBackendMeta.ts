import { addBackendFragmentMeta } from "./backendMetaStore"
import { projectMeta } from "../../isomorphic/fragments/Project"
import { taskMeta } from "../../isomorphic/fragments/Task"
import { stepMeta } from "../../isomorphic/fragments/Step"
import { stepTypeMeta } from "../../isomorphic/fragments/StepType"
import { taskLogEntryMeta } from "../../isomorphic/fragments/TaskLogEntry";
import { flagMeta } from "../../isomorphic/fragments/Flag";
import { commentMeta } from "../../isomorphic/fragments/Comment";

addBackendFragmentMeta(
  projectMeta,
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
  taskMeta,
  {
    id: {
      column: "task_id",
      columnType: "bigint"
    },
    code: {},
    label: {},
    createdById: {
      column: "created_by",
      columnType: "bigint"
    },
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
  stepMeta,
  {
    id: {
      column: "step_id",
      columnType: "bigint"
    },
    typeId: {
      column: "step_type_id",
      columnType: "bigint"
    },
    projectId: {
      columnType: "bigint"
    }
  }
)

addBackendFragmentMeta(
  stepTypeMeta,
  {
    id: {
      column: "step_type_id",
      columnType: "bigint"
    },
    name: {},
    orderNum: {}
  }
)

addBackendFragmentMeta(
  taskLogEntryMeta,
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
  flagMeta,
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
  commentMeta,
  {
    id: {
      column: "flag_id",
      columnType: "bigint"
    },
    taskId: {
      columnType: "bigint"
    },
    writtenById: {
      columnType: "bigint"
    },
    body: {},
    createTs: {
      columnType: "timestamp"
    },
    updateTs: {
      columnType: "timestamp"
    }
  }
)