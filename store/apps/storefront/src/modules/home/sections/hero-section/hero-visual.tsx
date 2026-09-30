import Image from "next/image"

const HERO_IMAGE = "/serendipity/hero/hero_serendipity101.png"
const HERO_WIDTH = 1920
const HERO_HEIGHT = 1076

const HeroVisual = () => {
  return (
      <Image
      src={HERO_IMAGE}
      alt="Caja de Flores andinas con flor, hojas y abejas"
      width={HERO_WIDTH}
      height={HERO_HEIGHT}
      priority
      quality={85}
      sizes="(min-width: 1024px) 55vw, 100vw"
      className="h-auto w-full"
    />
  )
}

export default HeroVisual
