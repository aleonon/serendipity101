import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import { listNavigationLinks } from "@modules/layout/navigation"

const ACCOUNT_LINKS = [
  { label: "Cuenta", href: "/account" },
  { label: "Carrito", href: "/cart" },
]

export default async function Footer() {
  const navigationLinks = await listNavigationLinks()

  return (
    <footer className="w-full border-t border-serendipity-border">
      <div className="content-container flex w-full flex-col">
        <div className="flex flex-col gap-y-12 py-20 xsmall:flex-row xsmall:items-start xsmall:justify-between small:py-28">
          <div>
            <LocalizedClientLink
              href="/"
              className="font-display text-2xl text-serendipity-primary"
            >
              Serendipity
            </LocalizedClientLink>
            <p className="text-small-regular mt-4 max-w-xs leading-6 text-serendipity-muted">
              Casa de té de especialidad.
            </p>
          </div>

          <div className="text-small-regular grid grid-cols-2 gap-10 md:gap-x-16">
            <div className="flex flex-col gap-y-3">
              <span className="text-xsmall-regular uppercase tracking-[0.2em] text-serendipity-accent">
                Tienda
              </span>
              <ul className="grid grid-cols-1 gap-2">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="text-serendipity-muted transition-colors duration-300 hover:text-serendipity-primary"
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-3">
              <span className="text-xsmall-regular uppercase tracking-[0.2em] text-serendipity-accent">
                Tu pedido
              </span>
              <ul className="grid grid-cols-1 gap-2">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      href={link.href}
                      className="text-serendipity-muted transition-colors duration-300 hover:text-serendipity-primary"
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
      </div>
    </footer>
  )
}
