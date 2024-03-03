// @ts-check
import { getScaleFromDimensions, observeIntersection } from './utils.js';

/** @type {import('./responsive-video-mixin.js').ResponsiveVideoMixin} ResponsiveVideoMixin */
export const ResponsiveVideoMixin = (superclass) => {
  const template = globalThis.document?.createElement('template');

  if (template) {
    template.innerHTML =
      superclass.template.innerHTML +
      /*html*/ `
      <style>
        :host {
          display: grid;
        }

        slot[name=media] > *,
        ::slotted([slot=media]),
        ::slotted([slot=poster]) {
          grid-area: 1 / 1;
        }

        ::slotted([slot=media]) {
          width: 100%;
        }

        ::slotted([slot=poster]) {
          pointer-events: none;
          width: 100%;
          z-index: 1;
        }
      </style>
      <slot name="poster"></slot>
    `;
  }

  // @ts-ignore
  return class ResponsiveVideo extends superclass {
    static template = template;

    static get observedAttributes() {
      return [...super.observedAttributes, 'srcset', 'loading', 'autopause', 'autoplay'];
    }

    #optimalRendition;
    #intersectionEntry;

    constructor() {
      super();

      this.videoRenditions.addEventListener('change', this);

      observeIntersection(this, this.#handleIntersection);
    }

    #handleIntersection = (entry) => {
      this.#intersectionEntry = entry;
      this.#checkIntersection();
    };

    #checkIntersection() {
      if (this.#intersectionEntry?.isIntersecting) {
        if (!this.nativeEl.src && this.loading === 'lazy' && this.#optimalRendition) {
          if (this.nativeEl.src !== this.#optimalRendition.src) {
            this.nativeEl.src = this.#optimalRendition.src;
          }
        }

        if (this.autoplay && this.autopause) {
          if (this.paused && this.#intersectionEntry.intersectionRatio >= 0.25) {
            this.play();
          } else if (!this.paused && this.#intersectionEntry.intersectionRatio < 0.25) {
            this.pause();
          }
        }
      }
    }

    handleEvent(event) {
      super.handleEvent?.(event);

      switch (event.type) {
        case 'playing':
        case 'loadstart': {
          this.#togglePoster();
          break;
        }
        case 'change': {
          this.#switchRendition();
          break;
        }
        case 'slotchange':
          this.#handleSlotChange(event);
          break;
        case 'resize':
          this.#updateRendition();
          break;
      }
    }

    #togglePoster() {
      const hasProgress = this.currentTime > 0 || !this.paused;

      this.shadowRoot?.querySelector('[name=poster]')?.toggleAttribute('hidden', hasProgress);
    }

    #handleSlotChange(event) {
      const { target } = event;

      if (target.localName === 'slot' && !target.name) {
        this.load();
      }
    }

    #findVideoRenditions() {
      const matchingSource = this.#getMatchingSource();
      if (matchingSource?.src) {
        return [{ src: matchingSource.src }];
      }

      /** @type {string | undefined} */
      let srcset = matchingSource?.srcset;
      if (!srcset) return '';

      return getParsedSet(srcset, this.width, this.height);
    }

    #getMatchingSource() {
      if (this.src || this.srcset) return this;

      /** @type {HTMLSlotElement | undefined | null} */
      const defaultSlot = this.shadowRoot?.querySelector('slot:not([name])');
      const assignedElements = defaultSlot?.assignedElements({ flatten: true });

      const sources = /** @type {HTMLSourceElement[] | undefined} */ (
        assignedElements?.filter((el) => el.localName === 'source')
      );

      return sources?.find((el) => globalThis.matchMedia(el.media).matches);
    }

    #updateRendition() {
      for (const rendition of this.videoRenditions) {
        if (this.currentSrc === rendition.src) {
          rendition.width = this.videoWidth;
          rendition.height = this.videoHeight;
        }
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const allowAutoplay = !(this.autoplay && this.autopause);

      if (name != 'src' && (name !== 'autoplay' || allowAutoplay)) {
        super.attributeChangedCallback(name, oldValue, newValue);
      }

      if ((name === 'srcset' || name === 'src') && oldValue !== newValue) {
        this.load();
      }
    }

    async load() {
      let videoTrack = this.videoTracks.getTrackById('main');

      if (!videoTrack) {
        videoTrack = this.addVideoTrack('main');
        videoTrack.id = 'main';
        videoTrack.selected = true;
      }

      for (const rendition of this.videoRenditions) {
        videoTrack.removeRendition(rendition);
      }

      const renditions = this.#findVideoRenditions();

      for (const [i, rendition] of Object.entries(renditions)) {
        const videoRendition = videoTrack.addRendition(
          rendition.src,
          rendition.width,
          rendition.height
        );
        videoRendition.id = `${i}`;
      }

      this.#optimalRendition = findOptimalRendition(
        this.videoRenditions,
        this.clientWidth,
        this.clientHeight
      );

      if (this.loading === 'eager') {
        if (this.nativeEl.src !== this.#optimalRendition.src) {
          this.nativeEl.src = this.#optimalRendition.src;
        }
      }

      this.#checkIntersection();
    }

    #switchRendition() {
      const index = this.videoRenditions.selectedIndex;
      const rendition = this.videoRenditions[index];

      if (rendition?.src) {
        const prevCurrentTime = this.currentTime;
        const prevPaused = this.paused;
        this.nativeEl.src = rendition.src;
        this.currentTime = prevCurrentTime;
        if (!prevPaused) this.play();
      }
    }

    get src() {
      return this.getAttribute('src') ?? '';
    }

    set src(val) {
      if (this.src == val) return;
      this.setAttribute('src', `${val}`);
    }

    get srcset() {
      return this.getAttribute('srcset') ?? '';
    }

    set srcset(val) {
      if (this.srcset == val) return;
      this.setAttribute('srcset', `${val}`);
    }

    get loading() {
      return this.getAttribute('loading') ?? 'eager';
    }

    set loading(val) {
      if (this.loading == val) return;
      this.setAttribute('loading', val);
    }

    get autopause() {
      return this.hasAttribute('autopause');
    }

    set autopause(val) {
      if (this.autopause == val) return;
      this.toggleAttribute('autopause', Boolean(val));
    }
  };
};

function findOptimalRendition(videoRenditions, clientWidth, clientHeight) {
  const renditionsWithScale = [...videoRenditions]
    .map((rendition) => ({
      ...rendition,
      scale: getScaleFromDimensions(clientWidth, clientHeight, rendition.width, rendition.height),
    }))
    // Sort by scale ascending.
    .sort((a, b) => a.scale - b.scale);

  // Ideally find a rendition w/ scale > 1 for sufficient quality.
  // It should probably be more than 1 for videos below 1080p because
  // a 540p video looks better than a 360p video in a 640x360 box.
  let rendition = renditionsWithScale.find(({ scale }) => scale > 1);

  // If using pixel density descriptors.
  if (!rendition) {
    const devicePixelRatio = globalThis.devicePixelRatio ?? 1;
    rendition = renditionsWithScale.find(({ pixelRatio }) => pixelRatio >= devicePixelRatio);
  }

  // Fallback to the highest rendition available.
  if (!rendition) rendition = renditionsWithScale.pop();

  return rendition;
}

function getParsedSet(srcset, width, height) {
  // https://stream.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/high.mp4 1920w,
  // https://stream.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/high.mp4 2x
  const setRegex = /([^\s]+)(?:\s((\d+)([wx])))?\s*?(,|"|$)/gi;
  const parsedSet = [...srcset.matchAll(setRegex)];

  // default to 16 / 9 aspect ratio
  let aspectRatio = 16 / 9;
  // accurate aspect ratio if a width and height attribute is provided
  if (width > 0 && height > 0) {
    aspectRatio = width / height;
  }

  return parsedSet.map(([, src, descriptor, dval, dunit]) => {
    const width = dunit === 'w' ? +dval : undefined;
    const height = width ? width / aspectRatio : undefined;
    return {
      pixelRatio: dunit === 'x' ? +dval : undefined,
      src,
      descriptor,
      width,
      height,
    };
  });
}
