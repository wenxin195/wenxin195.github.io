/**
 * 归档页标签筛选，并与 URL 历史同步。
 * @param {{
 *   filtersRoot: (?Element|undefined),
 *   resultRoot: (?Element|undefined)
 * }=} options
 * @return {{destroy: function(): undefined}|null}
 */
export function init(options = {}) {
  const tagsContainer = options.filtersRoot
    ?? document.querySelector('.js-archive-filters');
  const resultContainer = options.resultRoot
    ?? document.querySelector('.js-archive-result');

  if (!tagsContainer || !resultContainer) return null;

  const sections = [...resultContainer.querySelectorAll('section')];
  const showAllButton = tagsContainer.querySelector('.tag-button--all');

  const allArticles = [];
  sections.forEach((section, idx) => {
    section.querySelectorAll('.article-list__item').forEach((element) => {
      allArticles.push({
        element,
        tags: new Set(element.dataset.tags?.split(',').filter(Boolean)),
        sectionIdx: idx,
      });
    });
  });

  const tagIndex = new Map();
  allArticles.forEach((article) => {
    article.tags.forEach((tag) => {
      if (!tagIndex.has(tag)) tagIndex.set(tag, []);
      tagIndex.get(tag).push(article);
    });
  });

  const buttonMap = new Map();
  tagsContainer.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.encode) buttonMap.set(btn.dataset.encode, btn);
  });

  const sectionVisibleCount = new Array(sections.length);
  let activeButton = null;
  let currentVisible = allArticles;

  function getTagFromURL() {
    return new URLSearchParams(location.search).get('tag');
  }

  function syncURL(tag, replace) {
    const url = new URL(location.href);
    tag ? url.searchParams.set('tag', tag) : url.searchParams.delete('tag');
    window.history[replace ? 'replaceState' : 'pushState']({ tag: tag || '' }, '', url);
  }

  function setActiveButton(btn) {
    if (activeButton === btn) return;
    activeButton?.classList.remove('focus');
    btn?.classList.add('focus');
    activeButton = btn;
  }

  function filterByTag(tag, { button, historyMode = 'push' } = {}) {
    const isShowAll = !tag;
    const nextVisible = isShowAll ? allArticles : (tagIndex.get(tag) || []);

    for (const a of currentVisible) {
      a.element.classList.add('d-none');
    }

    sectionVisibleCount.fill(0);
    for (const a of nextVisible) {
      a.element.classList.remove('d-none');
      sectionVisibleCount[a.sectionIdx]++;
    }

    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.toggle('d-none', sectionVisibleCount[i] === 0);
    }

    currentVisible = nextVisible;
    setActiveButton(button || buttonMap.get(tag) || showAllButton);

    if (historyMode !== 'none') {
      syncURL(tag, historyMode === 'replace');
    }
  }

  filterByTag(getTagFromURL(), { historyMode: 'replace' });
  resultContainer.classList.remove('d-none');

  const onClick = (event) => {
    const btn = event.target.closest('button');
    if (!btn || !tagsContainer.contains(btn)) return;
    filterByTag(btn.dataset.encode || '', { button: btn });
  };

  const onPopState = () => {
    filterByTag(getTagFromURL(), { historyMode: 'none' });
  };

  tagsContainer.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);

  return {
    destroy() {
      tagsContainer.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    },
  };
}
