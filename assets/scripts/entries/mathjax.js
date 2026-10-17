import { init } from '@/features/mathjax.js';
const script = document.querySelector('script[data-mathjax-src]');
if (script) init({ root: document.querySelector('.js-article-body'), src: script.dataset.mathjaxSrc });
