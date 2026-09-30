/** Internal promotion identity. Customers do not type this code. */
export const PICKUP_PROMOTION_CODE = "SERENDIPITY_PICKUP_5"

/** Medusa fulfillment set type. The storefront already splits options on this. */
export const PICKUP_FULFILLMENT_SET_TYPE = "pickup"

/** Shipping option type code. Structural signal, independent of the visible name. */
export const PICKUP_OPTION_TYPE_CODE = "pickup"

/**
 * Cart context attribute evaluated by the Promotion Module.
 * `in` matches when any selected shipping method uses one of the values.
 */
export const PICKUP_RULE_ATTRIBUTE = "shipping_methods.shipping_option_id"

export const PICKUP_DISCOUNT_RATE = 0.05

export const PICKUP_OPTION_NAME = "Retiro en Serendipity"
export const PICKUP_SET_NAME = "Serendipity Pickup"
/** Distinct from the delivery zone name. Service zone names are unique. */
export const PICKUP_ZONE_NAME = "Retiro Serendipity"
