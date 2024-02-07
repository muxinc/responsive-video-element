# `<responsive-video>`

A responsive video element with rendition switching, lazy loading and autopause.

The native `<video>` element is good, but it lacks a few features that are 
important for a great user experience. This custom element aims to fix that.

## Why?

- The native `<video>` element doesn't support `srcset` and `sizes` attributes, `lazy` loading or `autopause`.
- The native `poster` attribute doesn't support `srcset` and `sizes` attributes, `lazy` loading or `async` decoding.

## Features

- Choose optimal rendition based on video container size
- Lazy load video when it enters the viewport
- Automatically pause video when it leaves the viewport
- Implements the proposed [`HTMLMediaElement.videoRenditions`](https://github.com/muxinc/media-tracks) API
- Supports a poster slot for a regular `<img>` element which offers more 
  flexibility than the native `poster` attribute
- Progressive enhancement for `poster` and `video` (optional)
- Class mixin available for custom elements that extend `<video>`  
  [See compatible video mixins](#compatible-with)


## Basic Usage

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/responsive-video-element@0/+esm"></script>
```

```html
<responsive-video
  controls
  loading="lazy"
  srcset="
    https://stream.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/high.mp4 1920w,
    https://stream.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/medium.mp4 960w,
    https://stream.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/low.mp4 640w
  "
>
  <img
    slot="poster"
    loading="lazy"
    decoding="async"
    srcset="
      https://image.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/thumbnail.jpg?time=0&width=1920 1920w,
      https://image.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/thumbnail.jpg?time=0&width=1600 1600w,
      https://image.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/thumbnail.jpg?time=0&width=960 960w,
      https://image.mux.com/xLGf7y8cRquv7QXoDB02zEe6centwKfVmUOiPSY02JhCE/thumbnail.jpg?time=0&width=640 640w
    "
    sizes="(width < 800px) 100vw, 800px"
  >
  <video slot="media" controls></video>
</responsive-video>
```


## Compatible with

- [Media Chrome](https://github.com/muxinc/media-chrome) Your media player's dancing suit. 🕺
- [`<castable-video>`](https://github.com/muxinc/castable-video) Cast your video element to the big screen with ease!
- [`<hls-video>`](https://github.com/muxinc/hls-video-element) A custom element for playing HTTP Live Streaming (HLS) videos.
- [`<media-playlist>`](https://github.com/muxinc/media-playlist) A custom element for playing through a set of audio and video elements.
- [`media-offset`](https://github.com/muxinc/media-offset) Configures a media element to lock playback to a defined segment of the media.
- [`media-group`](https://github.com/muxinc/media-group) Sync and control multiple audio and/or video elements.
- Missing something? [Open an issue](/issues/new)


## Discussion

Some of these features might come to the native `<video>` element in the future:

- https://github.com/filamentgroup/html-video-responsive
- https://github.com/whatwg/html/issues/6363
- https://github.com/whatwg/html/issues/9812
