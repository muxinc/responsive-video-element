import type { CustomVideoElementConstructor } from 'custom-media-element';
import type { WithMediaTracks } from 'media-tracks';

export interface ResponsiveVideo {
  srcset: string | null;
  loading: string | null;
  autopause: boolean | null;
}

declare type Constructor<T = {}> = new (...args: any[]) => T;

export function ResponsiveVideoMixin<
  T extends WithMediaTracks<CustomVideoElementConstructor>
>(superclass: T): T & Constructor<ResponsiveVideo>;
