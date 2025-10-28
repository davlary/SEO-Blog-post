Quick dev README — Client

This folder contains the static client (marketing + blog pages).

Running locally (recommended):
1. Serve the `Client` folder with a simple static server so fetch() to `/api` hits your backend at the same origin.
   - Using Python (works on Windows if Python installed):
     cd "c:\Users\pc\Documents\Blog_post\Client"
     python -m http.server 8000
   - Or use any static file server of your choice.

2. Start the backend (see Server/agent/README.md). By default the client expects the API under the same origin at `/api`.
   - You can override the backend base URL by setting a global `window.API_BASE` before loading the client scripts, for example in HTML:
     <script>window.API_BASE = 'http://localhost:3001/api';</script>

Notes
- Blog search posts and comments will call `/api/search` and `/api/comments/:postId`. If the backend isn't available the client falls back to a local static posts list and to localStorage for comments.
- The marketing page posts generation requests to `/api/generate` and will display the returned content (expects { result } or { content }).

If you want, I can also create a top-level README that covers both client and server start steps.