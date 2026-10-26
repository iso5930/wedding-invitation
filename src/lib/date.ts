export function calendarDays(date: string) {
  const [year, month] = date.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return [...Array<number | null>(firstDay).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]
}

export function countdown(date: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  const part = (name: string) => Number(parts.find(p => p.type === name)?.value)
  const [year, month, day] = date.split('-').map(Number)
  const days = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(part('year'), part('month') - 1, part('day'))) / 86_400_000)
  if (days === 0) return '오늘, 함께하는 날'
  if (days < 0) return '함께해 주셔서 감사합니다'
  return `함께할 날까지 D-${days}`
}
