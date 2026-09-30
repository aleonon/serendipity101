import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Eyebrow from "@modules/design-system/components/eyebrow"
import SectionContainer from "@modules/design-system/components/section-container"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { listNavigationLinks } from "@modules/layout/navigation"

const ACCOUNT_LINKS = [
  { label: "Cuenta", href: "/account" },
  { label: "Carrito", href: "/cart" },
]

export default async function Footer() {
  const navigationLinks = await listNavigationLinks()

  return (
    <footer className="w-full border-t border-serendipity-border bg-serendipity-cream">
      <SectionContainer spacing="compact" className="flex w-full flex-col">
        <div className="flex flex-col gap-y-12 pb-12 xsmall:flex-row xsmall:items-start xsmall:justify-between">
          <div>
            <LocalizedClientLink
              href="/"
              className="font-display text-4xl tracking-tight text-serendipity-primary"
            >
              Serendipity
            </LocalizedClientLink>
            <span className="mt-5 block h-px w-14 bg-serendipity-accent" />
            <p className="text-base-regular mt-5 max-w-xs leading-7 text-serendipity-muted">
              Casa de té de especialidad.
            </p>
          </div>

          <div className="text-small-regular grid grid-cols-2 gap-10 md:gap-x-16">
            <div className="flex flex-col gap-y-3">
              <Eyebrow>Tienda</Eyebrow>
              <ul className="grid grid-cols-1 gap-2">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="text-serendipity-muted transition-colors duration-base ease-serendipity hover:text-serendipity-primary"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-3">
              <Eyebrow>Tu pedido</Eyebrow>
              <ul className="grid grid-cols-1 gap-2">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="text-serendipity-muted transition-colors duration-base ease-serendipity hover:text-serendipity-primary"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-12 flex w-full flex-col gap-4 border-t border-serendipity-border pt-6 text-serendipity-muted xsmall:flex-row xsmall:items-center xsmall:justify-between">
          <p className="text-xsmall-regular">
            © {new Date().getFullYear()} Serendipity
          </p>
          <MedusaCTA />
        </div>
      </SectionContainer>
    </footer>
  )
}
