# Camera roll

The homepage shows a blurred, flattened preview until a visitor enters David's
phone number. This is a familiarity check, not proof of friendship or identity.
The accepted number follows `person.phone` in `lib/resume-data.json`.

`api/camera-roll.js` checks the number on the server and issues a signed,
HttpOnly, SameSite cookie valid for seven days. `CAMERA_ROLL_SECRET` must be a
random secret of at least 32 characters in the production Vercel environment.
Rotate that variable to invalidate all sessions. Neither the client nor the
handlers persist submitted numbers. There is no SMS or analytics event.

The original photos and sketches live in `private/camera-roll/` and are bundled
only with `api/camera-photo.js`. `scripts/build-public.mjs` stages the static
website into `public-site/`, excluding the private directory and API source.
Do not restore `outputDirectory` to `.` or copy the originals back into images.
The blurred `images/notebook/camera-preview.webp` is deliberately public.

To change the selection, update the files, the whitelist in the photo endpoint,
and the homepage's `data-src` attributes. Both originals and sketches are fetched
through the photo endpoint. Existing hover, tap, and mobile reveal behavior is
retained after unlocking. The close button clears the visitor's cookie.

Validate with the normal Vercel build command and `node scripts/check-camera-roll.mjs`.
Also verify a fresh browser cannot fetch photos, correct and incorrect entries,
return visits, closing, mobile layout, keyboard submission, and reduced motion.
