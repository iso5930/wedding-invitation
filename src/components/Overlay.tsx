import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { photoSlots, sections, wedding } from '../data/wedding'
import type { SectionId } from '../data/wedding'
import type { OverlayState } from '../hooks/useInvitationNavigation'

interface Props {
  overlay: OverlayState | null
  activeSection: SectionId
  onClose: () => void
  onExited: () => void
  onNavigate: (section: SectionId) => void
  onPhotoChange: (index: number) => void
}

export default function Overlay({ overlay, activeSection, onClose, onExited, onNavigate, onPhotoChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [visible, setVisible] = useState<OverlayState | null>(null)
  const [exiting, setExiting] = useState(false)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const afterExit = useRef(onExited)
  afterExit.current = onExited
  const isVisible = visible !== null

  useEffect(() => {
    if (overlay) {
      setExiting(false)
      setVisible(overlay)
      return
    }
    if (!dialog.current?.open) return
    setExiting(true)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220
    const timer = window.setTimeout(() => {
      dialog.current?.close()
      setVisible(null)
      setExiting(false)
      // Restore the page before scrolling to a selected section.
      requestAnimationFrame(() => afterExit.current())
    }, delay)
    return () => window.clearTimeout(timer)
  }, [overlay])

  useLayoutEffect(() => {
    if (!isVisible || !dialog.current) return
    const trigger = document.activeElement as HTMLElement | null
    const scrollY = window.scrollY
    const previous = {
      position: document.body.style.position, top: document.body.style.top,
      width: document.body.style.width, overflow: document.body.style.overflow,
    }
    Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' })
    dialog.current.showModal()
    return () => {
      Object.assign(document.body.style, previous)
      window.scrollTo({ top: scrollY, behavior: 'instant' })
      trigger?.focus({ preventScroll: true })
    }
  }, [isVisible])

  const title = visible?.kind === 'menu' ? '전체 메뉴'
    : visible?.kind === 'contacts' ? '연락하기'
      : visible?.kind === 'copy' ? visible.title : '사진 크게 보기'
  const photo = visible?.kind === 'photo' ? visible.index : null
  const changePhoto = (delta: number) => {
    if (photo === null || exiting) return
    onPhotoChange(Math.max(0, Math.min(photoSlots.length - 1, photo + delta)))
  }
  const finishSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return
    const dx = event.clientX - pointerStart.current.x
    const dy = event.clientY - pointerStart.current.y
    pointerStart.current = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) changePhoto(dx < 0 ? 1 : -1)
  }

  return (
    <dialog ref={dialog}
      className={`dialog ${photo !== null ? 'dialog--photo' : 'dialog--sheet'} ${exiting ? 'is-exiting' : ''}`}
      aria-labelledby="dialog-title"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => {
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
      }}
      onKeyDown={event => {
        if (event.key === 'Tab') {
          const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea:not(:disabled)'))
          const first = focusable[0]
          const last = focusable.at(-1)
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }
        if (photo === null) return
        if (event.key === 'ArrowLeft') { event.preventDefault(); changePhoto(-1) }
        if (event.key === 'ArrowRight') { event.preventDefault(); changePhoto(1) }
      }}
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button type="button" className="text-button close-button" onClick={onClose} autoFocus>닫기 <span aria-hidden="true">×</span></button>
      </div>
      {visible?.kind === 'menu' && <nav className="menu-list" aria-label="전체 메뉴">
        {sections.map(section => <button key={section.id} type="button"
          aria-current={activeSection === section.id ? 'location' : undefined} onClick={() => onNavigate(section.id)}
        ><span>{section.label}</span><span aria-hidden="true">{activeSection === section.id ? '●' : '↗'}</span></button>)}
      </nav>}
      {visible?.kind === 'contacts' && <div className="contact-list">
        <p className="muted">연락처가 등록되면 전화와 문자를 보낼 수 있습니다.</p>
        {wedding.contacts.map(contact => <div className="contact-row" key={contact.role}>
          <div><strong>{contact.role}</strong><p>{contact.name}</p></div>
          <div className="contact-actions">
            {contact.phone ? <>
              <a className="button button--small" href={`tel:${contact.phone}`}>{contact.role} 전화</a>
              <a className="button button--small" href={`sms:${contact.phone}`}>{contact.role} 문자</a>
            </> : <>
              <button className="button button--small" disabled aria-label={`${contact.role} 전화, 연락처 안내 예정`}>전화</button>
              <button className="button button--small" disabled aria-label={`${contact.role} 문자, 연락처 안내 예정`}>문자</button>
            </>}
          </div>
        </div>)}
      </div>}
      {visible?.kind === 'copy' && <div className="manual-copy">
        <p>자동 복사가 지원되지 않습니다. 아래 내용을 길게 눌러 복사해 주세요.</p>
        <textarea aria-label="복사할 내용" readOnly value={visible.text} onFocus={event => event.currentTarget.select()} />
      </div>}
      {photo !== null && <div className="photo-viewer">
        <p className="photo-counter" aria-live="polite">{photo + 1} / {photoSlots.length}</p>
        <div className="photo-stage" aria-label="사진 미리보기, 좌우로 넘기기"
          onPointerDown={event => {
            pointerStart.current = { x: event.clientX, y: event.clientY }
            event.currentTarget.setPointerCapture(event.pointerId)
          }} onPointerUp={finishSwipe} onPointerCancel={() => { pointerStart.current = null }}
        >
          <div className="photo-placeholder photo-placeholder--large" key={photo}>
            <span className="placeholder-number">{String(photo + 1).padStart(2, '0')}</span>
            <span>사진 영역</span><small>실제 사진은 추후 등록됩니다</small>
          </div>
        </div>
        <div className="photo-controls">
          <button type="button" className="button" disabled={photo === 0} onClick={() => changePhoto(-1)}>← 이전 사진</button>
          <button type="button" className="button" disabled={photo === photoSlots.length - 1} onClick={() => changePhoto(1)}>다음 사진 →</button>
        </div>
        <p className="viewer-hint">좌우로 넘겨보세요</p>
      </div>}
    </dialog>
  )
}
