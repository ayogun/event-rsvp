# event-rsvp

Turkish wedding invitation (scroll-unfolding letter, gold-foil cover, background music) with an RSVP form.
Static site on GitHub Pages; answers are saved to a Google Sheet through a small Google Apps Script.

## Edit the content

All texts, names, date, venue and settings are in `config.js`. After any change:

```sh
npm run build      # renders docs/index.html
npm run preview    # build + local preview at http://localhost:8080
git add -A && git commit -m "Update invitation" && git push
```

GitHub Pages serves the `docs/` folder of the `main` branch.

## Google Sheet setup (RSVP answers)

1. Create a new Google Sheet.
2. Extensions → Apps Script. Replace the editor content with `apps-script/Code.gs`.
3. Deploy → New deployment → type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and authorize.
4. Copy the web app URL (ends with `/exec`) into `rsvpEndpoint` in `config.js`, then rebuild and push.

Answers appear in the `Yanıtlar` sheet (created automatically). After changing `Code.gs`, use Deploy → Manage deployments → edit → New version.

Useful formulas (put them in another sheet):

- Total people attending: `=SUMIF(Yanıtlar!C:C,"Evet",Yanıtlar!D:D)`
- Personal link for a name in A2: `="https://USER.github.io/event-rsvp/?ad="&ENCODEURL(A2)`

## Links

- Generic link: `https://USER.github.io/event-rsvp/`
- Personal link: add `?ad=Name`, e.g. `?ad=Ayşe%20Hanım`. The guest is greeted by name, the name is prefilled, and resubmitting updates the same row.

## Music

`musicVideoId` in `config.js` is the YouTube video ID (empty disables music). Browsers only allow sound after the first tap or click, so playback starts then; a button toggles it.

## Privacy

The repository and site are public: names, date and venue are visible to anyone with the link. The Sheet itself stays private to your Google account.
