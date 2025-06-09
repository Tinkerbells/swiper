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
  useState,
  useRef,
  Dispatch,
  useEffect,
} from 'react'
import {
  SwipeDirection,
  SwipeType,
  SwiperAction,
  SwiperActionTypes,
  SwiperActionsType,
  SwiperContextType,
} from '../api'
import { HISTORY_DEPTH, ITEMS_PER_VIEW, OFFSET_BOUNDARY } from '../config'
import { getInitialItems, setleaveValue } from '../lib'
import { SwiperItem } from './swiper-item'
import clsx from 'clsx'

export const SwiperContext = createContext<SwiperContextType | null>(null)
export const SwiperActionContext = createContext<SwiperActionsType | null>(null)

interface SwiperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  onDrag?: (_e: any, info: PanInfo) => void
  onSwipe?: (swipe: SwipeType) => void
  offsetBoundary?: number
  itemsPerView?: number
  history?: boolean
  historyDepth?: number
  dispatch?: Dispatch<SwiperAction>
}

export interface SwiperRef {
  swipe: (direction: SwipeDirection) => void
  undo: () => void
  redo: () => void
  reset: () => void
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
      historyDepth = HISTORY_DEPTH,
      history = false,
      dispatch,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null)

    const leaveX = useMotionValue(0)
    const leaveY = useMotionValue(0)

    const [currentIndex, setCurrentIndex] = useState(0)
    const [items, setItems] = useState<ReactElement[]>(
      getInitialItems(children),
    )

    const [historyState, setHistoryState] = useState<
      { items: ReactElement[]; direction: SwipeDirection | null }[]
    >(history ? [{ items: getInitialItems(children), direction: null }] : [])
    const [redoStack, setRedoStack] = useState<
      { items: ReactElement[]; direction: SwipeDirection | null }[]
    >([])

    const leaveMap = useMemo(
      () => ({
        right: leaveX,
        left: leaveX,
        up: leaveY,
        down: leaveY,
      }),
      [leaveX, leaveY],
    )

    useEffect(() => {
      if (dispatch) {
        dispatch({
          type: SwiperActionTypes.SET_UNDO_DISABLED,
          payload: historyState.length <= 1,
        })
        dispatch({
          type: SwiperActionTypes.SET_REDO_DISABLED,
          payload: redoStack.length <= 0,
        })
        dispatch({
          type: SwiperActionTypes.SET_DISABLED,
          payload: items.length === 0,
        })
      }
    }, [historyState, redoStack, items, dispatch])

    const handleSwipe = useCallback(
      (direction: SwipeDirection) => {
        if (items.length === 0) return
        const currentItem = items[currentIndex]
        onSwipe &&
          onSwipe({
            direction,
            id: currentIndex,
            children: currentItem,
          })

        setleaveValue(direction, leaveMap[direction])

        if (history) {
          setHistoryState(prevHistory => {
            const newHistory = [...prevHistory, { items, direction }]
            console.log(newHistory)
            return newHistory.length > historyDepth + 1
              ? newHistory.slice(1)
              : newHistory
          })
          setRedoStack([])
        }

        setItems(prevItems => prevItems.slice(1))
        setCurrentIndex(prevIndex => prevIndex + 1)
      },
      [onSwipe, items, currentIndex, leaveMap, history, historyDepth],
    )

    const handleUndo = useCallback(() => {
      if (!history) {
        console.warn(
          'To enable undo, redo, and reset functionality in Swiper, ensure that the history prop is passed correctly. This will allow for tracking navigation history and enable restoring previous states.',
        )
      }
      if (historyState.length > 1) {
        setRedoStack(prevRedoStack => [
          {
            items,
            direction: historyState[historyState.length - 1].direction,
          },
          ...prevRedoStack,
        ])
        const previousState = historyState[historyState.length - 1]
        setHistoryState(prevHistory => prevHistory.slice(0, -1)) // Remove the last state
        setItems(previousState.items)
        setCurrentIndex(prevIndex => prevIndex - 1)
      }
    }, [history, historyState, items])

    const handleRedo = useCallback(() => {
      if (!history) {
        console.warn(
          'To enable undo, redo, and reset functionality in Swiper, ensure that the history prop is passed correctly. This will allow for tracking navigation history and enable restoring previous states.',
        )
      }
      if (redoStack.length > 0) {
        const nextState = redoStack[0]
        setHistoryState(prevHistory => [
          ...prevHistory,
          { items, direction: nextState.direction },
        ])
        setItems(nextState.items)
        setRedoStack(prevRedoStack => prevRedoStack.slice(1))
        setCurrentIndex(prevIndex => prevIndex + 1)

        if (nextState.direction) {
          setleaveValue(nextState.direction, leaveMap[nextState.direction])
        }
      }
    }, [history, redoStack, items, leaveMap])

    const handleReset = useCallback(() => {
      if (!history) {
        console.warn(
          'To enable undo, redo, and reset functionality in Swiper, ensure that the history prop is passed correctly. This will allow for tracking navigation history and enable restoring previous states.',
        )
        return
      }
      const initialItems = getInitialItems(children)
      setItems(initialItems)
      setCurrentIndex(0)
      setHistoryState([{ items: initialItems, direction: null }])
      setRedoStack([])
    }, [children, history])

    useImperativeHandle(
      ref,
      () => ({
        swipe: handleSwipe,
        undo: handleUndo,
        redo: handleRedo,
        reset: handleReset,
        disabled: historyState.length === 1,
        ...internalRef.current,
      }),
      [handleSwipe, handleUndo, handleRedo, handleReset, historyState],
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
      if (dispatch) {
        dispatch({
          type: SwiperActionTypes.SET_DISABLED,
          payload: false,
        })
      }
      leaveX.set(0)
      leaveY.set(0)
    }, [leaveX, leaveY, dispatch])

    const displayedItems = items.slice(0, itemsPerView)

    const onAnimationStart = useCallback(() => {
      if (dispatch) {
        dispatch({
          type: SwiperActionTypes.SET_DISABLED,
          payload: true,
        })
      }
    }, [dispatch])

    return (
      <SwiperContext.Provider value={value}>
        <SwiperActionContext.Provider value={actions}>
          <div
            ref={internalRef}
            className={clsx(
              className,
              styles.swiper,
            )}
            {...props}
          >
            <AnimatePresence onExitComplete={onExitComplete} initial={false}>
              {displayedItems.map((item, index) => {
                const zIndex = items.length - index
                const key = `swiper-item-${item.key}`
                if (index === 0) {
                  return (
                    <SwiperItem
                      onAnimationStart={onAnimationStart}
                      id={index}
                      zIndex={zIndex}
                      key={key}
                    >
                      {item}
                    </SwiperItem>
                  )
                }
                return (
                  <div
                    style={{ zIndex }}
                    className="absolute"
                    key={key}
                    data-testid="notactive-card"
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
