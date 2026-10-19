const button = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation-links');
const closeMenu = () => {
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
};
button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { closeMenu(); button.focus(); } });
const links = [...navigation.querySelectorAll('a')];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting);
  if (!visible.length) return;
  for (const link of links) {
    if (link.hash === `#${visible[0].target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}, { rootMargin: '-12% 0px -65% 0px' });
for (const link of links) {
  const target = document.querySelector(link.hash);
  if (target) observer.observe(target);
}

// Keep the verified build-time counts visible when a public API is unavailable.
// Refresh through public endpoints, with a six-hour browser cache and no tokens.
const metricQueue = [...document.querySelectorAll('.live-metric')];
const ttl = 6 * 60 * 60 * 1000;
async function updateMetric(badge) {
  const { api, field } = badge.dataset;
  const key = `homepage-metric-v1:${api}`;
  const render = record => {
    if (!Number.isInteger(record.value) || record.value < 0) return;
    badge.querySelector('.metric-value').textContent = new Intl.NumberFormat('en').format(record.value);
    const label = 'GitHub stars';
    badge.title = `${label} · updated ${new Date(record.time).toLocaleString()}`;
  };
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (cached && cached.time >= Date.parse(badge.dataset.checked) && Date.now() - cached.time < ttl) {
      render(cached);
      return;
    }
  } catch { /* Browser storage may be disabled. */ }
  try {
    const response = await fetch(api, { signal: AbortSignal.timeout(8000), credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) return;
    const data = await response.json();
    if (!Number.isInteger(data[field]) || data[field] < 0) return;
    const record = { value: data[field], time: Date.now() };
    render(record);
    try { localStorage.setItem(key, JSON.stringify(record)); } catch { /* Keep working without storage. */ }
  } catch { /* Preserve the verified count and its original timestamp. */ }
}
async function metricWorker() {
  while (metricQueue.length) await updateMetric(metricQueue.shift());
}
metricWorker();
metricWorker();

const wechatLink = document.querySelector('#wechat-link');
const wechatDialog = document.querySelector('#wechat-dialog');
if (wechatLink && wechatDialog && typeof wechatDialog.showModal === 'function') {
  wechatLink.addEventListener('click', event => {
    event.preventDefault();
    wechatDialog.showModal();
  });
  wechatDialog.addEventListener('close', () => wechatLink.focus({ preventScroll: true }));
}
