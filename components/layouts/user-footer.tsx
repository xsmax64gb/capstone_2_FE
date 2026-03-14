'use client'

import Link from 'next/link'
import { Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const footerLinks = [
  { label: 'About', href: '#' },
  { label: 'Support', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms of Service', href: '#' },
]

export function UserFooter() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-slate-200 bg-white pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded bg-black p-1 text-white">
              <Languages className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartLingo</span>
          </Link>
          <div className="flex flex-wrap gap-8 text-sm font-medium text-slate-500">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-black">
                {t(link.label)}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row">
          <p className="text-xs text-slate-400">© 2024 SmartLingo AI. {t('All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  )
}
