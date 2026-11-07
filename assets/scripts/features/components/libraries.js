import { importModule } from '@/utils/import-module.js';
import { loadScript } from '@/utils/load-script.js';

// Libraries stay optional: this module does not fetch anything until a model asks.
// Versions are pinned because the site has no JavaScript bundle step.
const sources = {
  plotly: { url: 'https://cdn.plot.ly/plotly-4.1.1.min.js', global: 'Plotly' },
  d3: { url: 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm' },
  observablePlot: { url: 'https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.17/+esm' },
  pixi: { url: 'https://cdn.jsdelivr.net/npm/pixi.js@8.22.0/+esm' },
  rive: { url: 'https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.45.0/+esm' },
  dotLottie: { url: 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.81.0/+esm' },
  gsap: { url: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm' },
};

const requests = new Map();

export function loadVisualLibrary(name) {
  const source = sources[name];
  if (!source) return Promise.reject(new Error(`未知的可视化库：${name}`));
  if (!requests.has(name)) {
    const request = source.global
      ? loadScript(source.url).then(() => {
        const library = window[source.global];
        if (!library) throw new Error(`${name} 未提供预期接口。`);
        return library;
      })
      : importModule(source.url);
    requests.set(name, request.catch((error) => {
      requests.delete(name);
      throw error;
    }));
  }
  return requests.get(name);
}
