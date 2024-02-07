
// Use 1 resize observer instance for many elements for best performance.
// https://groups.google.com/a/chromium.org/g/blink-dev/c/z6ienONUb5A/m/F5-VcUZtBAAJ

const resizeCallbacksMap = new WeakMap();

const getResizeCallbacks = (element) => {
  let callbacks = resizeCallbacksMap.get(element);
  if (!callbacks) resizeCallbacksMap.set(element, (callbacks = new Set()));
  return callbacks;
};

const resizeObserver = new globalThis.ResizeObserver((entries) => {
  for (let entry of entries) {
    for (let callback of getResizeCallbacks(entry.target)) {
      callback(entry);
    }
  }
});

export function observeResize(element, callback) {
  getResizeCallbacks(element).add(callback);
  resizeObserver.observe(element);
}

export function unobserveResize(element, callback) {
  const callbacks = getResizeCallbacks(element);
  callbacks.delete(callback);

  if (!callbacks.size) {
    resizeObserver.unobserve(element);
  }
}

// Do the same for IntersectionObserver

const intersectionCallbacksMap = new WeakMap();

const getIntersectionCallbacks = (element) => {
  let callbacks = intersectionCallbacksMap.get(element);
  if (!callbacks) intersectionCallbacksMap.set(element, (callbacks = new Set()));
  return callbacks;
};

const intersectionObserver = new globalThis.IntersectionObserver((entries) => {
  for (let entry of entries) {
    for (let callback of getIntersectionCallbacks(entry.target)) {
      callback(entry);
    }
  }
}, { threshold: [0, 0.25, 0.5, 0.75, 1] });

export function observeIntersection(element, callback) {
  getIntersectionCallbacks(element).add(callback);
  intersectionObserver.observe(element);
}

export function unobserveIntersection(element, callback) {
  const callbacks = getIntersectionCallbacks(element);
  callbacks.delete(callback);

  if (!callbacks.size) {
    intersectionObserver.unobserve(element);
  }
}

export function getScaleFromDimensions(
  containerWidth,
  containerHeight,
  videoWidth,
  videoHeight
) {
  // get the width and height of the video content that fits in the container
  const videoRatio = videoWidth / videoHeight;
  const visibleWidth = Math.min(containerHeight * videoRatio, containerWidth);
  const visibleHeight = Math.min(containerWidth / videoRatio, containerHeight);

  // for displays w/ high pixel density require more pixels to pass quality test
  const pixelRatio = globalThis.devicePixelRatio ?? 1;
  const totalView = visibleWidth * pixelRatio * visibleHeight * pixelRatio;
  const totalVideo = videoWidth * videoHeight;

  return totalVideo / totalView;
}
