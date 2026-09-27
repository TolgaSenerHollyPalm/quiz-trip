import text from './text.module.css'

/** Goes after a required field's label: people see an asterisk, screen readers hear "zorunlu". */
export default function RequiredMark() {
  return (
    <>
      <span className={text.required} aria-hidden="true">
        *
      </span>
      <span className={text.visuallyHidden}> (zorunlu)</span>
    </>
  )
}
