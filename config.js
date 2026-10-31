// All visible content lives here. Replace the placeholder values later.
module.exports = {
  brideName: 'Anna',
  groomName: 'Ali Yiğit',
  brideFull: 'Anna Herzog',
  groomFull: 'Ali Yiğit Ogun',

  // ISO date + 24h time (Europe/Istanbul)
  date: '2027-02-06',
  time: '19:00',
  dateText: '6 Şubat 2027, Cumartesi',

  venueName: 'İncek Arya Düğün Salonu',
  venueAddress: 'İncek, Gölbaşı / Ankara',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=%C4%B0ncek+Arya+D%C3%BC%C4%9F%C3%BCn+Salonu+Ankara',

  welcomeText:
    'Hayatımızın en özel gününde sizleri de aramızda görmekten mutluluk duyarız.',
  notes: 'Lütfen katılım durumunuzu 25 Ocak 2027 tarihine kadar bildiriniz.',
  rsvpDeadline: '25 Ocak 2027',

  maxGuestsPerRsvp: 5,

  // Background music, no ads: path of an audio file inside public/ (e.g. 'music.mp3'). Takes priority over YouTube.
  musicFile: 'music.mp3',
  // Fallback: YouTube video ID (shows ads sometimes). Leave '' to disable.
  musicVideoId: 'KNZH-emehxA',

  // Link-preview (WhatsApp / iMessage) metadata
  ogTitle: 'Anna & Ali Yiğit – Düğün Davetiyesi',
  ogDescription:
    '6 Şubat 2027 · İncek, Ankara. Düğünümüze davetlisiniz! Katılım durumunuzu bildirmek için tıklayın.',
  ogImage: '', // optional image path inside docs/ (e.g. 'og.jpg') or full URL; needs siteUrl for relative paths

  // Public address of the site (no trailing slash), used for link previews.
  siteUrl: 'https://ayogun.github.io/event-rsvp',

  // Google Apps Script web-app URL that saves answers to your Google Sheet (see README).
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbz9BT04EUbo_X0IWt26D4oTE3l0eT81XnkW0bIfZGdF0I7fSAVqvXYgV3COTdddjkWr/exec',
};
