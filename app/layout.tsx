import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ReduxProvider } from "@/lib/providers/redux-provider";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/providers/notification-provider";
import { I18nProvider } from "@/lib/i18n/context";
import { GlobalLanguageFab } from "@/components/layouts/global-language-fab";
import { LevelProvider } from "@/contexts/level-context";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "SmartLingo",
  description: "Frontend Application with RTK Query & Authentication",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
      </head>
      <body className={poppins.variable} suppressHydrationWarning>
        <ReduxProvider>
          <I18nProvider>
            <AuthProvider>
              <LevelProvider>
                {children}
                <NotificationProvider />
                <GlobalLanguageFab />
              </LevelProvider>
            </AuthProvider>
          </I18nProvider>
        </ReduxProvider>
        <Analytics />
      </body>
    </html>
  );
}
