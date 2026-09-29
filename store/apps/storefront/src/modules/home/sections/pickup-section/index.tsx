import BotanicalRule from "@modules/design-system/components/botanical-rule"
import EditorialHeading from "@modules/design-system/components/editorial-heading"
import SceneRoot from "@modules/design-system/components/scene-root"
import SectionContainer from "@modules/design-system/components/section-container"

/**
 * Visual announcement only. The 5% pickup discount is commerce logic and will
 * be implemented in Medusa, never simulated in the frontend.
 */
const PickupSection = () => {
  return (
    <SceneRoot
      scene="pickup"
      aria-labelledby="pickup-section-title"
      className="border-b border-serendipity-border"
    >
      <SectionContainer spacing="compact">
        <BotanicalRule className="mb-10 max-w-32" />
        <div className="flex flex-col gap-5 small:flex-row small:items-baseline small:justify-between">
          <EditorialHeading
            as="h2"
            size="subsection"
            id="pickup-section-title"
          >
            Retira en Serendipity
          </EditorialHeading>
          <p className="type-body-large max-w-xl text-serendipity-muted">
            Recibe 5% de descuento al retirar tu pedido en el local.
          </p>
        </div>
      </SectionContainer>
    </SceneRoot>
  )
}

export default PickupSection
