'use client'

import { type RefObject, useEffect, useEffectEvent, useState } from 'react'

type LearnPathOverlayProps = {
  containerRef: RefObject<HTMLDivElement | null>
  anchorRefs: RefObject<Array<HTMLDivElement | null>>
  anchorCount: number
  className?: string
}

type Point = {
  x: number
  y: number
}

type ConnectorPath = {
  id: string
  d: string
  gradient: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

type OverlayLayout = {
  width: number
  height: number
  paths: ConnectorPath[]
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

function buildConnectorPath(from: Point, to: Point) {
  const dx = to.x - from.x
  const dy = Math.max(to.y - from.y, 24)
  const shoulderY = Math.min(88, Math.max(34, dy * 0.32))
  const midY = from.y + dy * 0.5
  const midX = from.x + dx * 0.5
  const spreadX = dx * 0.2

  return [
    `M ${round(from.x)} ${round(from.y)}`,
    `C ${round(from.x)} ${round(from.y + shoulderY)}`,
    `${round(midX - spreadX)} ${round(midY - shoulderY * 0.35)}`,
    `${round(midX)} ${round(midY)}`,
    `C ${round(midX + spreadX)} ${round(midY + shoulderY * 0.35)}`,
    `${round(to.x)} ${round(to.y - shoulderY)}`,
    `${round(to.x)} ${round(to.y)}`,
  ].join(' ')
}

function sameLayout(a: OverlayLayout, b: OverlayLayout) {
  if (a.width !== b.width || a.height !== b.height || a.paths.length !== b.paths.length) {
    return false
  }

  return a.paths.every((path, index) => {
    const next = b.paths[index]
    return (
      path.id === next.id &&
      path.d === next.d &&
      path.gradient.x1 === next.gradient.x1 &&
      path.gradient.y1 === next.gradient.y1 &&
      path.gradient.x2 === next.gradient.x2 &&
      path.gradient.y2 === next.gradient.y2
    )
  })
}

export function LearnPathOverlay({
  containerRef,
  anchorRefs,
  anchorCount,
  className = '',
}: LearnPathOverlayProps) {
  const [layout, setLayout] = useState<OverlayLayout>({ width: 0, height: 0, paths: [] })

  const measureLayout = useEffectEvent(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const anchors = anchorRefs.current
      .slice(0, anchorCount)
      .filter((anchor): anchor is HTMLDivElement => Boolean(anchor))

    const nextLayout: OverlayLayout = {
      width: round(containerRect.width),
      height: round(containerRect.height),
      paths: anchors.slice(0, -1).map((anchor, index) => {
        const nextAnchor = anchors[index + 1]
        const fromRect = anchor.getBoundingClientRect()
        const toRect = nextAnchor.getBoundingClientRect()
        const from = {
          x: round(fromRect.left - containerRect.left + fromRect.width / 2),
          y: round(fromRect.top - containerRect.top + fromRect.height / 2),
        }
        const to = {
          x: round(toRect.left - containerRect.left + toRect.width / 2),
          y: round(toRect.top - containerRect.top + toRect.height / 2),
        }

        return {
          id: `learn-path-${index}`,
          d: buildConnectorPath(from, to),
          gradient: {
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
          },
        }
      }),
    }

    setLayout((prev) => (sameLayout(prev, nextLayout) ? prev : nextLayout))
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = 0
    let burstUntil = 0

    const tick = () => {
      rafId = 0
      measureLayout()

      if (performance.now() < burstUntil) {
        rafId = requestAnimationFrame(tick)
      }
    }

    const startBurst = (durationMs: number) => {
      burstUntil = Math.max(burstUntil, performance.now() + durationMs)

      if (!rafId) {
        rafId = requestAnimationFrame(tick)
      }
    }

    const resizeObserver = new ResizeObserver(() => startBurst(360))
    resizeObserver.observe(container)

    anchorRefs.current.forEach((anchor) => {
      if (anchor) {
        resizeObserver.observe(anchor)
      }
    })

    const handleResize = () => startBurst(480)
    const handleMotion = () => startBurst(720)

    startBurst(1200)
    window.addEventListener('resize', handleResize)
    container.addEventListener('transitionrun', handleMotion, true)
    container.addEventListener('transitionend', handleMotion, true)
    container.addEventListener('animationstart', handleMotion, true)
    container.addEventListener('animationend', handleMotion, true)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('transitionrun', handleMotion, true)
      container.removeEventListener('transitionend', handleMotion, true)
      container.removeEventListener('animationstart', handleMotion, true)
      container.removeEventListener('animationend', handleMotion, true)

      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [anchorCount, anchorRefs, containerRef])

  if (!layout.width || !layout.height || layout.paths.length === 0) {
    return null
  }

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio="none"
      className={`ai-connector-base pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible ${className}`}
      fill="none"
    >
      <defs>
        {layout.paths.map((path) => (
          <linearGradient
            key={`${path.id}-gradient`}
            id={path.id}
            x1={path.gradient.x1}
            y1={path.gradient.y1}
            x2={path.gradient.x2}
            y2={path.gradient.y2}
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#cbd5e1" stopOpacity="0.68" />
            <stop offset="0.5" stopColor="#475569" stopOpacity="0.96" />
            <stop offset="1" stopColor="#94a3b8" stopOpacity="0.72" />
          </linearGradient>
        ))}
      </defs>

      {layout.paths.map((path) => (
        <g key={path.id}>
          <path
            d={path.d}
            stroke="rgba(15, 23, 42, 0.08)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path.d}
            stroke="rgba(100, 116, 139, 0.5)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path.d}
            stroke={`url(#${path.id})`}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="ai-connector-flow"
          />
        </g>
      ))}
    </svg>
  )
}

export const LEARN_NODE_COL_CLASS = 'flex w-[9.75rem] shrink-0 justify-center sm:w-[11.5rem] md:w-[13rem]'
export const LEARN_PATH_TRACK_CLASS = 'mx-auto w-[19.5rem] max-w-full sm:w-[23rem] md:w-[26rem]'
