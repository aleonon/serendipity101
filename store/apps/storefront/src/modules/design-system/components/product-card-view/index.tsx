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
  featured?: boolean
}

/**
 * Pure visual contract for product cards. Medusa DTOs and price calculation
 * stay in the commerce adapter under modules/products.
 */
const ProductCardView = ({
  href,
  image,
  imageAlt,
  title,
  subtitle,
  price,
  priority = false,
  featured = false,
}: ProductCardViewProps) => {
  return (
    <LocalizedClientLink
      href={href}
      className="serendipity-focus group block h-full"
      data-testid="product-card"
    >
      <article
        className={`flex h-full flex-col p-3 small:p-4 ${featured ? "bg-serendipity-surface" : "bg-serendipity-cream"}`}
      >
        <div
          className={`relative w-full overflow-hidden bg-serendipity-sage-soft ${featured ? "aspect-[5/4]" : "aspect-[4/5]"}`}
        >
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center motion-safe:transition-transform motion-safe:duration-slow motion-safe:ease-serendipity motion-safe:group-hover:scale-[1.035]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-serendipity-muted">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>

        <h3
          className="type-display-subsection mt-5 text-serendipity-primary"
          data-testid="product-title"
        >
          {title}
        </h3>

        {subtitle && (
          <p className="text-small-regular mt-1 text-serendipity-muted">
            {subtitle}
          </p>
        )}

        {price && (
          <p
            className="text-base-regular mt-auto pt-4 tabular-nums text-serendipity-accent"
            data-testid="product-price"
          >
            {price}
          </p>
        )}
      </article>
    </LocalizedClientLink>
  )
}

export default ProductCardView
