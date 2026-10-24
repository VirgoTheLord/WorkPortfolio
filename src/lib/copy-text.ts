/*
 * Puts text on the clipboard, for the compact site's copy controls. The
 * Clipboard API first; where it is missing or refused (an older browser, an
 * insecure origin), a selected off-screen field and the legacy copy command.
 * Resolves whether the text was copied, so a control only claims what happened.
 */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()
    const ok = document.execCommand('copy')
    field.remove()
    return ok
  }
}
