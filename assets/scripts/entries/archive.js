/**
 * @fileoverview 归档页入口——标签筛选。
 */
import { init as initArchiveFilter } from '@/features/archive-filter.js';

document.addEventListener('DOMContentLoaded', () => {
  initArchiveFilter({
    filtersRoot: document.querySelector('.js-archive-filters'),
    resultRoot: document.querySelector('.js-archive-result'),
  });
});
