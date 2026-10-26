import { useCallback, useEffect, useRef, useState } from 'react'
import { sections } from '../data/wedding'
import type { SectionId } from '../data/wedding'

export type OverlayState =
  | { kind: 'menu' }
  | { kind: 'contacts' }
  | { kind: 'photo'; index: number }
  | { kind: 'copy'; text: string; title: string }

type Route = { section: SectionId; overlay: OverlayState | null }
const stateKey = 'weddingWireframe'
const sectionFromHash = (): SectionId => {
  const hash = window.location.hash.slice(1)
  if (hash === 'closing') return 'closing'
  return sections.find(section => section.id === hash)?.id ?? 'home'
}
const motionReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useInvitationNavigation() {
  const [overlay, setOverlay] = useState<OverlayState | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('home')
  const overlayRef = useRef<OverlayState | null>(null)
  const pendingSection = useRef<SectionId | null>(null)
  const closing = useRef(false)
  const animation = useRef(0)

  const cancelScroll = useCallback(() => {
    cancelAnimationFrame(animation.current)
  }, [])

  const scrollToSection = useCallback((id: SectionId, animate: boolean) => {
    cancelScroll()
    const element = document.getElementById(id)
    if (!element) return
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 56
    const start = window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = Math.max(0, Math.min(max, element.getBoundingClientRect().top + start - header - 16))
    const heading = element.querySelector<HTMLElement>('h1, h2')
    const finish = () => {
      window.scrollTo({ top: target, behavior: 'instant' })
      heading?.focus({ preventScroll: true })
    }
    if (!animate || motionReduced()) { finish(); return }
    const started = performance.now()
    const tick = (time: number) => {
      const progress = Math.min(1, (time - started) / 450)
      const ease = (1 - Math.cos(Math.PI * progress)) / 2
      window.scrollTo({ top: start + (target - start) * ease, behavior: 'instant' })
      if (progress < 1) animation.current = requestAnimationFrame(tick)
      else finish()
    }
    animation.current = requestAnimationFrame(tick)
  }, [cancelScroll])

  const writeRoute = useCallback((route: Route, replace = false) => {
    const url = new URL(window.location.href)
    url.hash = route.section
    window.history[replace ? 'replaceState' : 'pushState']({
      ...window.history.state, [stateKey]: route,
    }, '', url)
  }, [])

  const closeOverlay = useCallback(() => {
    if (!overlayRef.current || closing.current) return
    closing.current = true
    window.history.back()
  }, [])

  const navigate = useCallback((id: SectionId) => {
    if (overlayRef.current) {
      pendingSection.current = id
      closeOverlay()
      return
    }
    if (sectionFromHash() !== id) writeRoute({ section: id, overlay: null })
    scrollToSection(id, true)
  }, [closeOverlay, scrollToSection, writeRoute])

  const openOverlay = useCallback((next: OverlayState) => {
    if (overlayRef.current || closing.current) return
    cancelScroll()
    writeRoute({ section: sectionFromHash(), overlay: next })
    overlayRef.current = next
    setOverlay(next)
  }, [cancelScroll, writeRoute])

  const changePhoto = useCallback((index: number) => {
    const next: OverlayState = { kind: 'photo', index }
    writeRoute({ section: sectionFromHash(), overlay: next }, true)
    overlayRef.current = next
    setOverlay(next)
  }, [writeRoute])

  const afterOverlayClosed = useCallback(() => {
    closing.current = false
    if (pendingSection.current) {
      const id = pendingSection.current
      pendingSection.current = null
      navigate(id)
    }
  }, [navigate])

  useEffect(() => {
    // Each overlay owns one history entry; native Back closes it first.
    window.history.scrollRestoration = 'manual'
    writeRoute({ section: sectionFromHash(), overlay: null }, true)
    const initial = requestAnimationFrame(() => scrollToSection(sectionFromHash(), false))
    const onPopState = (event: PopStateEvent) => {
      cancelScroll()
      const previous = overlayRef.current
      const route = event.state?.[stateKey] as Route | undefined
      const next = route?.overlay ?? null
      if (next) { closing.current = false; pendingSection.current = null }
      overlayRef.current = next
      setOverlay(next)
      if (!previous && !next) scrollToSection(sectionFromHash(), false)
    }
    const onHashChange = () => {
      if (!overlayRef.current) scrollToSection(sectionFromHash(), false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelScroll()
    }
    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('wheel', cancelScroll, { passive: true })
    window.addEventListener('touchstart', cancelScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(initial)
      cancelScroll()
      window.history.scrollRestoration = 'auto'
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('wheel', cancelScroll)
      window.removeEventListener('touchstart', cancelScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [cancelScroll, scrollToSection, writeRoute])

  useEffect(() => {
    let frame = 0
    const update = () => {
      if (overlayRef.current) return
      let current: SectionId = 'home'
      const limit = (document.querySelector('header')?.getBoundingClientRect().height ?? 56) + 100
      for (const section of sections) {
        if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= limit) current = section.id
      }
      setActiveSection(current)
    }
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll) }
  }, [])

  return { overlay, activeSection, navigate, openOverlay, closeOverlay, changePhoto, afterOverlayClosed }
}
