import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"
import { listNavigationLinks } from "@modules/layout/navigation"

type NavProps = {
  cart?: HttpTypes.StoreCart | null
}

export default async function Nav({ cart }: NavProps) {
  const [regions, navigationLinks] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listNavigationLinks(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto h-16 border-b border-serendipity-border bg-serendipity-bg/95">
        <nav className="content-container flex h-full w-full items-center justify-between text-serendipity-primary">
          <div className="flex h-full flex-1 basis-0 items-center">
            <div className="h-full small:hidden">
              <SideMenu
                links={navigationLinks}
                regions={regions}
                locales={null}
                currentLocale={null}
              />
            </div>

            <LocalizedClientLink
              href="/"
              className="font-display text-xl tracking-tight text-serendipity-primary"
              data-testid="nav-store-link"
            >
              Serendipity
            </LocalizedClientLink>
          </div>

          <ul className="hidden items-center gap-x-8 small:flex">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <LocalizedClientLink
                  href={link.href}
                  className="text-[13px] tracking-[0.04em] text-serendipity-ink transition-colors duration-base ease-serendipity hover:text-serendipity-primary"
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-6 text-[13px] tracking-[0.04em]">
            <Search />
            <div className="hidden h-full items-center small:flex">
              <LocalizedClientLink
                className="transition-colors duration-base ease-serendipity hover:text-serendipity-primary"
                href="/account"
                data-testid="nav-account-link"
              >
                Cuenta
              </LocalizedClientLink>
            </div>
            <CartButton cart={cart} />
          </div>
        </nav>
      </header>
    </div>
  )
}
