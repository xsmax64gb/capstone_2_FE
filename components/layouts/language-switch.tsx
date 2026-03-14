'use client'

import { Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function LanguageSwitch() {
  const { lang, toggleLang } = useI18n()

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="inline-flex items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
      title={lang === 'vi' ? 'Chuyen sang tieng Anh' : 'Switch to Vietnamese'}
    >
      <Languages className="mr-1.5 h-3.5 w-3.5" />
      {lang === 'vi' ? 'VI' : 'EN'}
    </button>
  )
}
