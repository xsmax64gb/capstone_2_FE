import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/providers/redux-provider";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/providers/notification-provider";
import { I18nProvider } from "@/lib/i18n/context";
import { GlobalLanguageFab } from "@/components/layouts/global-language-fab";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "My App",
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
    <html lang="vi">
      <body className={poppins.variable}>
        <ReduxProvider>
          <I18nProvider>
            <AuthProvider>
              {children}
              <NotificationProvider />
              <GlobalLanguageFab />
            </AuthProvider>
          </I18nProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
