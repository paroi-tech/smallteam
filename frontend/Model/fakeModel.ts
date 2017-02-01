import { StepFragment } from "../../isomorphic/fragments/Step"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { ProjectFragment } from "../../isomorphic/fragments/Project"

export function querySteps(project: ProjectFragment): Array<StepFragment> {
  let steps: Array<StepFragment> = [
    {
      id: `${project.id}-1`,
      name: "Not started",
      typeId: "1",
      projectId: project.id
    },
    {
      id: `${project.id}-2`,
      name: "Running",
      typeId: "2",
      projectId: project.id
    },
    {
      id: `${project.id}-3`,
      name: "Finished",
      typeId: "3",
      projectId: project.id
    },
  ]

  return steps;
}

export function queryTasks(project: ProjectFragment): Array<TaskFragment> {
  let tasks: Array<TaskFragment> = [
    {
      id: `${project.id}-11`,
      code: "TASK-1",
      label: "First task",
      createdById: "Kitihounel",
      curStepId: `${project.id}-3`,
      createTs: 12548965412,
      updateTs: 12548965630
    },
    {
      id: `${project.id}-12`,
      code: "TASK-2",
      label: "Second task",
      createdById: "Kitihounel",
      curStepId: `${project.id}-2`,
      createTs: 12548965452,
      updateTs: 12548965452
    },
    {
      id: `${project.id}-13`,
      code: "TASK-3",
      label: "Another task",
      createdById: "Paleo",
      curStepId: `${project.id}-1`,
      createTs: 12548965500,
      updateTs: 12548965500
    },
    {
      id: `${project.id}-14`,
      code: "TASK-4",
      label: "Hard task",
      createdById: "Kitihounel",
      curStepId: `${project.id}-1`,
      createTs: 12548965600,
      updateTs: 12548965600
    }
  ]

  return tasks
}