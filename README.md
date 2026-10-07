# Sense — Your expressions, guided

A responsive facial-expression capture experience with photographic examples, clear instructions, and a guided demo.

[Open the live site](https://sense-expression-studio.simeon-stojkovski.chatgpt.site)

## Experience

- Capture and confirm all five expressions: neutral, smile, frown, raised eyebrows, and squeezed eyes.
- Position your face using the camera frame and alignment guides, then capture after a three-second countdown.
- Review each photo, retake it if needed, and check all five together before finishing.
- Watch a 64-second guided demo with pause, replay, a timeline, and expression chapters. Optional browser voice narration starts off; the demo never opens the camera.
- Use the same flow on phones and desktop, with keyboard controls and reduced-motion support.

## Run locally

This is a static HTML, CSS, and JavaScript project. There is no build step, package manager, backend, or dependency installation.

From the repository root, run Python’s standard-library server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://localhost:8000). Camera access requires permission and a secure context such as localhost or an HTTPS deployment. The microphone is not requested.

## Files

- `index.html` — page entry point and help dialog.
- `app.js` — camera capture, photo review, progress, and session lifecycle.
- `demo.js` — guided walkthrough, playback controls, and optional narration.
- `styles.css` — responsive layout and visual styles.
- `assets/expressions.png` — photographic expression references.

## Photos and scope

Captured photos and the participant code remain in page memory. The application does not upload them or save them in browser storage. Refreshing or closing the page clears the photos. Demo playback never counts toward the five required captures.

This is a guided capture interface. It does not perform automated identity verification, liveness checks, face detection, or expression-quality verification. Users review and confirm their own photos.

Fonts load from Google Fonts. Optional narration uses the browser’s speech-synthesis service; voice availability depends on the browser and device.
