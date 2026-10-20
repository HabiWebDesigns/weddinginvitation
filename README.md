# Jane & Joe — Wedding Invitation (v2)

Static site in HTML, CSS and vanilla JavaScript. Works on GitHub Pages.

## What's new in v2
- Opening **garden door** (click the door or "Open the Door"): the doors swing inward, you walk through, and the invitation appears.
- Layered hero with drifting hills, fireflies and petals, plus a **Save the Date** button that downloads a calendar file.
- More photo sections: side polaroids, photo for each story milestone, "Moments & Muses" gallery, full-width photo banner, closing portrait.
- **Dress Attire** with illustrated sample outfits for ladies and gentlemen.
- Scrolling ribbon and a "Good to Know" accordion.

## Photo placeholders
The image slots include locally bundled stock photos from [Unsplash](https://unsplash.com) as placeholders. Replace any file below with your own photo, keeping the same filename. If a file is removed, the page falls back to its soft green placeholder.

| File | Used in | Search idea |
|---|---|---|
| `images/couple.jpg` | main arch frame | portrait; replace with your own photo |
| `images/stock/gazebo.jpg` | polaroid beside couple | garden gazebo |
| `images/stock/rings.jpg` | polaroid beside couple | wedding rings |
| `images/stock/first-hello.jpg`, `beginning.jpg`, `journey.jpg`, `forever.jpg` | story | coffee cups, garden path, mountain road, couple sunset |
| `images/stock/bouquet.jpg`, `aisle.jpg`, `table.jpg`, `greenery.jpg`, `cake.jpg` | Moments & Muses | wedding bouquet, outdoor aisle, reception table, green leaves, wedding cake |
| `images/stock/venue-wide.jpg` | full-width banner | garden wedding venue (landscape) |
| `images/stock/together.jpg` | closing | couple holding hands garden |

Tip: resize replacements to about 1200 px wide and keep each file under 300 KB. Music goes in `music/wedding-song.mp3`.

## Customize
Edit `weddingConfig` at the top of `js/script.js`. Story, timeline, FAQ and outfit text are in `index.html`.

## Connect RSVPs to Google Sheets
RSVPs are **not connected** until you finish these steps.

1. Create a Google Sheet. Row 1: `Timestamp, Full Name, Email, Contact Number, Number of Guests, Attendance, Meal Preference, Message`
2. **Extensions → Apps Script**, replace the code with:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.fullName, d.email, d.contact, d.guests,
                   d.attendance, d.meal, d.message]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Deploy → New deployment → Web app**, **Execute as: Me**, **Who has access: Anyone**, then authorize.
4. Paste the Web App URL into `rsvpEndpoint` in `js/script.js`.
5. After editing the script, deploy a **new version**.

The form uses `no-cors`, so the site can't read the reply. Check your sheet after a test RSVP.

## Deploy
Push to GitHub, then **Settings → Pages → Deploy from branch → main / root**.
