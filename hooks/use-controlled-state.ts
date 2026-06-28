import * as React from "react";

type CommonControlledStateProps<T> = {
  value?: T;
  defaultValue?: T;
};

// Mirrors a controlled value when provided, otherwise keeps its own internal
// state — the standard "controlled or uncontrolled" pattern in one hook.
export const useControlledState = <T, Rest extends unknown[] = []>(
  props: CommonControlledStateProps<T> & {
    onChange?: (value: T, ...args: Rest) => void;
  },
): readonly [T, (next: T, ...args: Rest) => void] => {
  const { value, defaultValue, onChange } = props;
  const isControlled = value !== undefined;

  const [internalState, setInternalState] = React.useState<T>(
    defaultValue as T,
  );
  const state = isControlled ? value : internalState;

  const setState = React.useCallback(
    (next: T, ...args: Rest) => {
      if (!isControlled) setInternalState(next);
      onChange?.(next, ...args);
    },
    [isControlled, onChange],
  );

  return [state, setState] as const;
};
