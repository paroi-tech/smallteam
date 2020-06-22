import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import { toTitleCase, whyNewPasswordIsInvalid, whyTeamSubdomainIsInvalid, whyUsernameIsInvalid } from "../../shared/libraries/helpers"
import Deferred from "../libraries/Deferred"
import { validateEmail } from "../libraries/utils"
import ErrorDialog from "../modal-dialogs/ErrorDialog"
import InfoDialog from "../modal-dialogs/InfoDialog"
import WarningDialog from "../modal-dialogs/WarningDialog"

// tslint:disable-next-line: no-unused-expression
scss`
.TeamCreationDialog {
  margin-left: auto;
  margin-right: auto;
  max-width: 420px;

  &-header, &-content {
    background-color: #fff;
    border: 1px solid #808080;
    padding: 8px;
  }

  &-header {
    align-items: center;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-bottom: 8px;
  }

  &-warning {
    display: block;
    flex-grow: 0;
    height: 48px;
    margin-bottom: 8px;
    width: 48px;
  }
}
`

const template = handledom`
<dialog class="TeamCreationDialog">
  <header class="TeamCreationDialog-header">
    <img class="TeamCreationDialog-warning" src="svg/feather/alert-triangle.svg"/>
    <p>This service is available for testing only.</p>
  </header>

  <div class="TeamCreationDialog-content">
    <div class="FieldGroup">
      <h1 class="FieldGroup-title">Your team</h1>

      <div class="FieldGroup-multiItem">
        <label class="FieldGroup-item Field">
          <span class="Field-lbl">Subdomain</span>
          <span class="Field-deco -leftBlue">
            <input class="Field-input" type="text" pattern="^[a-z][a-z0-9]+" spellcheck="false" h="subdomain">
          </span>
        </label>

        <label class="FieldGroup-item Field">
            <span class="Field-lbl">Team name</span>
            <span class="Field-deco -leftBlue">
              <input class="Field-input" type="text" spellcheck="false" h="teamName">
            </span>
          </label>
      </div>
    </div>

    <div class="FieldGroup">
      <h1 class="FieldGroup-title">Your account</h1>

      <label class="FieldGroup-item Field">
        <span class="Field-lbl">Your email address</span>
        <span class="Field-deco -leftBlue">
          <input class="Field-input" type="email" required spellcheck="false" h="email">
        </span>
      </label>

      <div class="FieldGroup-multiItem">
        <label class="FieldGroup-item Field">
          <span class="Field-lbl">Login</span>
          <span class="Field-deco -leftBlue">
            <input class="Field-input" type="text" pattern="^[a-z][a-z0-9]+" spellcheck="false" h="login">
          </span>
        </label>

        <label class="FieldGroup-item Field">
          <span class="Field-lbl">Name</span>
          <span class="Field-deco -leftBlue">
            <input class="Field-input" type="text" h="name">
          </span>
        </label>
      </div>

      <label class="FieldGroup-item Field">
        <span class="Field-lbl">Password</span>
        <span class="Field-deco -leftBlue">
          <input class="Field-input" type="password" h="password">
        </span>
      </label>

      <label class="FieldGroup-item Field">
        <span class="Field-lbl">Confirm your password</span>
        <span class="Field-deco -leftBlue">
          <input class="Field-input" type="password" h="confirm">
        </span>
      </label>

      <div>
        <button class="FieldGroup-action Btn WithLoader -right" h="submitBtn" type="button">
          Submit
          <span class="WithLoader-l" hidden h="spinner"></span>
        </button>
        &nbsp;
        <button class="Btn" type="button" h="cancelBtn">Cancel</button>
      </div>
    </div>
  </div>
</dialog>
`

export default class TeamCreationDialog {
  private readonly el: HTMLDialogElement
  private subdomainEl: HTMLInputElement
  private teamNameEl: HTMLInputElement
  private emailEl: HTMLInputElement
  private loginEl: HTMLInputElement
  private nameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  // private spinnerEl: HTMLElement

  private canSetTeamName = true
  private canSetName = true
  private canSetLogin = true

  private curDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash<{ baseUrl: string }>) {
    const { root, ref } = template()

    this.el = root as HTMLDialogElement
    this.subdomainEl = ref("subdomain")
    this.teamNameEl = ref("teamName")
    this.emailEl = ref("email")
    this.loginEl = ref("login")
    this.nameEl = ref("name")
    this.passwordEl = ref("password")
    this.confirmEl = ref("confirm")
    // this.spinnerEl = ref("spinner")

    dialogPolyfill.registerDialog(this.el)

    ref("submitBtn").addEventListener("click", () => this.onSubmit())
    ref("cancelBtn").addEventListener("click", () => {
      if (this.curDfd) {
        this.curDfd.reject("Process canceled")
        this.curDfd = undefined
        this.el.close()
      }
    })

    this.subdomainEl.addEventListener("input", () => {
      if (!this.canSetTeamName)
        return
      if (!this.subdomainEl.validity.valid)
        this.teamNameEl.value = ""
      else
        this.teamNameEl.value = toTitleCase(this.subdomainEl.value)
    })

    this.teamNameEl.addEventListener("oninput", () => this.canSetTeamName = false)

    this.emailEl.addEventListener("input", () => {
      if (!this.canSetLogin && !this.canSetName)
        return

      if (!this.emailEl.validity.valid) {
        this.loginEl.value = this.canSetLogin ? "" : this.loginEl.value
        this.nameEl.value = this.canSetName ? "" : this.nameEl.value
        return
      }

      let parts = this.emailEl.value.split("@")
      let str = parts[0].toLocaleLowerCase()
      let lowerStr = str.replace(/\W/g, "_")

      if (this.canSetLogin && !whyUsernameIsInvalid(lowerStr))
        this.loginEl.value = lowerStr
      if (this.canSetName)
        this.nameEl.value = toTitleCase(str.replace(/\./, " "))
    })

    this.loginEl.addEventListener("input", () => {
      this.canSetLogin = false
      if (this.canSetName && this.loginEl.validity.valid)
        this.nameEl.value = toTitleCase(this.loginEl.value)
    })

    this.nameEl.addEventListener("input", () => this.canSetName = false)

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
  }

  async open() {
    document.body.appendChild(this.el)
    this.el.showModal()
    this.curDfd = new Deferred()

    return this.curDfd.promise
  }

  private async onSubmit() {
    let checkMsg: string | undefined

    let subdomain = this.subdomainEl.value.trim()

    checkMsg = whyTeamSubdomainIsInvalid(subdomain)
    if (checkMsg) {
      await this.dash.create(WarningDialog).show(checkMsg)
      this.teamNameEl.focus()
      return
    }

    let teamName = this.teamNameEl.value.trim()

    if (teamName.length === 0) {
      await this.dash.create(WarningDialog).show("Please enter a team name.")
      this.teamNameEl.focus()
      return
    }

    let name = this.nameEl.value.trim()

    if (name.length === 0) {
      await this.dash.create(WarningDialog).show("Please enter a name for the user.")
      this.teamNameEl.focus()
      return
    }

    let login = this.loginEl.value.trim()

    checkMsg = whyUsernameIsInvalid(login)
    if (checkMsg) {
      await this.dash.create(WarningDialog).show(checkMsg)
      this.loginEl.focus()
      return
    }

    let password = this.passwordEl.value

    checkMsg = whyNewPasswordIsInvalid(password)
    if (checkMsg) {
      await this.dash.create(WarningDialog).show(checkMsg)
      this.passwordEl.focus()
      return
    }

    if (this.confirmEl.value !== password) {
      await this.dash.create(WarningDialog).show("Passwords do not match.")
      this.confirmEl.focus()
      return
    }

    let email = this.emailEl.value.trim()

    if (email.length === 0 || !validateEmail(email)) {
      this.dash.create(WarningDialog).show("Please enter a valid email address.")
      await this.emailEl.focus()
      return
    }

    let data = await this.checkSubdomain(subdomain)

    if (!data.done) {
      this.dash.create(WarningDialog).show("Something went wrong. We could not contact server for the moment.")
      return
    }

    if (!data.answer) {
      await this.dash.create(WarningDialog).show("The subdomain you chosed is not available. Try another one.")
      this.subdomainEl.focus()
      return
    }

    if (await this.register(teamName, subdomain, name, login, password, email) && this.curDfd) {
      this.curDfd.resolve(true)
      this.curDfd = undefined
      this.el.close()
    }
  }

  private async checkSubdomain(subdomain: string) {
    let outcome = {
      done: false,
      answer: false
    }

    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/team/check-subdomain`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ subdomain })
      })

      if (response.ok) {
        outcome.answer = (await response.json()).answer
        outcome.done = true
      }
    } catch (error) {
      this.dash.log.error("Unable to get response from server", error)
    }

    return outcome
  }

  private async register(teamName: string, subdomain: string, name: string, username: string, password: string, email: string) {
    try {
      let response = await fetch(`${this.dash.app.baseUrl}/api/team/create`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ teamName, subdomain, name, username, password, email })
      })

      if (!response.ok) {
        await this.dash.create(ErrorDialog).show("Something went wrong. We could not process your request.")
        return false
      }

      let answer = await response.json()

      if (answer.done) {
        this.dash.create(InfoDialog).show("You have been registered. You should receive an email with a link to activate your account.")
        return true
      }
      this.dash.create(ErrorDialog).show("Something went wrong. We could not process your request. Try again later.")
    } catch (error) {
      this.dash.log.error(error)
      this.dash.create(InfoDialog).show("Something went wrong. We cannot reach our server. Try again later.")
    }

    return false
  }
}
