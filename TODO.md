# About this file
I used this file to record ideas and things that I think useful. I don't have Internet connection all
the time, so I can't use JIRA.

# Thomas
- When the name of a steptype is updated, the change is not reflected in steps linked to it.
- Model have to emit event when steptype orders are changed.
- Add an overload for ProjectModel#hasStep() which takes stepType#orderNum as parameter.

# Lionel
- Make StepsPanels listens to StepsType update (from model) in order to update their BoxLists title.
- After a project created, don't close the project form. The user have to define steps used by the project. So in the project form, ProjectStepsPanel is hidden displayed only after the creation of a project.
- Implements update for projects in model.
- Add `refresh` method to ProjectBoard and StepsPanel. This method should be called when steps are added to a project or when tasks are reordered.
- Synchronize form and selected step type in StepTypePanel when the user reorders the step types
- Use ProjectModel#hasStep(orderNum) in ProjectStepsPanel instead of projectModel.steps.find()
