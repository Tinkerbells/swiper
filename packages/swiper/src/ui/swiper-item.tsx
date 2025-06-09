import styles from "./swiper.module.css"
import {
  HTMLMotionProps,
  PanInfo,
  easeInOut,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react'
import {
  useCallback,
  useMemo,
  forwardRef,
  createContext,
  memo,
} from 'react'
import { SwipeDirection, SwiperItemContextType } from '../api'
import { getDirection, useSwiperContext, useSwiperContextActions } from '../lib'
import clsx from 'clsx'

export const SwiperItemContext = createContext<SwiperItemContextType | null>(
  null,
)

export interface SwiperItemProps extends Omit<HTMLMotionProps<'div'>, 'id'> {
  zIndex?: number
  id: number
  /** Disable swipe interactions for this item */
  disabled?: boolean
  /** Custom scale factor for drag effect */
  dragScale?: number
}

export const SwiperItem = memo(forwardRef<HTMLDivElement, SwiperItemProps>(
  ({ 
    zIndex: index, 
    children, 
    className, 
    id, 
    disabled = false,
    dragScale = 1.05,
    ...props 
  }, ref) => {
    const { leaveX, leaveY, offsetBoundary } = useSwiperContext()
    const { handleSwipe, onDrag } = useSwiperContextActions()
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Memoize transforms for better performance
    const rotate = useTransform(
      x,
      [-offsetBoundary, 0, offsetBoundary],
      [15, 0, -15],
    )

    // Memoize motion props to prevent unnecessary re-renders
    const dragConstraints = useMemo(() => ({ 
      left: 0, 
      right: 0, 
      top: 0, 
      bottom: 0 
    }), [])

    const dragTransition = useMemo(() => ({
      bounceStiffness: 1000,
      bounceDamping: 10,
    }), [])

    const whileDrag = useMemo(() => ({ 
      scale: dragScale 
    }), [dragScale])

    const exitTransition = useMemo(() => ({ 
      duration: 0.4, 
      ease: easeInOut 
    }), [])

    const onSwipe = useCallback(
      (direction: SwipeDirection) => {
        if (disabled) return
        handleSwipe(direction)
      },
      [handleSwipe, disabled],
    )

    const handleDrag = useCallback(
      (event: PointerEvent, info: PanInfo) => {
        if (disabled) return
        onDrag?.(event, info)
      },
      [onDrag, disabled],
    )

    const onDragEnd = useCallback(
      (_event: PointerEvent, info: PanInfo) => {
        if (disabled) return
        
        const { offset } = info
        const direction = getDirection(offset, offsetBoundary * 2)
        
        switch (direction) {
          case 'right':
            onSwipe('right')
            break
          case 'left':
            onSwipe('left')
            break
          case 'down':
            onSwipe('down')
            break
          case 'up':
            onSwipe('up')
            break
          default:
            break
        }
      },
      [onSwipe, offsetBoundary, disabled],
    )

    const contextValue = useMemo(
      () => ({
        x,
        y,
        offsetBoundary,
      }),
      [x, y, offsetBoundary],
    )

    return (
      <SwiperItemContext.Provider value={contextValue}>
        <motion.div
          onAnimationStart={props.onAnimationStart}
          drag={!disabled}
          ref={ref}
          animate={{ scale: 1 }}
          dragElastic={0.6}
          dragConstraints={dragConstraints}
          dragTransition={dragTransition}
          whileDrag={whileDrag}
          onDrag={handleDrag}
          onDragEnd={onDragEnd}
          initial={{ scale: 0.8 }}
          style={{
            x,
            y,
            rotate,
            zIndex: index,
          }}
          exit={{
            x: leaveX.get(),
            y: leaveY.get(),
            opacity: 0,
            scale: 0,
            transition: exitTransition,
          }}
          data-testid="active-card"
          className={clsx(
            styles.swiperItem, 
            { [styles.disabled]: disabled },
            className
          )}
          role="img"
          aria-label={`Swipeable item ${id + 1}`}
          tabIndex={disabled ? -1 : 0}
          {...props}
        >
          {children}
        </motion.div>
      </SwiperItemContext.Provider>
    )
  },
))

SwiperItem.displayName = 'SwiperItem'
