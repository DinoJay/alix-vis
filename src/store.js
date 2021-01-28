import { writable } from "svelte/store";

function createStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    update: (n) => set(n),
    // updateNodeTypes: n=> update(u=> {...u, })
    reset: () => {},
  };
}

export const nodeTypes = createStore();
