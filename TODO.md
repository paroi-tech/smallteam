# About this file
I used this file to record ideas and things that I think useful. I don't have Internet connection all
the time, so I can't use JIRA.

# Thomas
- When StepTypes are reordered, the new order of the StepTypes should be reflected in ProjectModel.
- When a step is deleted, provide its id and typeId
- Model have to emit event when task orders are changed.
- CSS: use flexbox & grid
- Load data on init: `stepTypes`, etc.
- ModelEngine: add a method `get(id)` and a method `where(filter)` on the list returned by `getModels`
- `Model` becomes `GlobalModel`, it contains `stepTypes` and `projects` that are loaded on init
  - optional data (archived projects...) when loaded by queries
- Add a boolean "processing" on each model
  - Lionel: disable forms for the models in processing
- Add a list of processing tasks
  - Lionel: Implement a new component `RemoteTaskManager`

# Lionel
- Use a timeout to schedule the call to StepsPanel#onTaskReorder()

- **Task panel**:
  - For tasks without child: add a button "Show/Hide as parent"*
  - Allow to delete a task that doesn't have child (after user confirmation)
- **ProjectForm**:
  - Do not use the title to open the form, add a DropdownMenu button (`…`) near the title with following items:
    - An button "Edit Form" for opening the form*
    - A button "Show Tasks On Hold" => Implement a new component "Tasks On Hold"*
    - A button "Archived Tasks" => Implement a new component "Archived Tasks"*
  - Allow to delete a project when it contains no tasks (except the root task) (after user confirmation)
- **Step type form**: Allow to delete a stepType when it has no step (after user confirmation)
- **BoxList**: On reordering, add a flag in the BoxList to signal the current reordering process
- **StepsPanel**: Add a button near the title for slide up and slide down the content
- For each form:
  - Add a flag "loading" on each button "Submit"*
  - Disable the submit button until there are any changes
  - Add a button "Cancel/Close": "Close" if there is no change, "Cancel" as soon as there has been a change
