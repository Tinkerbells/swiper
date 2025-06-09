import React from "react"
let nextUniqueId = 1;

export function getUniqId() {
    return `uniq-${nextUniqueId++}`;
}

export type UseUniqIdResult = string;

function useUniqIdFallback() {
    const idRef = React.useRef<string>();
    if (idRef.current === undefined) {
        idRef.current = getUniqId();
    }
    return idRef.current;
}

function useIdNative() {
    return React.useId();
}

export const useUniqId: () => UseUniqIdResult =
    typeof React.useId === 'function' ? useIdNative : useUniqIdFallback;
