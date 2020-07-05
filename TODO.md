# TODO

## June & July 2020

### Paleo
- [ ] Configure Certbot to get a wildcard for the part of domain name (label) that represents team ID.
- [ ] Deploy using Nginx with HTTPS and WSS.
- [ ] Use `rush publish` in order to publish a build with a snapshot of `shared`.
- [ ] Add a links to support in registration and platform frontends.
- [ ] Fix minor bugs, and improve the ergonomy in the `TaskForm`.
- [x] Add a `hostName` for security in the backend config.
- [x] Web socket URI with correct port and protocol.
- [x] Change log system in backend. Remove all calls to `console.log()`.
- [x] Use typeonly to validate the config file.
- [x] Use ESLint & prettier instead of TSLint.
- [x] At registration, show a warning that mentions that teams inactive for several months will be removed.
      Paroi may change the terms and conditions of the service at anytime.
      You can get your data stored on our server if you ask.
- [x] Try to use Rush. https://rushjs.io/
- [x] Remove webpack unused configs and generate bundles without map files for prod.
- [x] Maybe separate source files and compiled files in `shared` and `shared-ui`.

### kitihounel
- [ ] Remove fontawesome and all unused images in `packages/smallteam/static/svg/`.
- [ ] Add a link to support in the team frontend.
- [ ] Update `hasSession` function to also accept an Http.IncommingMessage as parameter.
- [ ] In team frontend, track ws client state and restart a new one if it gets closed in App.start().
- [ ] Backend should notify frontend about updates so that frontend can refresh.
      When a refresh is required, a notification is displayed to the user.
- [ ] Don't allow a contributor to change his own status.
- [ ] In `routeBatch`, handle the case when one of the commands fails.
- [x] Update modal dialogs to enable several row of text.
- [x] Create a dialog component that can't be closed. Use it to display the success messge in `TeamCreationDialog`.
- [x] Configure team creation process so that for each new team, a default project named *First Project* is available.
      Complete the database creation script with required `insert` statements.
- [x] Compatibility with recent versions of Chrome, Firefox, Edge, Opera, and Safari.
- [x] [backend] Use Joi in backend/src/utils/joiUtils.ts.
- [x] [plateform] After team creation, show a message that tells the user to check his email to complete validation.

## On Hold

- [ ] Fallback avatar for user menu?

---

## August 2018

- Add HTTP headers for static resources, add versioning in URLs, automatically increment the versioning on deploy
- Logs:
  - Add a log system (`bristol`?) and replace all the `console.log` on the backend
  - Remove all the `console.log()`, `console.warn()` etc, use `this.dash.app.log.warn()` etc. if necessary
- Listen to commit events from model in `TaskCommitDialog`

### To refactore

- `onkeyup` ⇒ `addEventListener("input", )`
- `prop: smtg | undefined` ⇒ `prop?: smtg`
- `<button type="button"` ⇒ remove `type="button"`
- `&nbsp;` ⇒ remove

### Paleo

- TaskForm: create an event "change" when closing the dialog of accountSelector (with change)
- CSS
- WebSocket:
  - Synchronisation between several users
  - Accept to open only for connected users
- Auto-save: remove 'submit' buttons
- Routes for tasks

### kitihounel

- When an account change status, from admin to contributor, check that there is at least one admin in the team.
- Reuse CSS classes for each forms, fields EXCEPT in `TaskForm`
- Replace ES5 `get` and `set` by methods if an exception can be thrown
- Paste images in the task description
- queryAccount.ts => createAccount: fix default password problem. Set password to NULL and forbid connection for user with no password.
- Show an animated loader on the background command button when there is something started
- For each form:
  - Disable the submit button until there are any changes
  - Add a "Close" button

### Not urgent

- Deploy automatically
  - Create a detached `prod` branch in the Git repository, with a built version of our application
  - Configure a hook on GitHub and write a script on the server (with a `npm install` without `devDependencies` and a `service restart`)
  - Create a npm script to run locally on the `prod` branch:
    - build
    - commit
    - Add a tag with the release version
    - push
- Use the typescript 3 new sub-projects feature?
- Add roles for users
- Internationalisation
- On error 'Unable to disconnect user...', clear the session cookie and reload the page

### Paleo - v2 - Not urgent

- Upload engine & co:
  - Implement multi-files upload
- In the Model:
  - (optimisation) In the backend, do not fetch `stepTypes`, `flags`, `accounts` as dependencies
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
      ```
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
      ```

---

## August 2018 - DONE

- Configure and use SendMail on the server
- Components `RegistrationForm` and `TeamCreationDialog` are used by several frontends, they should be in a common part.

### kitihounel - DONE

- In TaskForm, when the user click on the "Archive" button, open a confirmation dialog.
- Fix Bug in PasswordResetDialog that display several modal when we press Enter key in InfoDialog
- `BgCommandManager`: Use our `Dialog` system
- Create a component `AccountAvatar`, its option is a `AccountModel`, display a letter **or** the avatar
- TaskBox order in BoxList (StepSwitcher)
- Reuse CSS classes for each forms, fields EXCEPT in `TaskForm`
- Replace ES5 `get` and `set` by methods if an exception can be thrown
- Make a generic component `Dialog` which recieve a component as a `"body"` parameter
- Replace all `style="display: none"` with the `hidden` attribute.
- Add subdomain check for public routes (session.ts (use transaction and accept only if mail is sent), invitation.ts)
- Github notifications: use a hook to track the commits from GitHub
  - Add a menu to configure hooks on a project
  - Accepted events are `push`, `issues`, `create` (for branches and tags).
  - When adding hook genereate a secret to validate payloads from Github using cryto#randomBytes
  - URL will be /api/notifications
- Team creation
- Set `activated` attribute to `true` in `team` table on activation.
- Remove trim on password
- Replace `config.minPasswordLength` and `config.maxTeamCodeLength` with `whyNewPasswordIsInvalid()` and `whyTeamCodeIsInvalid()`
- Move the `sessions` database to the data directory
- Define a `subdomain` property in `req.session` or `req.session.cookie` when user logins to add another
  level of security.\
  `express-session` uses only one database for all sessions (including subdomains) and I haven't find a way
  to have a session database per subdomain. So it is possible that someone who is logged in subdomain 'A' accesses
  subdomain 'B' by using the cookie from subdomain 'A'.
- TaskFormTitle component
- Create TaskLogDialog when needed
- **ProjectForm**:
  - In the DropdownMenu button (`…`):
    - A button "Show Tasks On Hold" => Implement a new component "Tasks On Hold"
    - A button "Archived Tasks" => Implement a new component "Archived Tasks"
- In `TaskForm` and `AccountForm`, show the uploaded files in an appropriate component `FileThumbnail`
- In `TaskBox`, display the true account's avatar (if exists)
- In AccountForm, pass a boolean parameter that controls is password inputs will be displayed or hidden.
- In the backend, replace our old SQL query builder by SqlBricks:
  - Do not use `import * as sql from` but choose what you need: `import { select, insertInto, update, deleteFrom } from`
- Merge `AccountHome` and `AccountForm`
  - The admin can reset the password (via frontend-registration)
  - The profile of the connected user allows to change the password but in a distinct `ChangePassword` form (on the same screen)
- TaskAttachmentManager => remove attached files (test only since it is not supported by model)
- Image library (sharp => https://github.com/lovell/sharp)
- Each DropDown menus must be displayed on an overlay. A click on the overlay closes the dropdown menu.
- In the main frontend:
  - Menu _Settings_, add an entry: "Invite accounts", that opens a panel `AccountInvitations`
    - The admin user entries email addresses (required) and names (optional), the form insert a new token in `reg_new` and send emails
    - The panel show the list of awaiting invites, for each one there are two actions:
      - remove
      - resend the email
- The application _frontend-registration_:
  - SQL schema: the table `mail_challenge` is replaced by `reg_pwd`, create a new table `reg_new`
  - Rename the application `frontend-pwd` to `frontend-registration`
  - Implement the `NewAccountForm`
- In `LoginDialog`, the link "Forgot your password" opens a panel `PasswordReset`:
  - The user entries his email address, the form insert a new token in `reg_pwd` and send an email
- Merge `AccountHome` into `AccountForm`
  - Allow to upload an avatar from the `AccountForm`
  - Allow to change the password from the `AccountForm`
- Replace `alert` & `confirm` with a component `ModalDialog`
- Add a background task that removes expired tokens from mail_challenge table
- In webserver.ts, the `/get-file` route is declared as public. Anybody can download the files stored on the server.
- Improve forms
- Improve accounts selector in taskform. Open a dialog to select constributors and use inline BoxList.
- In TaskForm, show account name and creation date beside a comment.
- Listen to events (create, update, delete) in MultiSelect in order to reorder and update items
  - Create a listener object and pass it as optional parameter to MultiSelect.
  - The listener will listen to update events from model and update the MultiSelect
- Dropdown menus: open them as modal (maybe with a transparent overlay instead of a `<dialog>`?)
- In `TaskForm`:
  - Show, Add, remove, reorder the accounts affected to the task
  - Show, Add, remove the flags for the task
  - Show, Add, update, remove comments
  - Add a button "Log" in the task form, and show the task log in a dialog
  - On create/update/delete accounts, update the list in `TaskForm`
  - On create/update/delete flags, update the list in `TaskForm`
- Create a component `SessionMenu`:
  - It contains a drop-down menu to append to the right of the main drop-down menu
  - Show the user's avatar on the button (do not use `…`)
  - Add a menu item: "Edit my profile" → app.navigate to "/settings/accounts/my-profile"
  - Add a menu item: "Disconnect"
- **Step form**: Allow to delete a stepType when it has no step (after user confirmation)
- In `TaskBox`:
  - Show the accounts affected to the task
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
- Account (form, management, backend queries)
- Refactoring in WorkspaceViewer (with Paleo)
- Refactor Menu and DropDownMenu components
- Add `disable` method to BoxList.
- On each component form:
  - Disable forms for the models during processing (see with Paleo for the events)
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

### Paleo - DONE

- Sessions in the backend
  - Implement `session/current` Auto-login when a session is already opened
  - Implement `session/recover` the password recovery
  - Implement `session/save-password`
  - Implement `session/disconnect`
- In the Model:
  - `Model` becomes `GlobalModel`, it contains `stepTypes` and `projects` that are loaded on init
  - Load data on init: `stepTypes`, `flags`, `accounts`
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
- In the backend, keep the session and associate a accountId (string)
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
  - Remove the dependent medias on delete tasks, accounts (backend & frontend)
  - Implement several variants for images
- In the Model:
  - Keep `global` lists up-to-date
  - [CANCELED] Remove `StepFragment.name` => call `step.stepType.name`

### Paleo or kitihounel - DONE

- Connection:
  - Chromium ask for saving password => find a solution
  - Use a session token

---

## August 2018 & old tasks - DONE

- Update the definition for SqlBricks in DefinitelyTyped
- Use systemd to run our Node application (using the user `smallteam`!)
- Add a SSL certificate - https://letsencrypt.org/
- [NOT RELEVANT] Check if [the warning here](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html) concerns us
- Use true avatars
- Add attached files to tasks
- Use a GitHub hook to show the commits on tasks
- Use HTTPS, deploy the project on the Web server
- Multi-teams
- Rename `contributor` to `account`

---

## DNS and proxy settings - DONE

- https://www.digitalocean.com/community/tutorials/how-to-use-apache-http-server-as-reverse-proxy-using-mod_proxy-extension
- https://webmasters.stackexchange.com/questions/76540/apache-wildcard-domains-restrict-number-of-subdomain-levels
- https://en.wikipedia.org/wiki/Proxy_server
- http://askubuntu.com/a/233224/88802
- https://unix.stackexchange.com/questions/28941/what-dns-servers-am-i-using
