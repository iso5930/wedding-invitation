export const sections = [
  { id: 'home', label: '처음' },
  { id: 'invitation', label: '초대의 글' },
  { id: 'ceremony', label: '예식 안내' },
  { id: 'gallery', label: '사진첩' },
  { id: 'location', label: '오시는 길' },
  { id: 'gift', label: '마음 전하기' },
] as const

export type SectionId = (typeof sections)[number]['id'] | 'closing'

export const wedding = {
  date: '2027-02-14',
  groom: '신랑',
  bride: '신부',
  time: null as string | null,
  venue: {
    name: '라비니움',
    hall: null as string | null,
    address: '서울특별시 송파구 천호대로 996',
    // Search URLs work without a map API key or an installed native app.
    naverUrl: `https://map.naver.com/p/search/${encodeURIComponent('라비니움 서울 송파구 천호대로 996')}`,
    kakaoUrl: `https://map.kakao.com/?q=${encodeURIComponent('라비니움 서울 송파구 천호대로 996')}`,
  },
  contacts: [
    { role: '신랑', name: '이름 안내 예정', phone: null as string | null },
    { role: '신부', name: '이름 안내 예정', phone: null as string | null },
  ],
  accountGroups: [
    { side: '신랑 측', bank: null as string | null, owner: null as string | null, number: null as string | null },
    { side: '신부 측', bank: null as string | null, owner: null as string | null, number: null as string | null },
  ],
  transport: [
    { title: '대중교통 안내', text: '지하철 출구와 버스 정보를 확인한 뒤 안내드리겠습니다.' },
    { title: '주차 안내', text: '주차장 위치와 이용 시간을 확인한 뒤 안내드리겠습니다.' },
    { title: '셔틀 안내', text: '셔틀 운행 여부를 확인한 뒤 안내드리겠습니다.' },
  ],
}

// Layout-only slots, never pretend that the couple has uploaded real photos.
export const photoSlots = Array.from({ length: 8 }, (_, index) => index + 1)
