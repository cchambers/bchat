// /* eslint-disable */
import mitt from "mitt";
export const emitter = mitt();

export function useBus() {
  const bus = emitter;
  return {
    bus,
  };
}

// const baseEmit = emitter.emit;
// emitter.emit = (...args) => {
//   let event = args[0];
//   baseEmit.apply(emitter, args);

//   // Re-emit events as native for other components.
//   let data = args.slice(1);
//   data = data[0];
//   let nativeEvent = new CustomEvent(event, {
//     detail: data,
//   });
//   const emitFrom = document;
//   emitFrom.dispatchEvent(nativeEvent);
// };

const delegations = {
  click: [
    {
      target: "[close-trigger]",
      priority: 1,
      handler() {
        emitter.emit("close-modals");
      },
    },
    {
      target: "[print-trigger]",
      priority: 1,
      handler() {
        window.print();
      },
    },
    {
      target: "[emit]",
      handler(e) {
        e.preventDefault();
        let target = e.target;
        emitter.emit(target.getAttribute("emit"), {
          which: target.getAttribute("which"),
          origin: target,
        });
      },
    },
    {
      target: "[change-event]",
      handler(e) {
        let target = e.target;
        emitter.emit(target.getAttribute("change-emit"), {
          value: target.value,
          origin: target,
        });
      },
    },
  ],
  mouseover: [
    {
      target: "[hover-event]",
      handler(e) {
        let target = e.target;
        emitter.emit(target.getAttribute("hover-event"), {
          which: target.getAttribute("which"),
          origin: target,
        });
      },
    },
  ],
};
