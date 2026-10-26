import { useId, useState } from 'react'
import type { ReactNode } from 'react'

export default function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={`accordion ${open ? 'is-expanded' : ''}`}>
      <button type="button" className="accordion-trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span>{title}</span><span className="chevron" aria-hidden="true">⌄</span>
      </button>
      <div id={id} className="accordion-body" aria-hidden={!open} inert={!open}>
        <div className="accordion-clip"><div className="accordion-content">{children}</div></div>
      </div>
    </div>
  )
}
