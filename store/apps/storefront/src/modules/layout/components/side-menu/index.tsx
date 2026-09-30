"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

type MenuLink = {
  label: string
  href: string
}

type SideMenuProps = {
  links: MenuLink[]
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({
  links,
  regions,
  locales,
  currentLocale,
}: SideMenuProps) => {
  const menuLinks = [...links, { label: "Cuenta", href: "/account" }]
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="serendipity-focus relative flex h-full items-center pr-4 text-sm text-serendipity-ink"
                >
                  Menú
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="pointer-events-auto fixed inset-0 z-[50] bg-serendipity-ink/25"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="absolute inset-x-0 z-[51] m-2 flex h-[calc(100vh-1rem)] w-[min(100%-1rem,22rem)] flex-col text-sm text-serendipity-ink">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex h-full flex-col justify-between rounded-large border border-serendipity-border bg-serendipity-bg p-6"
                  >
                    <div className="flex items-center justify-between" id="xmark">
                      <p className="font-display text-xl text-serendipity-primary">
                        Serendipity
                      </p>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="serendipity-focus text-serendipity-primary"
                        aria-label="Cerrar menú"
                      >
                        <XMark />
                      </button>
                    </div>
                    <ul className="flex flex-col items-start justify-start gap-5">
                      {menuLinks.map((link) => {
                        return (
                          <li key={link.href}>
                            <LocalizedClientLink
                              href={link.href}
                              className="font-display text-3xl leading-10 text-serendipity-primary"
                              onClick={close}
                              data-testid={`${link.label.toLowerCase()}-link`}
                            >
                              {link.label}
                            </LocalizedClientLink>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="txt-compact-small flex justify-between text-serendipity-muted">
                        © {new Date().getFullYear()} Serendipity
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
