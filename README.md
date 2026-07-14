# For her 🤍

Two pages, one repo:
- `index.html` — the comfort/care page
- `gallery.html` — reels & photos gallery, auto-loads from the `media/` folder

## Personalize the home page
Open `index.html`, near the bottom of the `<script>`:
```js
const HER_NAME = "Neel";
const YOUR_NAME = "Aniket";
```
Already set — change if needed.

## Add photos & reels — fully automatic
Create this structure and just drop files in:

```
Day/
├── index.html
├── gallery.html
└── media/
    ├── photos/
    │   └── any-photo-name.jpg
    └── videos/
        ├── Ladachi_Neel.mp4
        └── Ladachi_Neel.jpg    ← poster (thumbnail) for that reel
```

`gallery.html` asks GitHub what's in those two folders every time it loads and builds the grid itself — no list to edit.

- **Captions** come from the filename (underscores/dashes → spaces). `Ladachi_Neel.mp4` → "Ladachi Neel".
- **Poster/thumbnail for a reel**: an image with the *same name* as the video, in the same `media/videos` folder. `Ladachi_Neel.mp4` + `Ladachi_Neel.jpg` = automatic pairing. No poster is fine too.
- This only works once files are **pushed to GitHub** — it reads live from your GitHub repo, not your local disk, and the repo needs to stay **Public**.

## Video size — before uploading reels
GitHub hard-blocks any file over 100MB.
- Compress with [HandBrake](https://handbrake.fr/) (free) — most reels land under 15–25MB at 1080p.
- Keep each reel under ~30–50MB and you're safely inside every free-tier limit.
- Repo creeping toward 1GB total → look into Git LFS or hosting video externally.

## Push it
```powershell
cd D:\Projects\Day
git add .
git commit -m "Add gallery page and media"
git push
```

## GitHub Pages
Already set up if the home page is live — `gallery.html` will be reachable at:
`https://aniket1100a.github.io/Day/gallery.html`

## Config check
`gallery.html` has these near the top of its `<script>` — make sure they match your repo:
```js
const GITHUB_USER = "Aniket1100a";
const GITHUB_REPO = "Day";
const BRANCH = "main";
```
