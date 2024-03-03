import type { CustomVideoElement } from 'custom-media-element';
import type { MediaTracks } from 'media-tracks';
import type { ResponsiveVideo } from './responsive-video-mixin.js';

export interface ResponsiveVideoElement extends CustomVideoElement, MediaTracks, ResponsiveVideo {}

declare global {
  interface HTMLElementTagNameMap {
    'responsive-video': ResponsiveVideoElement;
  }
}
