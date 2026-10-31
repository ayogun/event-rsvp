// Renders views/invitation.html with config.js into docs/ (served by GitHub Pages).
const fs = require('fs');
const path = require('path');
const config = { ...require('./config') };
if (process.env.RSVP_ENDPOINT) config.rsvpEndpoint = process.env.RSVP_ENDPOINT;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const capWords = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const [first, ...rest] = Array.from(w);
      return `<span class="cap">${esc(first)}</span>${esc(rest.join(''))}`;
    })
    .join(' ');

const siteUrl = (config.siteUrl || '').replace(/\/+$/, '');
const absolute = (u) => (/^https?:\/\//.test(u) ? u : siteUrl ? `${siteUrl}/${u.replace(/^\/+/, '')}` : '');
const ogImage = config.ogImage ? absolute(config.ogImage) : '';

const vars = {
  ...config,
  brideNameHtml: capWords(config.brideName),
  groomNameHtml: capWords(config.groomName),
  ogUrlTag: siteUrl ? `<meta property="og:url" content="${esc(siteUrl + '/')}">` : '',
  ogImageTag: ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : '',
  startISO: `${config.date}T${config.time}:00+03:00`,
};

const template = fs.readFileSync(path.join(__dirname, 'views', 'invitation.html'), 'utf8');
const html = template.replace(/\{\{(\w+)\}\}/g, (m, key) => {
  if (!(key in vars)) throw new Error(`Unknown placeholder ${m} in template`);
  return /(Html|Tag)$/.test(key) ? vars[key] : esc(vars[key]);
});

const out = path.join(__dirname, 'docs');
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(__dirname, 'public'), out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('Built docs/index.html');
if (!config.rsvpEndpoint) console.warn('Warning: config.rsvpEndpoint is empty, the form cannot save answers yet.');
