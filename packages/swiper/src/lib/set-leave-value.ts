import { MotionValue } from 'motion/react'
import { SwipeDirection } from '../api'

export const setleaveValue = (
  direction: SwipeDirection,
  leaveValue: MotionValue,
) => {
  leaveValue.set(
    direction === 'left' || direction === 'right'
      ? 2000 * (direction === 'left' ? -1 : 1)
      : 2000 * (direction === 'up' ? -1 : 1),
  )
}
