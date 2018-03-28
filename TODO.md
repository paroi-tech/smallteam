I used this file to record ideas and things that I think useful. I don't have Internet connection all
the time, so I can't use JIRA.

# Thomas
- Upload engine & co:
  - Implement multi-files upload
- WebSocket:
  - Synchronisation between several users
  - Accept to open only for connected users

# Thomas - v2 - Not urgent
- In the Model:
  - (optimisation) In the backend, do not fetch `stepTypes`, `flags`, `contributors` as dependencies
- Refactoring in the backend: one code for all the reordering
- Bkb: publish `test-app` as `bkb-test-app` in a distinct repository
- Rewrite EasyRouter or find a better router
  - rmChild (call from WorkspaceViewer.removeWorkspace)
- Refactoring in the frontend model?
  - Keep HKMap? (Identifier can be `string | number | string[]` ??)
  - isModified, getDiffToUpdate: should work with field type `string[]`
  - `this.project.steps` etc. => store the array? or rename to `getSteps()` or cache as `global`
  - Remove the `HKMap` for indexes => use `Map` with string keys
  - Use the following declarations:

      {
        type: "Task",
        index: {
          projectId: getFrag().id
        }
      }
      {
        type: "Step",
        filteredIndex: {
          entryCode: "orderNum<>null",
          filter: step => step.orderNum !== null
        }
      }

# Lionel
- TaskAttachmentManager => remove attached files (test only since it is not supported by model)
- Image library (sharp => https://github.com/lovell/sharp)
- Show an animated loader on the background command button when there is something started
- **ProjectForm**:
  - In the DropdownMenu button (`…`):
    - A button "Show Tasks On Hold" => Implement a new component "Tasks On Hold"
    - A button "Archived Tasks" => Implement a new component "Archived Tasks"
- For each form:
  - Disable the submit button until there are any changes
  - Add a button "Cancel/Close": "Close" if there is no change, "Cancel" as soon as there has been a change

# Not urgent
- Add roles for users
- Remove all the `console.log()`, `console.warn()` etc, use `this.dash.app.log.warn()` etc. if necessary
- Use true avatars
- Add attached files to tasks
- Use a GitHub hook to show the commits on tasks
- Use HTTPS, deploy the project on the Web server
- Internationalisation
- Multi-teams

# Lionel - DONE
- Merge `ContributorHome` into `ContributorForm`
  - Allow to upload an avatar from the `ContributorForm`
  - Allow to change the password from the `ContributorForm`
- Replace `alert` & `confirm` with a component `ModalDialog`
- Add a background task that removes expired tokens from mail_challenge table
- In webserver.ts, the `/get-file` route is declared as public. Anybody can download the files stored on the server.
- Improve forms
- Improve contributors selector in taskform. Open a dialog to select constributors and use inline BoxList.
- In TaskForm, show contributor name and creation date beside a comment.
- Listen to events (create, update, delete) in CheckboxMultiSelect in order to reorder and update items
  - Create a listener object and pass it as optional parameter to CheckboxMultiSelect.
  - The listener will listen to update events from model and update the CheckboxMultiSelect
- Dropdown menus: open them as modal (maybe with a transparent overlay instead of a `<dialog>`?)
- In `TaskForm`:
  - Show, Add, remove, reorder the contributors affected to the task
  - Show, Add, remove the flags for the task
  - Show, Add, update, remove comments
  - Add a button "Log" in the task form, and show the task log in a dialog
  - On create/update/delete contributors, update the list in `TaskForm`
  - On create/update/delete flags, update the list in `TaskForm`
- Create a component `SessionMenu`:
  - It contains a drop-down menu to append to the right of the main drop-down menu
  - Show the user's avatar on the button (do not use `…`)
  - Add a menu item: "Edit my profile" → app.navigate to "/settings/contributors/my-profile"
  - Add a menu item: "Disconnect"
- **Step form**: Allow to delete a stepType when it has no step (after user confirmation)
- In `TaskBox`:
  - Show the contributors affected to the task
  - Show the flags for the task
  - Show the field `commentCount`
- Add static workspaces:
  - Create a component `Simple404Workspace`
  - Create a component `HomeWorkspace`
- Implement a new component `BackgroundCommandManager`
- Refactoring:
  - In `ProjectForm`, create a project with a non-empty array for `stepIds`
  - Rename all Monkberry files with the component name or the CSS class or the markup name
  - Rename all SCSS files with the component name
- On task update, update the flags shown in TaskBox
- On Flag reordering, reorder checkboxes in TaskFlagSelector
- Implement flag adding/removing in TaskFlagSelector
- Create a workspace `FlagWorkspace`, to add, update, remove, reorder flags (NB: use a color picker in the form)
- Do not hide any existing StepSwitcher by default
- Contributor (form, management, backend queries)
- Refactoring in WorkspaceViewer (with Thomas)
- Refactor Menu and DropDownMenu components
- Add `disable` method to BoxList.
- On each component form:
  - Disable forms for the models during processing (see with Thomas for the events)
  - Use `itemModel.updateTools.isModified()` to check if there is something to save
  - Use `itemModel.updateTools.getDiffToUpdate()` to save only the modified data
  - Use `itemModel.updateTools.whoUse` to check if it is possible to delete
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

- Sessions in the backend
  - Implement `session/current` Auto-login when a session is already opened
  - Implement `session/recover` the password recovery
  - Implement `session/save-password`
  - Implement `session/disconnect`
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
  - Add events `processing${type}`, `endProcessing${type}`
  - On each model, add a member `tools`:
    - Implement methods `whoUse`
    - Add a member `processing: boolean` (for update, delete)
    - Add a method `toFragment(variant: "update" | "insert" | "id")`
    - Add a method `isModified(updFrag): boolean`
    - Add a method `getDiffToUpdate(updFrag): null | FragUpd`
- Replace all `model.on` by `this.dash.listenTo(model)`
- CSS: use flexbox & grid
- In the backend, keep the session and associate a contributorId (string)
  - Call logStepChange()
- Add a frontend router
  - Sub-routers provided by workspaces
- Investigate TS transformers, maybe they could generate meta: https://github.com/Microsoft/TypeScript/issues/3628#issuecomment-298236279
- Bkb:
  - bkb.children(...groups: string[])
  - dash.appendInGroup(child: object, group: string, ...groups: string[])
  - dash.isInGroup(child: object, group: string, ...groups: string[])
  - dash.isChild(obj: object)
  - dash.isComponent(obj: object)
  - remove dash.customCreate
  - listenTo() with several event names
  - dash.destroyChildren(...groups: string[])
  - dash.listenAllParents()
  - getBkbOf => getPublicDashOf
- Backend: make a database connection layer, with transactions
- Refactoring: rename `step` to `project_step` (remove the PK), and `step_type` to `step`
  - Remove the fragment of `project_step`, load the steps as an array of identifiers in `ProjectFragment`
- Publish the package `sqlite-with-transactions` on GitHub and npm
- Upload engine & co:
  - Comments TODO in stStorageContext.ts
  - Fill the AppModel with the response of the upload engine
    - [CANCELED] No "attachedMedias" or "avatarMedia" in dependency fragments
      => [CANCELED] make links on frontend using an index on externalType
    - Update dependency fragments from the server side in `stStorageContext`
      => including markAs "update"
      => remove the triggerAfter on medias
  - Make the upload storage & engine an instance with a context object: the DB connection, the URL prefix
  - Remove the dependent medias on delete tasks, contributors (backend & frontend)
  - Implement several variants for images
- In the Model:
  - Keep `global` lists up-to-date
  - [CANCELED] Remove `StepFragment.name` => call `step.stepType.name`

# Thomas or Lionel - DONE

- Connection:
  - Chromium ask for saving password => find a solution
  - Use a session token
