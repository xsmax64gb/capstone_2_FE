'use client'

import { Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function GlobalLanguageFab() {
  const { lang, toggleLang } = useI18n()

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="fixed bottom-4 right-4 z-[60] inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      title={lang === 'vi' ? 'Chuyen sang tieng Anh' : 'Switch to Vietnamese'}
    >
      <Languages className="mr-1.5 h-3.5 w-3.5" />
      {lang === 'vi' ? 'VI' : 'EN'}
    </button>
  )
}
