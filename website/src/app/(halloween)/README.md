# Halloween photo feed (`/halloween`)

A shared photo feed for Halloween night. People scan a QR code at a venue, land on
`lookbook.inc/halloween?spot=<venue>`, post a photo of their costume, and see what everyone
else is wearing across all the venues.

This is frontend only. Photos and metadata are stored by the Wrapped FastAPI backend in the
Fashion Wrapped Supabase project; this page just calls its `/halloween` endpoints.

> **Status:** the frontend and Wrapped FastAPI endpoints are implemented in local branches.
> The Halloween schema and bucket have been applied to the Fashion Wrapped Supabase project.
> Backend source: `mvp-backend-halloween/python-backend/src/apis/halloween.py`;
> deployment notes: `mvp-backend-halloween/python-backend/HALLOWEEN.md`.

## What a visitor can do

- **See the opening board.** The first load in a tab starts on a departure board: venue names
  flip across it, with one tile per character of each name, and it lands on "your fits at
  Westwood" and holds for 1.2s. Then "Lookbook at
  Westwood" fades in, followed by the cards one at a time, left then right down the rows.
  Reloads in the same tab skip it; `?debug=1` always plays it.
- **Land on their spot's lookbook.** The header reads "Lookbook at Westwood" for
  `?spot=westwood`, and the feed shows that spot's photos. Without a known spot it reads
  "Lookbook at San Francisco" and shows everything. The top corner shows today's date and San
  Francisco's current weather.
- **Switch spots.** The spot name in the header is the switcher: tap it for a menu of the
  spots plus "San Francisco". The scanned spot is marked "You're here".
- **Browse the feed.** A dark, two-column (up to four on wide screens) masonry grid, newest
  first. The photo is the card, with the poster's name and time under it. On "San Francisco" each
  photo carries a small label with its venue. More photos load as you scroll. Once a
  selected spot's last page is loaded (including an empty spot), the feed continues with
  **From other spots**: photos from the other venues, newest first, with venue labels.
  The selected spot and upload default stay the same. This continuation is omitted on the
  all-spots feed, and has its own pagination and retry if a request fails.
- **Post a photo.** "Add your look" sits right under the title and opens the phone's own menu,
  which offers the photo library and the camera. Once the header scrolls away, a floating
  button does the same. The photo then opens on the "check your card" screen, showing it as it
  will appear. The spot being viewed is preselected (on "San Francisco", the scanned spot), the
  name is optional and remembered, and a line above Post says the photo and name are public.
- **Keep browsing while it posts.** Post returns straight to the feed, where the photo sits first
  and fills with progress. A bar at the bottom shows the status. If the connection drops, the
  post keeps trying until it works or the visitor cancels; any other failure keeps the photo so
  they can try again or discard it. Cancel returns to the card with everything kept, except once
  the whole photo has been sent, when it may already be live.
- **Undo.** The bar offers Undo for six seconds after posting.
- **See new photos arrive.** The feed checks for new photos every 20 seconds. If the visitor
  is at the top they appear straight away; otherwise a "N new photos" pill appears.
- **Open a photo.** Tapping a card opens the full-size image in a lightbox.
- **Delete their own photo.** A trash button appears only on photos posted from this device.

## QR codes and locations

A QR code links to `/halloween?spot=<slug>`, initially `/halloween?spot=westwood`.

- If the spot matches a known location, the page opens on that spot's lookbook (the server
  renders its photos first) and the upload sheet preselects it.
- The visitor can change it. The QR spot is for attribution only; it does not prove where
  someone is.
- Both values are sent on upload: `scan_spot` (the recognized QR code they scanned) and
  `location_slug` (the venue they picked). Unknown scan spots are omitted.
- Spots are lowercased and must match `[a-z0-9-]{1,40}`; anything else is ignored.

## Backend calls

All calls go to `NEXT_PUBLIC_WRAPPED_BACKEND_URL`, the same backend Snapshot uses. There is
no login; visitors are anonymous.

| Call | Sent | Expected back |
|---|---|---|
| `GET /halloween/locations` | nothing | Array of locations, already in display order |
| `GET /halloween/photos` | `limit` (24), optional `location` (slug), optional `cursor` | `{ photos, next_cursor }`, newest first |
| `POST /halloween/photos` | multipart form, see below | The created photo, plus `delete_token` |
| `DELETE /halloween/photos/{id}` | header `X-Delete-Token` | Any 2xx; a 404 is treated as already deleted |

**Upload form fields**

| Field | Value |
|---|---|
| `photo` | JPEG file, longest edge 1600px at most |
| `location_slug` | The venue the visitor chose |
| `scan_spot` | The `?spot=` value, omitted if there was none |
| `display_name` | Optional, up to 24 characters |

The frontend does not send the image's width and height; the backend is expected to read
them from the file.

**Shapes the frontend reads** (defined in `src/types/halloween-api.ts`)

- Location: `slug`, `name`, `sort_order`, optional `tone` (hex colour for the venue icon).
- Photo: `id`, `image_url`, `width`, `height`, `location_slug`, `created_at`, and optionally
  `thumb_url`, `display_name`.

The backend returns `delete_token` once to the poster. Photos have an optional
`display_name`; there is no caption or color swatch data. The feed uses the full image until
we add a thumbnail rendition. Errors are read from FastAPI's `detail`.

## Where the code is

| Path | What it holds |
|---|---|
| `src/app/(halloween)/layout.tsx` | Page metadata and PostHog provider |
| `src/app/(halloween)/halloween/page.tsx` | Server component: reads `?spot=`, fetches locations and that spot's first page |
| `.../_components/HalloweenFeed.tsx` | "Lookbook at" header and spot switcher, upload buttons, feed, infinite scroll, polling, delete |
| `.../_components/BoardOpener.tsx` | The opening departure board and the page fade's timing |
| `.../_components/UploadSheet.tsx` | The "check your card" screen |
| `.../_components/usePhotoPost.ts` | Posts in the background, with retries, cancel and status |
| `.../_components/PhotoCard.tsx`, `Lightbox.tsx`, `icons.tsx` | Card, full-size view, icons |
| `.../_components/halloween.module.css` | All styling for the page |
| `src/lib/api/halloween.ts` | The four backend calls and error messages |
| `src/lib/halloween/image.ts` | Resizes to JPEG in the browser and converts HEIC |
| `src/lib/halloween/spot.ts` | Validates the `?spot=` value |
| `src/lib/halloween/weather.ts` | Current San Francisco weather from the National Weather Service, cached for 10 minutes |
| `src/lib/halloween/storage.ts` | Remembers the visitor's name and delete tokens in `localStorage`, and whether this tab has seen the board |
| `src/types/halloween-api.ts` | Request and response types |

## Analytics

PostHog events: `halloween_viewed`, `halloween_upload_started`, `halloween_uploaded`,
`halloween_upload_failed`, `halloween_photo_deleted`. Upload events carry `location_slug`,
`scan_spot` and `changed_from_scan` (whether the visitor switched away from the QR venue).

## Running it locally

To preview the page with sample photos at Westwood, Butter, and Jaxson, run the
website locally and open `http://localhost:3000/halloween?debug=1&spot=westwood`. Preview
uploads appear in the feed for that browser tab only; they never reach the backend. Add `&upload=signal` or
`&upload=fail` to make a post's first try drop out. Preview
mode is available automatically in development. For a deployed preview build, set the
server-side `HALLOWEEN_DEMO_ENABLED=true` environment variable. Without that setting,
`?debug=1` has no effect in production.

```bash
NEXT_PUBLIC_WRAPPED_BACKEND_URL=http://localhost:8002 npm run dev
```

Then open `http://localhost:3000/halloween?spot=<slug>`.

The variable is not in `.env.local`. Without a backend serving the `/halloween` endpoints at
that URL, the page loads but shows "Couldn't load photos" and the post button stays disabled.

## Things to know

- Delete tokens live only in the poster's browser. Clearing site data means they can no
  longer delete that photo themselves.
- There is no moderation UI on this page; removing other people's photos is a backend job.
- The backend must allow cross-origin requests from the site, including the
  `X-Delete-Token` header and the `DELETE` method.
