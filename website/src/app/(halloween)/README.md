# Halloween photo feed (`/halloween`)

A shared photo feed for Halloween night. People scan a QR code at a venue, land on
`lookbook.inc/halloween?spot=<venue>`, post a photo of their costume, and see what everyone
else is wearing across all the venues.

This is frontend only. Photos and metadata are stored by the Wrapped FastAPI backend in the
Lookbook Wrapped Supabase project; this page just calls its `/halloween` endpoints.

> **Status:** the frontend is built and has been tested end to end against a local stand-in
> backend. The real `/halloween` endpoints do not exist in the backend yet, so the field names
> below are this frontend's assumptions and need to be confirmed with whoever builds them.

## What a visitor can do

- **Browse the feed.** A masonry grid of photo cards, newest first, with the poster's name,
  time, venue, optional caption and five colour swatches pulled from the photo. More photos
  load as you scroll.
- **Filter by venue.** A dropdown in the header switches between all venues and one venue.
- **Post a photo.** "Add your photo" opens a sheet: take a photo or pick one from the
  library, choose a venue, optionally add a name and caption, then post. An upload progress
  bar is shown, and a failed upload keeps the draft so they can tap again.
- **See new photos arrive.** The feed checks for new photos every 20 seconds. If the visitor
  is at the top they appear straight away; otherwise a "N new photos" pill appears.
- **Open a photo.** Tapping a card opens the full-size image in a lightbox.
- **Delete their own photo.** A trash button appears only on photos posted from this device.

## QR codes and locations

A QR code links to `/halloween?spot=<slug>`, for example `/halloween?spot=venue-a`.

- If the spot matches a known location, that location is preselected in the upload sheet.
- The visitor can change it. The QR spot is for attribution only; it does not prove where
  someone is.
- Both values are sent on upload: `scan_spot` (the QR code they scanned) and `location_slug`
  (the venue they picked). `scan_spot` is sent even when it matches no location.
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
| `caption` | Optional, up to 60 characters |
| `swatches` | JSON string holding an array of 5 hex colours |

The frontend does not send the image's width and height; the backend is expected to read
them from the file.

**Shapes the frontend reads** (defined in `src/types/halloween-api.ts`)

- Location: `slug`, `name`, `sort_order`, optional `tone` (hex colour for the venue icon).
- Photo: `id`, `image_url`, `width`, `height`, `location_slug`, `created_at`, and optionally
  `thumb_url`, `display_name`, `caption`, `swatches`.

**Open points for the backend**

- The proposed schema lists three endpoints. `DELETE` is an addition this frontend makes.
  If the upload response has no `delete_token`, the delete button simply never appears.
- `display_name`, `caption`, `swatches` and `thumb_url` are not in the proposed
  `halloween_photos` table. Without them cards show "Someone", no caption, neutral swatches,
  and the full image in place of a thumbnail.
- The schema calls the location label "display name"; the frontend reads it as `name`.
- Errors are read from FastAPI's `detail`. 413, 429 and 5xx get their own friendly messages.

## Where the code is

| Path | What it holds |
|---|---|
| `src/app/(halloween)/layout.tsx` | Page metadata and PostHog provider |
| `src/app/(halloween)/halloween/page.tsx` | Server component: reads `?spot=`, fetches locations and the first page |
| `.../_components/HalloweenFeed.tsx` | Feed, filter, infinite scroll, polling, delete |
| `.../_components/UploadSheet.tsx` | The photo, venue and details flow |
| `.../_components/PhotoCard.tsx`, `Lightbox.tsx`, `icons.tsx` | Card, full-size view, icons |
| `.../_components/halloween.module.css` | All styling for the page |
| `src/lib/api/halloween.ts` | The four backend calls and error messages |
| `src/lib/halloween/image.ts` | Resizes to JPEG in the browser, extracts swatches, converts HEIC |
| `src/lib/halloween/spot.ts` | Validates the `?spot=` value |
| `src/lib/halloween/storage.ts` | Remembers the visitor's name and delete tokens in `localStorage` |
| `src/types/halloween-api.ts` | Request and response types |

## Analytics

PostHog events: `halloween_viewed`, `halloween_upload_started`, `halloween_uploaded`,
`halloween_upload_failed`, `halloween_photo_deleted`. Upload events carry `location_slug`,
`scan_spot` and `changed_from_scan` (whether the visitor switched away from the QR venue).

## Running it locally

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
