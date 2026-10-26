import { useEffect, useRef, useState } from 'react'
import Accordion from './components/Accordion'
import Overlay from './components/Overlay'
import Section from './components/Section'
import { photoSlots, wedding } from './data/wedding'
import { useInvitationNavigation } from './hooks/useInvitationNavigation'
import { calendarDays, countdown } from './lib/date'

export default function App() {
  const navigation = useInvitationNavigation()
  const [allPhotos, setAllPhotos] = useState(false)
  const [today, setToday] = useState(() => new Date())
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null)
  const galleryTitle = useRef<HTMLHeadingElement>(null)
  const toastId = useRef(0)
  const [year, month, day] = wedding.date.split('-').map(Number)

  useEffect(() => {
    const update = () => setToday(new Date())
    const timer = window.setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', update) }
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const copy = async (text: string, message: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast({ message, id: ++toastId.current })
    } catch {
      navigation.openOverlay({ kind: 'copy', text, title })
    }
  }
  const baseLink = () => new URL(import.meta.env.BASE_URL, window.location.origin).href

  return (
    <div className="app">
      <a className="skip-link" href="#home" onClick={event => { event.preventDefault(); navigation.navigate('home') }}>본문으로 이동</a>
      <header className="site-header">
        <button type="button" className="brand text-button" onClick={() => navigation.navigate('home')}>{wedding.groom} <span aria-hidden="true">·</span> {wedding.bride}</button>
        <button type="button" className="menu-button text-button" aria-haspopup="dialog" onClick={() => navigation.openOverlay({ kind: 'menu' })}>메뉴 <span aria-hidden="true">☰</span></button>
      </header>
      <main>
        <section id="home" className="hero" aria-labelledby="home-title">
          <p className="eyebrow">WEDDING INVITATION</p>
          <h1 id="home-title" tabIndex={-1}>우리,<br />결혼합니다.</h1>
          <p className="couple">{wedding.groom}<span aria-hidden="true">·</span>{wedding.bride}</p>
          <div className="hero-details">
            <time dateTime={wedding.date} className="hero-date">{wedding.date.replaceAll('-', '.')}</time>
            <p>일요일 <span aria-hidden="true">·</span> {wedding.time ?? '시간 안내 예정'}</p>
            <p>{wedding.venue.name} <span aria-hidden="true">·</span> {wedding.venue.hall ?? '홀 안내 예정'}</p>
          </div>
          <p className="hero-message">같은 곳을 바라보며,<br />함께 걸어가겠습니다.</p>
          <div className="hero-actions">
            <button type="button" className="button button--primary" onClick={() => navigation.navigate('invitation')}>초대장 보기 <span aria-hidden="true">↓</span></button>
            <button type="button" className="text-button" onClick={() => navigation.navigate('location')}>오시는 길 <span aria-hidden="true">↗</span></button>
          </div>
          <p className="wireframe-note">레이아웃 미리보기 · 사진과 장식은 추후 적용됩니다</p>
        </section>
        <Section id="invitation" number="01 · INVITATION" title="초대의 글">
          <h3 className="invitation-subtitle">두 사람의 새로운 시작</h3>
          <p className="invitation-copy">서로 다른 길을 걷던 두 사람이 만나<br />이제 같은 방향으로 걸어가려 합니다.</p>
          <p className="invitation-copy">저희의 새로운 시작에<br />소중한 여러분을 초대합니다.</p>
          <div className="family-list">
            <p><span>신랑 측 가족 소개</span><strong>{wedding.groom}</strong></p>
            <p><span>신부 측 가족 소개</span><strong>{wedding.bride}</strong></p>
          </div>
          <button type="button" className="button" aria-haspopup="dialog" onClick={() => navigation.openOverlay({ kind: 'contacts' })}>연락하기 <span aria-hidden="true">↗</span></button>
        </Section>
        <Section id="ceremony" number="02 · CEREMONY" title="예식 안내">
          <div className="ceremony-info">
            <p className="important-date">{year}년 {month}월 {day}일 일요일</p>
            <p>{wedding.time ?? '예식 시간 안내 예정'}</p>
            <p><strong>{wedding.venue.name}</strong> · {wedding.venue.hall ?? '홀 안내 예정'}</p>
          </div>
          <div className="calendar" role="group" aria-label={`${year}년 ${month}월 달력, ${day}일 결혼식`}>
            <p className="calendar-month">{year}. {String(month).padStart(2, '0')}</p>
            <div className="calendar-grid" aria-hidden="true">
              {['일', '월', '화', '수', '목', '금', '토'].map(weekday => <span className="weekday" key={weekday}>{weekday}</span>)}
              {calendarDays(wedding.date).map((value, index) => <span key={index} className={value === day ? 'wedding-day' : ''}>{value}</span>)}
            </div>
          </div>
          <p className="countdown">{countdown(wedding.date, today)}</p>
          <button type="button" className="button" onClick={() => navigation.navigate('location')}>오시는 길 <span aria-hidden="true">↓</span></button>
        </Section>
        <section id="gallery" className="content-section" aria-labelledby="gallery-title">
          <div className="section-heading"><span className="eyebrow" aria-hidden="true">03 · GALLERY</span><h2 id="gallery-title" tabIndex={-1} ref={galleryTitle}>우리의 순간들</h2></div>
          <p className="section-description">사진 영역을 누르면 확대 화면을 확인할 수 있습니다.</p>
          <div className="photo-grid">
            {photoSlots.slice(0, allPhotos ? photoSlots.length : 6).map((number, index) => <button
              key={number} type="button" className="photo-placeholder" aria-label={`사진 ${number} 확대`} aria-haspopup="dialog"
              onClick={() => navigation.openOverlay({ kind: 'photo', index })}
            ><span className="placeholder-number">{String(number).padStart(2, '0')}</span><span>사진 영역</span></button>)}
          </div>
          <button type="button" className="button" aria-expanded={allPhotos} onClick={() => {
            if (allPhotos) galleryTitle.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
            setAllPhotos(!allPhotos)
          }}>{allPhotos ? '사진 접기' : '사진 더 보기'} <span aria-hidden="true">{allPhotos ? '−' : '+'}</span></button>
        </section>
        <Section id="location" number="04 · LOCATION" title="오시는 길">
          <div className="venue-address">
            <h3>{wedding.venue.name}</h3>
            <p className="muted">{wedding.venue.hall ?? '홀 안내 예정'}</p>
            <p>{wedding.venue.address}</p>
          </div>
          <button type="button" className="button" onClick={() => void copy(wedding.venue.address, '주소가 복사되었습니다', '주소 복사')}>주소 복사</button>
          <div className="map-placeholder"><span className="eyebrow">MAP AREA</span><strong>{wedding.venue.name}</strong><span>천호대로 996</span><small>지도 화면을 배치할 영역입니다</small></div>
          <div className="button-row">
            <a className="button" href={wedding.venue.naverUrl} target="_blank" rel="noopener noreferrer" aria-label="네이버지도에서 라비니움 찾기, 새 창">네이버지도 <span aria-hidden="true">↗</span></a>
            <a className="button" href={wedding.venue.kakaoUrl} target="_blank" rel="noopener noreferrer" aria-label="카카오맵에서 라비니움 찾기, 새 창">카카오맵 <span aria-hidden="true">↗</span></a>
          </div>
          <div className="accordion-list">{wedding.transport.map(item => <Accordion key={item.title} title={item.title}><p>{item.text}</p></Accordion>)}</div>
        </Section>
        <Section id="gift" number="05 · WITH THANKS" title="마음 전하기">
          <p className="section-description">축하의 마음에 감사드립니다.</p>
          <div className="accordion-list">
            {wedding.accountGroups.map(account => <Accordion key={account.side} title={`${account.side} 계좌`}>
              <div className="account-info">
                <p><strong>{account.owner ?? '예금주 안내 예정'}</strong></p>
                <p>{account.bank ?? '은행 안내 예정'}<br />{account.number ?? '계좌번호 안내 예정'}</p>
                <button type="button" className="button" disabled={!account.number} onClick={() => {
                  if (account.number) void copy(account.number, '계좌번호가 복사되었습니다', '계좌번호 복사')
                }}>계좌번호 복사</button>
              </div>
            </Accordion>)}
          </div>
          <p className="small-note">계좌 정보가 등록되면 복사할 수 있습니다.</p>
        </Section>
        <footer id="closing" className="closing">
          <span className="eyebrow">THANK YOU</span>
          <h2 id="closing-title" tabIndex={-1}>함께해 주셔서<br />감사합니다.</h2>
          <p>{wedding.groom} · {wedding.bride}</p>
          <button type="button" className="button" onClick={() => void copy(baseLink(), '청첩장 링크가 복사되었습니다', '청첩장 링크 복사')}>청첩장 링크 복사</button>
          <button type="button" className="text-button" onClick={() => navigation.navigate('home')}>맨 위로 <span aria-hidden="true">↑</span></button>
        </footer>
      </main>
      <Overlay overlay={navigation.overlay} activeSection={navigation.activeSection}
        onClose={navigation.closeOverlay} onExited={navigation.afterOverlayClosed}
        onNavigate={navigation.navigate} onPhotoChange={navigation.changePhoto} />
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">{toast && <p className="toast" key={toast.id}>{toast.message}</p>}</div>
    </div>
  )
}
