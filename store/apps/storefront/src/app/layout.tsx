import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Fraunces, Inter } from "next/font/google"
import "../styles/globals.css"

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
})

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const SITE_TITLE = "Serendipity | Casa de té de especialidad"
const SITE_DESCRIPTION =
  "Tés de especialidad, botánicos e infusiones creadas para encontrar algo distinto en cada taza."

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "Serendipity",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/serendipity/hero/hero_serendipity101.png",
        width: 1920,
        height: 1076,
        alt: "Caja de Flores andinas con flor, hojas y abejas",
      },
    ],
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-mode="light"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body>{props.children}</body>
    </html>
  )
}
