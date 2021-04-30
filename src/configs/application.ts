import { Range } from '../util/util'

const applicationConfig: { [key: string]: Range[] } = {
  skippedRanks: [2, 99],
  unbannableRanks: [99, [103, undefined]],
  undemotableRanks: [2, 99, [103, undefined]],
  unexilableRanks: [99, [103, undefined]],
  unpromotableRanks: [[1, 2], 99, [102, undefined]]
}

export default applicationConfig
