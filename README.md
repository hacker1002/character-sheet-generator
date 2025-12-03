# Character Sheet Generator

AI-powered character sheet generator using Google Gemini 2.5 Flash. Generate 8-panel character sheets from avatar images.

## Features

- Simple 2-field form (avatar + system prompt)
- AI-powered generation with Google Gemini
- Provider abstraction for future multi-AI support
- Instant image preview
- Real-time validation with Zod
- Responsive design

## Tech Stack

- Next.js 15, React 19, TypeScript
- React Hook Form + Zod validation
- Sharp (image processing)
- Google Gemini 2.5 Flash API

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open:** http://localhost:3000

## Usage

1. Upload avatar image (JPG/PNG/WebP, max 15MB)
2. Review/customize system prompt
3. Click "Generate Character Sheet"
4. Wait 5-15 seconds
5. View your 8-panel character sheet

## API Routes

- `POST /api/upload` - Upload and compress image
- `POST /api/generate` - Generate character sheet

## Environment Variables

```env
GEMINI_API_KEY=your_api_key_here  # Get at https://aistudio.google.com/apikey
DEFAULT_PROVIDER=gemini
```

## Limitations

- Free tier: 1,500 requests/day
- Max upload: 15MB
- Formats: JPG, PNG, WebP

## License

MIT
