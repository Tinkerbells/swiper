import styles from "./swiper.module.css"
import { AnimatePresence, PanInfo, useMotionValue } from 'motion/react'
import  {
  HTMLAttributes,
  ReactElement,
  createContext,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  Children,
  isValidElement,
} from 'react'
import {
  SwipeDirection,
  SwipeType,
  SwiperActionsType,
  SwiperContextType,
} from '../api'
import {  ITEMS_PER_VIEW, OFFSET_BOUNDARY } from '../config'
import {  setleaveValue } from '../lib'
import { SwiperItem } from './swiper-item'
import clsx from 'clsx'
import { useUniqId } from "../lib/use-unique-id"

export const SwiperContext = createContext<SwiperContextType | null>(null)
export const SwiperActionContext = createContext<SwiperActionsType | null>(null)

interface SwiperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  /** Callback fired when an item is swiped */
  onSwipe?: (swipe: SwipeType) => void
  /** Callback fired during drag */
  onDrag?: (event: PointerEvent, info: PanInfo) => void
  /** Distance threshold for triggering a swipe */
  offsetBoundary?: number
  /** Number of items visible in the stack */
  itemsPerView?: number
  /** Disable all swipe interactions */
  disabled?: boolean
}

export interface SwiperRef {
  swipe: (direction: SwipeDirection) => void
}

export const Swiper = forwardRef<SwiperRef, SwiperProps>(
  (
    {
      children,
      className,
      onDrag,
      onSwipe,
      offsetBoundary = OFFSET_BOUNDARY,
      itemsPerView = ITEMS_PER_VIEW,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const swiperId = useUniqId()
    const internalRef = useRef<HTMLDivElement>(null)

    const leaveX = useMotionValue(0)
    const leaveY = useMotionValue(0)

    const items = useMemo(() => {
          return Children.toArray(children).filter(isValidElement) as ReactElement[]
        }, [children])


    const leaveMap = useMemo(
      () => ({
        right: leaveX,
        left: leaveX,
        up: leaveY,
        down: leaveY,
      }),
      [leaveX, leaveY],
    )

    const handleSwipe = useCallback(
      (direction: SwipeDirection) => {
        if (disabled || items.length === 0) return
        onSwipe &&
          onSwipe({
            direction,
            children: items[0],
          })

        setleaveValue(direction, leaveMap[direction])
      },
      [onSwipe, items,  leaveMap],
    )

    useImperativeHandle(
      ref,
      () => ({
        swipe: handleSwipe,
      }),
      [handleSwipe],
    )

    const value = useMemo(
      () => ({
        leaveX,
        leaveY,
        offsetBoundary,
      }),
      [leaveX, leaveY, offsetBoundary],
    )

    const actions = useMemo(
      () => ({
        onDrag,
        handleSwipe,
      }),
      [handleSwipe, onDrag],
    )

    const onExitComplete = useCallback(() => {
      leaveX.set(0)
      leaveY.set(0)
    }, [leaveX, leaveY ])

    const displayedItems = items.slice(0, itemsPerView)

    const onAnimationStart = useCallback(() => {
    }, [])


    return (
      <SwiperContext.Provider value={value}>
        <SwiperActionContext.Provider value={actions}>
          <div
            ref={internalRef}
            className={clsx(
              className,
              styles.swiper,
              { [styles.disabled]: disabled }
            )}
            {...props}
          >
            <AnimatePresence onExitComplete={onExitComplete} initial={false}>
              {displayedItems.map((item, index) => {
                const zIndex = items.length - index
                if (index === 0) {
                  return (
                    <SwiperItem
                      onAnimationStart={onAnimationStart}
                      id={index}
                      zIndex={items.length - index}
                      key={`${swiperId}-${item.key}`}
                    >
                      {item}
                    </SwiperItem>
                  )
                }
                return (
                  <div
                    style={{ zIndex }}
                    className={styles.backgroundItem}
                    key={`${swiperId}-${item.key}`}
                    data-testid="background-card"
                  >
                    {item}
                  </div>
                )
              })}
            </AnimatePresence>
          </div>
        </SwiperActionContext.Provider>
      </SwiperContext.Provider>
    )
  },
)

Swiper.displayName = 'Swiper'
