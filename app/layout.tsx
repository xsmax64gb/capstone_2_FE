import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/lib/providers/redux-provider'
import { AuthProvider } from '@/lib/auth-context'
import { NotificationProvider } from '@/lib/providers/notification-provider'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Frontend Application with RTK Query & Authentication',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body>
        <ReduxProvider>
          <AuthProvider>
            {children}
            <NotificationProvider />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
