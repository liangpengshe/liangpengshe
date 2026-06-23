'use client'

import { useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'

const cities = [
  { name: '深圳', code: 'shenzhen' },
  { name: '广州', code: 'guangzhou' },
  { name: '杭州', code: 'hangzhou' },
  { name: '成都', code: 'chengdu' },
]

export default function CitySelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState(cities[0])

  const handleSelect = (city: typeof cities[0]) => {
    setSelectedCity(city)
    setIsOpen(false)
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