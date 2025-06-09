import { useCallback, useRef } from 'react'
import {
  SwipeDirection,
} from '../api'
import { SwiperRef } from '../ui'


export const useSwiper = () => {
  const ref = useRef<SwiperRef>(null)
  const swipe = useCallback(
    (direction: SwipeDirection) => ref.current?.swipe(direction),
    [ref],
  )

  const swiper = {
    ref,
    swipe,
  }

  return swiper
}
