// Shared site behaviors: header icon redirects, search suggestions/results,
// category navigation, and sidebar toggles.

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Utilities ----------
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  // ---------- Icon redirects (header) ----------
  function initIconRedirects() {
    const icons = qsa('.icon-btn, .avatar-btn');
    icons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = btn.getAttribute('data-target');
        if (target) {
          // basic navigation to the target page
          window.location.href = target;
        }
      });
    });
  }

  // ---------- Sidebar & Menu toggles ----------
  function initSidebarToggles() {
    const menuBtn = qs('#menu-btn');
    const sidebar = qs('#sidebar');
    const sidebarToggleMobile = qs('#sidebar-toggle-mobile');

    if (!menuBtn || !sidebar) return;

    let isSidebarOpen = false;

    const setSidebarOpen = (open) => {
      sidebar.classList.toggle('show', open);
      isSidebarOpen = open;
      if (sidebarToggleMobile) sidebarToggleMobile.classList.toggle('active', open);
    };

    menuBtn.addEventListener('click', () => setSidebarOpen(!isSidebarOpen));
    if (sidebarToggleMobile) {
      sidebarToggleMobile.addEventListener('click', () => setSidebarOpen(!isSidebarOpen));
    }

    // Close when clicking a sidebar link
    qsa('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => setSidebarOpen(false));
    });

    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && isSidebarOpen) {
        const target = e.target;
        if (!sidebar.contains(target) && !menuBtn.contains(target) && !(sidebarToggleMobile && sidebarToggleMobile.contains(target))) {
          setSidebarOpen(false);
        }
      }
    });
  }

  // ---------- Category buttons ----------
  function initCategories() {
    const buttons = qsa('.category-btn');
    if (!buttons.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-category') || 'all';
        // Navigate to category page (convention: category-<name>.html)
        const page = `category-${cat}.html`;
        window.location.href = page;
      });
    });
  }

  // ---------- Search suggestions & results ----------
  // Small demo dataset used for local search suggestions.
  const SAMPLE_VIDEOS = [
    { id: 'v1', title: 'Top 10 Music Hits 2024', channel: 'MusicHub', views: '1.2M', time: '2 days ago' },
    { id: 'v2', title: 'Relaxing Lo-fi Beats', channel: 'ChillZone', views: '300K', time: '1 week ago' },
    { id: 'v3', title: 'Gaming Highlights: Best Plays', channel: 'ProGamer', views: '450K', time: '3 days ago' },
    { id: 'v4', title: 'Podcast Episode 12: Tech Trends', channel: 'PodCastX', views: '90K', time: '5 days ago' },
    { id: 'v5', title: 'Live Concert: Artist Name', channel: 'LiveStage', views: '2M', time: '1 hour ago' },
    { id: 'v6', title: 'Mix: Deep House 2024', channel: 'BeatMaker', views: '110K', time: '3 weeks ago' },
    { id: 'v7', title: 'How to Start Gaming on PC', channel: 'GuidePro', views: '60K', time: '6 days ago' },
    { id: 'v8', title: 'Quick Workout at Home', channel: 'FitNow', views: '200K', time: '2 weeks ago' },
    { id: 'v9', title: 'Top 5 Podcasts to Follow', channel: 'PodTips', views: '45K', time: '1 month ago' },
    { id: 'v10', title: 'Live: Coding Session', channel: 'DevStream', views: '12K', time: '3 hours ago' }
  ];

  function renderSuggestions(matches, container) {
    container.innerHTML = '';
    if (!matches.length) {
      container.setAttribute('aria-hidden', 'true');
      return;
    }
    container.setAttribute('aria-hidden', 'false');
    const ul = document.createElement('ul');
    ul.className = 'suggestions-list';
    matches.forEach((m) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.tabIndex = 0;
      li.innerHTML = `<strong>${escapeHtml(m.title)}</strong><div class="suggestion-sub">${escapeHtml(m.channel)}</div>`;
      li.addEventListener('click', () => {
        const input = qs('#search-input');
        input.value = m.title;
        showSearchResults(m.title);
        container.innerHTML = '';
      });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') li.click();
      });
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>\"]+/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }

  function showSearchResults(query) {
    const results = SAMPLE_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()) || v.channel.toLowerCase().includes(query.toLowerCase()));
    let container = qs('#search-results-overlay');
    if (!container) {
      container = document.createElement('div');
      container.id = 'search-results-overlay';
      container.className = 'search-results-overlay';
      // basic styles for the overlay; the site CSS may override these
      container.style.position = 'fixed';
      container.style.top = '80px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.width = 'min(1100px, 94%)';
      container.style.maxHeight = '70vh';
      container.style.overflow = 'auto';
      container.style.background = '#fff';
      container.style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)';
      container.style.zIndex = '9999';
      container.style.padding = '16px';
      container.style.borderRadius = '8px';
      document.body.appendChild(container);
    }
    container.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong>Search results for "${escapeHtml(query)}"</strong><button id="close-search-results" aria-label="Close search results">✕</button></div>`;
    const list = document.createElement('div');
    list.className = 'search-results-list';
    if (!results.length) {
      list.innerHTML = `<p>No results found.</p>`;
    } else {
      results.forEach(r => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.style.padding = '8px 0';
        item.style.borderBottom = '1px solid #eee';
        item.innerHTML = `<a href="video.html" class="search-result-link"><strong>${escapeHtml(r.title)}</strong></a><div class="search-result-meta">${escapeHtml(r.channel)} • ${escapeHtml(r.views)} • ${escapeHtml(r.time)}</div>`;
        list.appendChild(item);
      });
    }
    container.appendChild(list);

    qs('#close-search-results').addEventListener('click', () => container.remove());
  }

  function initSearch() {
    const form = qs('#search-form');
    const input = qs('#search-input');
    const suggestions = qs('#search-suggestions');
    if (!form || !input || !suggestions) return;

    const doSuggest = debounce(() => {
      const q = input.value.trim();
      if (!q) {
        suggestions.innerHTML = '';
        suggestions.setAttribute('aria-hidden', 'true');
        return;
      }
      const matches = SAMPLE_VIDEOS.filter(v => v.title.toLowerCase().includes(q.toLowerCase()) || v.channel.toLowerCase().includes(q.toLowerCase()));
      renderSuggestions(matches.slice(0, 6), suggestions);
    }, 180);

    input.addEventListener('input', doSuggest);

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!suggestions.contains(e.target) && e.target !== input) {
        suggestions.innerHTML = '';
        suggestions.setAttribute('aria-hidden', 'true');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      // Show results in an overlay
      showSearchResults(q);
    });
  }

  // Initialize all modules
  initIconRedirects();
  initSidebarToggles();
  initCategories();
  initSearch();

});

// End of main.js
