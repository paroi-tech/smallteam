import { whyNewPasswordIsInvalid, whyUsernameIsInvalid } from "@local-packages/shared/dist/libraries/helpers"
import { Dash } from "bkb"
import dialogPolyfill from "dialog-polyfill"
import handledom from "handledom"
import Deferred from "../libraries/Deferred"
import { validateEmail } from "../libraries/utils"
import ErrorDialog from "../modal-dialogs/ErrorDialog"
import InfoDialog from "../modal-dialogs/InfoDialog"
import WarningDialog from "../modal-dialogs/WarningDialog"

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
scss`
.RegistrationForm {
  border: 1px solid gray;
  border-radius: 4px;
  margin: auto;
  padding: 8px;
  width: 480px;
}
`

const template = handledom`
<dialog class="RegistrationForm">
  <div class="FieldGroup">
    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Name</span>
      <span class="Field-deco -leftBlue">
        <input class="Field-input" h="name" type="text" placeholder="Name">
      </span>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Choose your username</span>
      <span class="Field-deco -leftBlue">
        <input class="Field-input" h="username" type="text" placeholder="Username">
      </span>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Create a password</span>
      <span class="Field-deco -leftBlue">
        <input class="Field-input" h="password" type="password" placeholder="Password">
      </span>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Confirm your password</span>
      <span class="Field-deco -leftBlue">
        <input class="Field-input" h="confirm" type="password" placeholder="Password confirmation">
      </span>
    </label>

    <label class="FieldGroup-item Field">
      <span class="Field-lbl">Your email address</span>
      <span class="Field-deco -leftBlue">
        <input class="Field-input" h="email" type="email" placeholder="Email">
      </span>
    </label>

    <div>
      <button class="FieldGroup-action Btn WithLoader -right" h="submitBtn" type="button">
        Submit
        <span class="WithLoader-l" h="spinner"></span>
      </button>
      &nbsp;
      <button class="Btn" h="cancelBtn" type="button">Cancel</button>
    </div>
  </div>
</dialog>
`

export interface RegistrationFormOptions {
  token: string
  username?: string
}

export default class RegistrationForm {
  private readonly el: HTMLDialogElement
  private nameEl: HTMLInputElement
  private usernameEl: HTMLInputElement
  private passwordEl: HTMLInputElement
  private confirmEl: HTMLInputElement
  private emailEl: HTMLInputElement

  private curDfd: Deferred<boolean> | undefined

  constructor(private dash: Dash<{ baseUrl: string }>, private options: RegistrationFormOptions) {
    const { root, ref } = template()
    this.el = root as HTMLDialogElement
    this.nameEl = ref("name")
    this.usernameEl = ref("username")
    this.passwordEl = ref("password")
    this.confirmEl = ref("confirm")
    this.emailEl = ref("email")
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

    this.usernameEl.value = options.username || ""

    // By default, pressing the ESC key close the dialog. We have to prevent that.
    this.el.addEventListener("cancel", ev => ev.preventDefault())
    document.body.appendChild(this.el)
  }

  async open() {
    this.el.showModal()
    this.curDfd = new Deferred()
    return this.curDfd.promise
  }

  private async onSubmit() {
    const dialog = this.dash.create(WarningDialog)
    let checkMsg: string | undefined

    const name = this.nameEl.value.trim()

    if (name.length === 0) {
      await dialog.show("Please enter your name.")
      this.nameEl.focus()

      return
    }

    const login = this.usernameEl.value.trim()

    checkMsg = whyUsernameIsInvalid(login)
    if (checkMsg) {
      await dialog.show(checkMsg)
      this.usernameEl.focus()

      return
    }

    const password = this.passwordEl.value

    checkMsg = whyNewPasswordIsInvalid(password)
    if (checkMsg) {
      await dialog.show(checkMsg)
      this.passwordEl.focus()

      return
    }

    if (this.confirmEl.value !== password) {
      await dialog.show("Passwords do not match.")
      this.confirmEl.focus()
      return
    }

    const email = this.emailEl.value.trim()

    if (email.length === 0 || !validateEmail(email)) {
      await dialog.show("Please enter a valid email address.")
      this.emailEl.focus()
      return
    }

    const b = await this.register(name, login, password, email)

    if (b && this.curDfd) {
      this.curDfd.resolve(true)
      this.curDfd = undefined
      this.el.close()
    }
  }

  private async register(name: string, login: string, password: string, email: string) {
    try {
      const response = await fetch(`${this.dash.app.baseUrl}/api/registration/register`, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ name, login, password, email, token: this.options.token })
      })

      if (!response.ok)
        throw new Error("Our server did not process the request.")

      const answer = await response.json()

      if (answer.done) {
        void this.dash.create(InfoDialog).show("You have been successfully registred.")
        return true
      } else {
        void this.dash.create(InfoDialog).show("Registration failed. Try again later or contact the admin.")
        return false
      }
    } catch (error) {
      void this.dash.create(ErrorDialog).show("Something went wrong. We are sorry for the inconvenience. Try again later.")
      this.dash.log.error(error)
    }

    return false
  }
}
