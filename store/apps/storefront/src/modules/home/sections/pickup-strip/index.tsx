/**
 * Visual announcement only. The 5% pickup discount is commerce logic and will
 * be implemented in Medusa, never simulated in the frontend.
 */
const PickupStrip = () => {
  return (
    <section
      aria-labelledby="pickup-strip-title"
      className="border-b border-serendipity-border"
    >
      <div className="content-container flex flex-col gap-4 py-14 small:flex-row small:items-baseline small:justify-between small:py-20">
        <h2
          id="pickup-strip-title"
          className="font-display text-2xl text-serendipity-primary small:text-3xl"
        >
          Retira en Serendipity
        </h2>
        <p className="text-large-regular max-w-xl text-serendipity-muted">
          Recibe 5% de descuento al retirar tu pedido en el local.
        </p>
      </div>
    </section>
  )
}

export default PickupStrip
