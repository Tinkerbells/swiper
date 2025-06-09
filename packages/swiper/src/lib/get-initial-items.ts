import { Children, ReactElement, ReactNode, isValidElement } from 'react'

export const getInitialItems = (children: ReactNode) => {
  return Children.toArray(children).filter(isValidElement) as ReactElement[]
}
