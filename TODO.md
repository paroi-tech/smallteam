I used this file to record ideas and things that I think useful. I don't have Internet connection all
the time, so I can't use JIRA.

# Thomas

- In the backend, keep the session and associate a contributorId (string)
  - Call logStepChange()
    - Lionel: Add a button "Log" in the task form
- In the Model:
  - Implement methods whoUse
  - Add a boolean "processing" on each model
    - Lionel: disable forms for the models in processing
  - Remove StepFragment.name => call step.stepType.name
  - (optimisation) In the backend, do not fetch `stepTypes`, `flags`, `contributors` as dependencies
- Investigate TS transformers for updating meta: https://github.com/Microsoft/TypeScript/issues/3628#issuecomment-298236279
- Deploy the project on the Web server
- Keep HKMap?
- Refactoring in the backend, one code for all the reordering

# Lionel
- Implement a new component `BackgroundCommandManager`
- In `TaskForm`:
  - Show, Add, remove, reorder the contributors affected to the task
  - Show, Add, remove the flags for the task (Use BoxList)
  - Show, Add, update, remove comments
- In `TaskBox`:
  - Show the contributors affected to the task
  - Show the flags for the task
  - Show the field `commentCount`
- **ProjectForm**:
  - In the DropdownMenu button (`…`):
    - A button "Show Tasks On Hold" => Implement a new component "Tasks On Hold"
    - A button "Archived Tasks" => Implement a new component "Archived Tasks"
- **Step type form**: Allow to delete a stepType when it has no step (after user confirmation)
- For each form:
  - Disable the submit button until there are any changes
  - Add a button "Cancel/Close": "Close" if there is no change, "Cancel" as soon as there has been a change

# Thomas or Lionel

- Connection:
  - Chromium ask for saving password => find a solution
  - Use a session token

# Lionel - DONE
- On task update, update the flags shown in TaskBox
- On Flag reordering, reorder checkboxes in TaskFlagSelector
- Implement flag adding/removing in TaskFlagSelector
- Create a workspace `FlagWorkspace`, to add, update, remove, reorder flags (NB: use a color picker in the form)
- Do not hide any existing StepSwitcher by default
- Contributor (form, management, backend queries)
- Refactoring in WorkspaceViewer (with Thomas)
- Refactor Menu and DropDownMenu components
- Add `disable` method to BoxList.
- **BoxList**: On reordering, add a flag in the BoxList to signal the current reordering process
- **Task panel**:
  - Allow to delete a task that doesn't have child (after user confirmation)
  - For tasks without child: add a button "Show/Hide as parent"
- **ProjectForm**:
  - Do not use the title to open the form, add a DropdownMenu button (`…`) near the title with following items:
    - An button "Edit Form" for opening the form
  - Allow to delete a project when it contains no tasks (except the root task) (after user confirmation)
- **StepsPanel**: Add a button near the title for slide up and slide down the content (*)
- For each form:
  - Add a flag "loading" on each button "Submit" (*)
- Reusable forms:
  - `ProjectForm.setProject(project: ProjectModel | null)`
    - In `ProjectForm/ProjectStepsPanel/ProjectStepsPanel.ts`, implement the method `clear` and make the instance reusable
  - `StepTypeForm.setProject(stepType: StepTypeModel | null)`
  - `TaskForm.setTask(task: TaskModel)`

# Thomas - DONE

- In the Model:
  - `Model` becomes `GlobalModel`, it contains `stepTypes` and `projects` that are loaded on init
  - Load data on init: `stepTypes`, `flags`, `contributors`
  - ModelEngine: add a method `get(id)` on the list returned by `getModels`
  - When `StepTypes` are reordered, the new order of the StepTypes should be reflected in ProjectModel.
  - Model have to emit event when task orders are changed.
  - Add a list of background commands
  - Implement TaskModel.affectedTo (list)
  - Implement TaskModel.flags (list)
  - Implement async TaskModel.getComments()
  - In `TaskFragment`, add a field `commentCount`
  - Implement async TaskModel.logEntries()
- Replace all `model.on` by `this.dash.listenTo(model)`
- CSS: use flexbox & grid
