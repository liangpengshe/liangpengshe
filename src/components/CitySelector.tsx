'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, ChevronDown } from 'lucide-react'

const cities = [
  { name: '深圳', code: 'shenzhen' },
  { name: '东莞', code: 'dongguan' },
  { name: '柳州', code: 'liuzhou' },
  { name: '乌海', code: 'wuhai' },
]

// localStorage 键名 + 跨组件共享当前选中城市
export const CITY_STORAGE_KEY = 'lps.selectedCity'
const CITY_CHANGE_EVENT = 'lps:cityChanged'

// 各城市站首页路由映射（W4.1 演进：统一收口到 /city/[slug]）
// 深圳站为主站，/city/shenzhen 同样有效（重定向到 /）
const CITY_HOMEPAGE: Record<string, string> = {
  shenzhen: '/',
  wuhai: '/city/wuhai',
  dongguan: '/city/dongguan',
  liuzhou: '/city/liuzhou',
}

function readPersistedCity(): typeof cities[number] {
  if (typeof window === 'undefined') return cities[0]
  try {
    const raw = window.localStorage.getItem(CITY_STORAGE_KEY)
    if (!raw) return cities[0]
    const found = cities.find((c) => c.code === raw)
    return found || cities[0]
  } catch {
    return cities[0]
  }
}

export default function CitySelector() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState(cities[0])

  const handleSelect = (city: typeof cities[0]) => {
    setSelectedCity(city)
    setIsOpen(false)
    // 持久化 + 广播（让 Logo 旁城市徽章实时更新）
    try {
      window.localStorage.setItem(CITY_STORAGE_KEY, city.code)
      window.dispatchEvent(new Event('lps:cityChanged'))
    } catch {
      /* 忽略 */
    }
    // 跳转到对应城市站首页
    const target = CITY_HOMEPAGE[city.code] ?? '/'
    router.push(target)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors text-sm"
      >
        <MapPin size={14} className="text-blue-600" />
        <span className="font-medium">{selectedCity.name}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {cities.map((city) => (
            <button
              key={city.code}
              onClick={() => handleSelect(city)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors ${
                selectedCity.code === city.code ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
              }`}
            >
              {selectedCity.code === city.code && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}