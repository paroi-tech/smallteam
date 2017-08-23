# About this file
I used this file to record ideas and things that I think useful. I don't have Internet connection all
the time, so I can't use JIRA.

# Thomas
- When a step is deleted, provide its id and typeId
- Model have to emit event when task orders are changed.
- CSS: use flexbox & grid
- Load data on init: `stepTypes`, etc.
- ModelEngine: add a method `get(id)` and a method `where(filter)` on the list returned by `getModels`
- `Model` becomes `GlobalModel`, it contains `stepTypes` and `projects` that are loaded on init
  - optional data (archived projects…) when loaded by queries

# Lionel
- Handle StepType and Step deletion events in StepTypePanel and ProjectStepsPanel
- Add control for possibly `undefined` objects in StepsPanel#onTaskReorder() and StepsPanel#onTaskBoxMove()
- Implement move of taskbox between boxlists in StepsPanel.
- Use a timeout to schedule the call to StepsPanel#onTaskReorder()
- Add `refresh` method to ProjectBoard and StepsPanel. This method should be called when steps are added to a project or when tasks are reordered.
- Synchronize form and selected step type in StepTypePanel when the user reorders the step types
