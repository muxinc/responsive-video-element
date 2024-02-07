// @ts-check
import { test } from 'zora';
import { CustomVideoElement } from 'custom-media-element';
import { ResponsiveVideoMixin } from '../responsive-video-mixin.js';
import { ResponsiveVideoElement } from '../responsive-video-element.js';

function isGetter(obj, prop) {
  return !!Object.getOwnPropertyDescriptor(obj, prop)['get'];
}

test('adding properties to a custom video element', function (t) {
  const Sub = ResponsiveVideoMixin(CustomVideoElement);
  t.ok(isGetter(Sub.prototype, 'autopause'), 'has autopause getter');
});

test('is an instance of responsive-video', async function (t) {
  /** @type {ResponsiveVideoElement} */
  const video = await fixture(`<responsive-video></responsive-video>`);
  t.ok(video instanceof ResponsiveVideoElement);
  t.equal(video.autopause, false, 'autopause is false by default');
  t.equal(video.srcset, '', 'srcset is empty by default');
  t.equal(video.loading, 'eager', 'loading is eager by default');
});

async function fixture(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const fragment = template.content.cloneNode(true);
  const result = fragment.children.length > 1
    ? [...fragment.children]
    : fragment.children[0];
  document.body.append(fragment);
  return result;
}
