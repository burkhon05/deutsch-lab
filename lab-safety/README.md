# Lab Safety Acknowledgment (paperless e-sign)

Students scan a QR code, read the safety rules, sign on the screen, and get a
PDF receipt. Every submission is archived automatically in a Google Sheet.

## Files
- `index.html` — the student-facing page (served by GitHub Pages)
- `apps-script-backend.gs` — Google Apps Script backend (Sheet + Drive archive)

## Deploy (GitHub Pages)

This folder lives inside the `deutsch-lab` repository, so it publishes as a
sub-path of the existing site — the Deutsch Lab page at the root is untouched.

1. Merge this branch into `main`.
2. Repo **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: **main**, folder: **/ (root)** → Save.
3. Wait ~1 minute. The page is live at:
   `https://burkhon05.github.io/deutsch-lab/lab-safety/`

To publish it at `https://burkhon05.github.io/lab-safety/` instead, create a
separate public repository named `lab-safety`, upload `index.html` and this
README to its root, and enable Pages there the same way.

## Connect the archive
1. Create a Google Sheet, open **Extensions → Apps Script**, paste
   `apps-script-backend.gs`, fill in `SHEET_ID` (and `PDF_FOLDER_ID` if you
   want Drive copies), run `setup`, then **Deploy → Web app**
   (execute as *Me*, access *Anyone*). Copy the `/exec` URL.
2. In `index.html`, set `BACKEND_URL` to that URL and change `STAFF_PASSCODE`
   from its default of `1234`.
3. Commit the change.

Until `BACKEND_URL` is set the page still works end to end — it just generates
the PDF receipt locally without archiving to the Sheet.

## Before going live
- Replace the 12 placeholder rules with the official CAU rules
  (in `index.html`, the `rules` array inside the `i18n` block — three copies,
  one per language).
- Proofread the Russian and Uzbek translations.
- Change `STAFF_PASSCODE`. It is visible to anyone who views the page source,
  so treat it as a speed bump, not a secret — it only gates a CSV export of
  submissions made in that one browser session.
