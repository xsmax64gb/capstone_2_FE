'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { type AppLang, translateText } from './messages'

type I18nContextValue = {
  lang: AppLang
  setLang: (lang: AppLang) => void
  toggleLang: () => void
  t: (text: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'app_lang'
const ATTR_KEY = 'data-i18n-original'
const PLACEHOLDER_ATTR_KEY = 'data-i18n-placeholder-original'

function translateDom(lang: AppLang) {
  if (typeof document === 'undefined') return

  const nodes = document.querySelectorAll<HTMLElement>(
    'button, a, p, h1, h2, h3, h4, h5, h6, span, label, th, td, li, option'
  )

  nodes.forEach((node) => {
    // Never rewrite nodes that contain child elements (icons/svg/etc),
    // otherwise React hydration/reconciliation can break.
    if (node.childElementCount > 0) return

    const rawOriginal = node.getAttribute(ATTR_KEY)
    const base = rawOriginal ?? node.textContent ?? ''
    if (!rawOriginal) node.setAttribute(ATTR_KEY, base)
    const next = translateText(base, lang)
    if ((node.textContent ?? '') !== next) {
      node.textContent = next
    }
  })

  const inputNodes = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input[placeholder], textarea[placeholder]'
  )
  inputNodes.forEach((node) => {
    const original = node.getAttribute(PLACEHOLDER_ATTR_KEY) ?? node.placeholder
    if (!node.getAttribute(PLACEHOLDER_ATTR_KEY)) {
      node.setAttribute(PLACEHOLDER_ATTR_KEY, original)
    }
    const next = translateText(original, lang)
    if (node.placeholder !== next) {
      node.placeholder = next
    }
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLang>('vi')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'vi' || saved === 'en') {
      setLangState(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((nextLang: AppLang) => {
    setLangState(nextLang)
    window.localStorage.setItem(STORAGE_KEY, nextLang)
    document.documentElement.lang = nextLang
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'vi' ? 'en' : 'vi')
  }, [lang, setLang])

  const t = useCallback(
    (text: string) => {
      return translateText(text, lang)
    },
    [lang]
  )

  useEffect(() => {
    translateDom(lang)

    let translating = false
    const observer = new MutationObserver(() => {
      if (translating) return
      translating = true
      translateDom(lang)
      translating = false
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [lang])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
    }),
    [lang, setLang, toggleLang, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
