import type { StoreApi, UseBoundStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

export const createStoreWithSelectors = <T>(
  store: UseBoundStore<StoreApi<T>>
): (<K extends keyof T>(keys: K[]) => Pick<T, K>) => {
  const useStore: <K extends keyof T>(keys: K[]) => Pick<T, K> = <
    K extends keyof T
  >(
    keys: K[]
  ) => {
    return store(
      useShallow((state: T) => {
        const selected = {} as Pick<T, K>;
        for (const key of keys) {
          selected[key] = state[key];
        }
        return selected;
      })
    );
  };

  return useStore;
};
