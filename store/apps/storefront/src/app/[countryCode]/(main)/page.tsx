import { Metadata } from "next"

import BlendCTA from "@modules/home/sections/blend-cta"
import BotanicalIntro from "@modules/home/sections/botanical-intro"
import FeaturedProducts from "@modules/home/sections/featured-products"
import HeroSection from "@modules/home/sections/hero-section"
import PickupSection from "@modules/home/sections/pickup-section"

export const metadata: Metadata = {
  title: "Serendipity | Casa de té de especialidad",
  description:
    "Tés de especialidad, botánicos e infusiones creadas para encontrar algo distinto en cada taza.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  return (
    <>
      <HeroSection />
      <BotanicalIntro />
      <FeaturedProducts countryCode={countryCode} />
      <BlendCTA />
      <PickupSection />
    </>
  )
}
