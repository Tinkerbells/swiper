import { MotionValue, PanInfo } from 'motion/react'
import {  ReactNode } from 'react'

export type SwipeDirection = 'right' | 'left' | 'up' | 'down'

export type SwipeType = {
  direction: SwipeDirection
  children: ReactNode
}

export type SwiperProviderProps = {
  onSwipe: (swipe: SwipeType) => void
  offsetBoundary?: number
}

export type SwiperItemContextType = {
  x: MotionValue
  y: MotionValue
  offsetBoundary: number
}

export type SwiperContextType = {
  leaveX: MotionValue
  leaveY: MotionValue
  offsetBoundary: number
}

export type SwiperActionsType = {
  handleSwipe: (direction: SwipeDirection) => void
  onDrag?: (event: PointerEvent, info: PanInfo) => void
}
