// @ts-check
import { CustomVideoElement } from 'custom-media-element';
import { MediaTracksMixin } from 'media-tracks';
import { ResponsiveVideoMixin } from './responsive-video-mixin.js';

export const ResponsiveVideoElement = ResponsiveVideoMixin(MediaTracksMixin(CustomVideoElement));

if (globalThis.customElements && !globalThis.customElements.get('responsive-video')) {
  globalThis.customElements.define('responsive-video', ResponsiveVideoElement);
}
