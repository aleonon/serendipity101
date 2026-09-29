import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
    ? [...cart.items].sort((a, b) =>
        (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
      )
    : null

  return (
    <div>
      <div className="flex items-center pb-3">
        <Heading className="text-[2rem] leading-[2.75rem]">Carrito</Heading>
      </div>

      <ul className="flex flex-col gap-6 small:hidden" data-testid="cart-items-mobile">
        {items && cart
          ? items.map((item) => (
              <li key={item.id}>
                <Item
                  item={item}
                  layout="card"
                  currencyCode={cart.currency_code}
                />
              </li>
            ))
          : repeat(3).map((i) => (
              <li key={i}>
                <SkeletonLineItem />
              </li>
            ))}
      </ul>

      <div className="hidden overflow-x-auto small:block">
        <Table>
          <Table.Header className="border-t-0">
            <Table.Row className="text-ui-fg-subtle txt-medium-plus">
              <Table.HeaderCell className="!pl-0">Producto</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Cantidad</Table.HeaderCell>
              <Table.HeaderCell className="hidden small:table-cell">
                Precio
              </Table.HeaderCell>
              <Table.HeaderCell className="!pr-0 text-right">
                Subtotal
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items && cart
              ? items.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    currencyCode={cart.currency_code}
                  />
                ))
              : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
