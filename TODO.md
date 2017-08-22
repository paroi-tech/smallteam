# About this file
I used this file to record ideas and things that I think useful. I don't have Internet connection all
the time, so I can't use JIRA.

# Thomas
- Model have to emit event when steptype orders are changed.
- CSS: use flexbox & grid
- Load data on init: stepTypes, etc.

# Lionel
- Add control for possibly `undefined` objects in StepsPanel#onTaskReorder() and StepsPanel#onTaskBoxMove()
- Use a timeout to schedule the call to StepsPanel#onTaskReorder()
- Implement move of taskbox between boxlists in StepsPanel.
- Add `refresh` method to ProjectBoard and StepsPanel. This method should be called when steps are added to a project or when tasks are reordered.
- Synchronize form and selected step type in StepTypePanel when the user reorders the step types
