import { useCallback, useReducer, useRef } from 'react'
import {
  SwipeDirection,
  SwiperAction,
  SwiperActionTypes,
  SwiperState,
} from '../api'
import { SwiperRef } from '../ui'

const reducer = (state: SwiperState, action: SwiperAction): SwiperState => {
  switch (action.type) {
    case SwiperActionTypes.SET_DISABLED:
      console.log('@payload: ', action.payload)
      return { ...state, disabled: action.payload }
    case SwiperActionTypes.SET_REDO_DISABLED:
      return { ...state, disabledRedo: action.payload }
    case SwiperActionTypes.SET_UNDO_DISABLED:
      return { ...state, disabledUndo: action.payload }
    default:
      return state
  }
}

export const useSwiper = () => {
  const ref = useRef<SwiperRef>(null)
  const [state, dispatch] = useReducer<
    React.Reducer<SwiperState, SwiperAction>
  >(reducer, {
    disabled: false,
    disabledRedo: true,
    disabledUndo: true,
  })

  const swipe = useCallback(
    (direction: SwipeDirection) => ref.current?.swipe(direction),
    [ref],
  )

  const redo = useCallback(() => ref.current?.redo(), [ref])

  const undo = useCallback(() => ref.current?.undo(), [ref])

  const reset = useCallback(() => ref.current?.reset(), [ref])

  const { disabled, disabledRedo, disabledUndo } = state

  const swiper = {
    disabled,
    disabledRedo,
    disabledUndo,
    ref,
    dispatch,
    swipe,
    reset,
    undo,
    redo,
  }

  return swiper
}
