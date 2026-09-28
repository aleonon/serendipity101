import { Suspense } from "react"

import { getLocale } from "@lib/data/locale-actions"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"
import { listNavigationLinks } from "@modules/layout/navigation"

export default async function Nav() {
  const [regions, locales, currentLocale, navigationLinks] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listNavigationLinks(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto h-16 border-b border-serendipity-border bg-serendipity-bg/95 backdrop-blur duration-200">
        <nav className="content-container text-small-regular flex h-full w-full items-center justify-between text-serendipity-primary">
          <div className="flex h-full flex-1 basis-0 items-center gap-x-5">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
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
                  className="border-b border-transparent pb-0.5 transition-colors duration-300 hover:border-serendipity-primary"
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-6">
            <Search />
            <div className="hidden h-full items-center gap-x-6 small:flex">
              <LocalizedClientLink
                className="transition-colors duration-300 hover:text-serendipity-accent"
                href="/account"
                data-testid="nav-account-link"
              >
                Cuenta
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 transition-colors duration-300 hover:text-serendipity-accent"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Carrito (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
