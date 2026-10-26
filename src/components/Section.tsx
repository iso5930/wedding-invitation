import type { ReactNode } from 'react'

export default function Section({ id, number, title, children }: { id: string; number: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="content-section" aria-labelledby={`${id}-title`}>
      <div className="section-heading">
        <span className="eyebrow" aria-hidden="true">{number}</span>
        <h2 id={`${id}-title`} tabIndex={-1}>{title}</h2>
      </div>
      {children}
    </section>
  )
}
