import { createButton, createShell, createStage, element } from '@/features/components/shared.js';
import { loadVisualLibrary } from '@/features/components/libraries.js';

function validAsset(src) {
  if (typeof src !== 'string' || !src) return false;
  try {
    const url = new URL(src, location.href);
    return url.protocol === 'https:' || url.origin === location.origin;
  } catch { return false; }
}

function assetUrl(src) {
  if (!src?.startsWith('/') || src.startsWith('//')) return src;
  const runtime = document.querySelector('[data-component-runtime]');
  const prefix = runtime?.src.split('/assets/scripts/')[0];
  return `${prefix || ''}${src}`;
}

function video(root, config) {
  const content = createShell(root, config);
  const stage = createStage();
  const player = element('video', 'interactive-component__video');
  player.controls = true;
  player.preload = 'none';
  player.playsInline = true;
  if (config.poster) player.poster = assetUrl(config.poster);
  if (config.src) {
    const source = element('source');
    source.src = assetUrl(config.src);
    player.append(source);
  }
  if (config.webm) {
    const source = element('source');
    source.src = assetUrl(config.webm);
    source.type = 'video/webm';
    player.prepend(source);
  }
  if (config.captions) {
    const track = element('track');
    track.kind = 'captions';
    track.src = assetUrl(config.captions);
    track.srclang = config.lang || 'zh';
    track.label = config.captionLabel || '字幕';
    track.default = true;
    player.append(track);
  }
  stage.append(player);
  content.append(stage);
  return {
    pause: () => player.pause(),
    destroy: () => {
      player.pause();
      player.replaceChildren();
      player.removeAttribute('poster');
      player.load();
    },
  };
}

async function animated(root, config) {
  const library = await loadVisualLibrary(config.engine);
  const content = createShell(root, config);
  const stage = createStage();
  const canvas = element('canvas', 'interactive-component__animation');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', config.title || '动画演示');
  stage.append(canvas);
  const actions = element('div', 'interactive-component__actions');
  const play = createButton('播放');
  actions.append(play);
  content.append(stage, actions);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let player;
  let resizeObserver;
  let timeout;
  try {
    const loaded = new Promise((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('动画加载超时。')), 20000);
      const done = () => { clearTimeout(timeout); resolve(); };
      const fail = () => { clearTimeout(timeout); reject(new Error('动画资源加载失败。')); };
      if (config.engine === 'rive') {
        player = new library.Rive({ src: assetUrl(config.src), canvas, autoplay: !reduceMotion,
          stateMachines: config.stateMachine, animations: config.animation,
          onLoad: done, onLoadError: fail });
      } else {
        player = new library.DotLottie({ src: assetUrl(config.src), canvas, autoplay: !reduceMotion,
          loop: config.loop === true });
        player.addEventListener('load', done);
        player.addEventListener('loadError', fail);
        if (player.isLoaded) done();
      }
    });
    await loaded;
  } catch (error) {
    clearTimeout(timeout);
    if (typeof player?.cleanup === 'function') player.cleanup();
    else player?.destroy?.();
    throw error;
  }
  const resize = () => {
    if (config.engine === 'rive') player.resizeDrawingSurfaceToCanvas?.();
    else player.resize?.();
  };
  resize();
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  play.textContent = reduceMotion ? '播放' : '暂停';
  play.addEventListener('click', () => {
    if (player.isPlaying) { player.pause(); play.textContent = '播放'; }
    else { player.play(); play.textContent = '暂停'; }
  });
  return {
    pause: () => { player.pause(); play.textContent = '播放'; },
    destroy: () => {
      resizeObserver.disconnect();
      if (typeof player.cleanup === 'function') player.cleanup();
      else player.destroy?.();
    },
  };
}

export const mediaComponent = {
  validate(config) {
    if (!['video', 'rive', 'dotLottie'].includes(config.engine)) throw new Error('不支持的媒体类型。');
    if (config.engine === 'video' ? !validAsset(config.src) && !validAsset(config.webm) : !validAsset(config.src)) {
      throw new Error('媒体缺少有效的资源地址。');
    }
    for (const key of ['poster', 'captions']) {
      if (config[key] && !validAsset(config[key])) throw new Error(`${key} 资源地址无效。`);
    }
  },
  mount(root, config) {
    return config.engine === 'video' ? video(root, config) : animated(root, config);
  },
};
