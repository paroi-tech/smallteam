import { StepFragment } from "../../isomorphic/fragments/Step"
import { TaskFragment } from "../../isomorphic/fragments/Task"
import { ProjectFragment } from "../../isomorphic/fragments/Project"

export function querySteps(project: ProjectFragment): Promise<StepFragment[]> {
  let steps: Array<StepFragment> = [
    {
      id: "122",
      name: "Not started",
      typeId: "1",
      projectId: project.id
    },
    {
      id: "123",
      name: "Running",
      typeId: "3",
      projectId: project.id
    },
    {
      id: "124",
      name: "Finished",
      typeId: "2",
      projectId: project.id
    },
  ]
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(steps)
    }, 1500)
  })
}

export function queryTasks(project: ProjectFragment): Promise<TaskFragment[]> {
  let tasks: Array<TaskFragment> = [
    {
      id: "1",
      code: "TASK-1",
      label: "First task",
      createdById: "Kitihounel",
      curStepId: "124",
      createTs: 12548965412,
      updateTs: 12548965630
    },
    {
      id: "2",
      code: "TASK-2",
      label: "Second task",
      createdById: "Kitihounel",
      curStepId: "123",
      createTs: 12548965452,
      updateTs: 12548965452
    },
    {
      id: "3",
      code: "TASK-3",
      label: "Another task",
      createdById: "Paleo",
      curStepId: "122",
      createTs: 12548965500,
      updateTs: 12548965500
    },
    {
      id: "4",
      code: "TASK-4",
      label: "Hard task",
      createdById: "Kitihounel",
      curStepId: "122",
      createTs: 12548965600,
      updateTs: 12548965600
    }
  ]
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tasks)
    }, 1500)
  })
}