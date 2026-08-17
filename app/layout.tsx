import type { Metadata } from "next";
import { Geist, Geist_Mono, Zen_Maru_Gothic } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { LocalDevTools } from "@/components/dev/LocalDevTools";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/config/app";
import { DEFAULT_LOCALE, LOCALE_HTML_LANG } from "@/lib/i18n/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} | ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={LOCALE_HTML_LANG[DEFAULT_LOCALE]}
      className={`${geistSans.variable} ${geistMono.variable} ${zenMaruGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-[#3b2a22]">
        <LocaleProvider locale={DEFAULT_LOCALE}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <LocalDevTools />
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
