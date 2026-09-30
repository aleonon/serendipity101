export const storefrontCountryCode = (
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "ec"
).toLowerCase()

export const allowedCountryCodes = (
  codes: Array<string | null | undefined>
) =>
  codes.filter(
    (code): code is string =>
      typeof code === "string" && code.toLowerCase() === storefrontCountryCode
  )
