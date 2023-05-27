import type { Range } from '../util/util'

const applicationConfig: Record<string, Range[]> = {
  skippedRanks: [2, 99],
  unbannableRanks: [99, [103]],
  undemotableRanks: [2, 99, [103]],
  unexilableRanks: [99, [103]],
  unpromotableRanks: [[1, 2], 99, [102]]
}

export default applicationConfig
