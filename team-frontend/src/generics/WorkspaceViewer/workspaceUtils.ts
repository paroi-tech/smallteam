import handledom from "handledom"

const template = handledom`
<button class="CustomMenuBtn" type="button">…</button>
`

export function createCustomMenuBtnEl(): HTMLElement {
  return template().root
}
