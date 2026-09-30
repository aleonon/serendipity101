import { INFUSIONES_CATEGORY_HANDLE } from "@modules/layout/navigation"
import BotanicalStoryScene from "./botanical-story-scene"

const BotanicalStorySection = () => {
  return (
    <BotanicalStoryScene
      exploreHref={`/categories/${INFUSIONES_CATEGORY_HANDLE}`}
    />
  )
}

export default BotanicalStorySection
