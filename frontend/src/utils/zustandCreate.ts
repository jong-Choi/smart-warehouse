import type { StoreApi, UseBoundStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

export const createStoreWithSelectors = <T>(
  store: UseBoundStore<StoreApi<T>>
): (<K extends keyof T>(keys: K[]) => Pick<T, K>) => {
  const useStore: <K extends keyof T>(keys: K[]) => Pick<T, K> = <
    K extends keyof T
  >(
    keys: K[]
  ) => {
    return useStoreWithEqualityFn(
      store,
      (state) => {
        const selected = {} as Pick<T, K>;
        for (const key of keys) {
          selected[key] = state[key];
        }
        return selected;
      },
      shallow
    );
  };

  return useStore;
};
