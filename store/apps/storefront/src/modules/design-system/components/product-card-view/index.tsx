import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"

type ProductCardViewProps = {
  href: string
  image?: string
  imageAlt: string
  title: string
  subtitle?: string | null
  price?: string | null
  priority?: boolean
}

/**
 * Pure visual contract for product cards. Medusa DTOs and price calculation
 * stay in the commerce adapter under modules/products.
 * The image stage uses object-contain so the product keeps its own ratio.
 */
const ProductCardView = ({
  href,
  image,
  imageAlt,
  title,
  subtitle,
  price,
  priority = false,
}: ProductCardViewProps) => {
  return (
    <LocalizedClientLink
      href={href}
      className="serendipity-focus group block h-full"
      data-testid="product-card"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-square w-full bg-serendipity-cream">
          {image ? (
            <div className="absolute inset-[10%]">
              <Image
                src={image}
                alt={imageAlt}
                fill
                priority={priority}
                sizes="(max-width: 512px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain object-center"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-serendipity-muted">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>

        <h3
          className="mt-5 font-display text-[1.35rem] leading-snug tracking-tight text-serendipity-primary"
          data-testid="product-title"
        >
          {title}
        </h3>

        {subtitle ? (
          <p className="text-small-regular mt-1 text-serendipity-muted">
            {subtitle}
          </p>
        ) : null}

        {price ? (
          <p
            className="text-small-regular mt-3 tabular-nums text-serendipity-ink"
            data-testid="product-price"
          >
            {price}
          </p>
        ) : null}
      </article>
    </LocalizedClientLink>
  )
}

export default ProductCardView
