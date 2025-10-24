# ChatGPT Atlas (Frontend + Vercel Backend)

This is a drop-in package to add **ChatGPT Atlas** to a static site (e.g., GitHub Pages) using a **Vercel Serverless Function** as a secure proxy for the OpenAI API.

## Structure
```
.
├── index.html
├── style.css
├── chatgpt.js
└── api/
    └── chat.js
```

## Quick Start

### 1) Deploy backend on Vercel
1. Import this repo into Vercel (or copy just the `api/chat.js` into any Vercel project).
2. In **Vercel → Settings → Environment Variables**, add:
   - `OPENAI_API_KEY` = your OpenAI API key.
3. Deploy. Note the deployment URL, e.g. `https://chatgpt-atlas.vercel.app/api/chat`.

### 2) Configure the frontend
Open `chatgpt.js` and set:
```js
const API_URL = "https://YOUR-VERCEL-APP.vercel.app/api/chat";
```
Replace with your actual Vercel function URL.

### 3) Host the frontend (GitHub Pages)
Commit `index.html`, `style.css`, and `chatgpt.js` to your GitHub Pages repo (e.g. `my_web-browser`).

### 4) Test
Open your site and ask a question. You should get a response labeled **Atlas**.

## Notes
- Model: `gpt-4o-mini` (fast & cost-effective). You can change this in `api/chat.js`.
- Never expose your API key in client code.
- CORS: Vercel functions accept cross-origin by default for simple POSTs. For stricter control, add CORS headers in `api/chat.js`.
