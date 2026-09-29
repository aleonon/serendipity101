"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useRouter } from "next/navigation"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  layout?: "row" | "card"
  currencyCode: string
}

const Item = ({
  item,
  type = "full",
  layout = "row",
  currencyCode,
}: ItemProps) => {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .then(() => {
        router.refresh()
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQuantity = 10

  const quantitySelect = type === "full" && (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`qty-${layout}-${item.id}`}>
        Cantidad
      </label>
      <CartItemSelect
        id={`qty-${layout}-${item.id}`}
        value={item.quantity}
        onChange={(value) => changeQuantity(parseInt(value.target.value, 10))}
        className="h-10 w-14 p-4"
        data-testid="product-select-button"
      >
        {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => (
          <option value={i + 1} key={i}>
            {i + 1}
          </option>
        ))}
      </CartItemSelect>
      {updating && <Spinner />}
    </div>
  )

  if (type === "full" && layout === "card") {
    return (
      <article
        className="flex flex-col gap-4 border-b border-serendipity-border pb-6"
        data-testid="product-row"
      >
        <div className="flex gap-4">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="w-20 shrink-0"
          >
            <Thumbnail
              thumbnail={item.thumbnail}
              images={item.variant?.product?.images}
              size="square"
            />
          </LocalizedClientLink>
          <div className="min-w-0 flex-1">
            <Text
              className="txt-medium-plus text-ui-fg-base"
              data-testid="product-title"
            >
              {item.product_title}
            </Text>
            <LineItemOptions
              variant={item.variant}
              data-testid="product-variant"
            />
            <div className="mt-2 text-small-regular text-serendipity-muted">
              <span className="mr-2">Precio</span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {quantitySelect}
          <DeleteButton id={item.id} data-testid="product-delete-button">
            Quitar
          </DeleteButton>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-small-regular text-serendipity-muted">
            Subtotal
          </span>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
        <ErrorMessage error={error} data-testid="product-error-message" />
      </article>
    )
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex items-center gap-2">
            <DeleteButton id={item.id} data-testid="product-delete-button">
              Quitar
            </DeleteButton>
            {quantitySelect}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
