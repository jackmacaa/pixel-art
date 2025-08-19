# Pixel Art App

A simple pixel art creation tool built with React, TypeScript, and Tailwind CSS.

## Features

- 13x13 pixel grid for creating pixel art
- 8 vibrant colors: black, orange, red, purple, blue, green, yellow, white
- Click to paint, click again to erase
- Drag to paint continuously
- Clear all button to reset the canvas
- Mobile-optimized with dynamic viewport height
- Touch-friendly interface

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to the local development URL (usually http://localhost:5173)

## Build for Production

```bash
npm run build
```

## Usage

- Select a color from the palette at the top
- Click on any pixel to paint it
- Click on a painted pixel to erase it
- Drag across pixels to paint continuously
- Use the "Clear All" button to reset the entire canvas

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- PostCSS

## Project Structure

```
pixel-art-standalone/
├── src/
│   ├── components/
│   │   └── PixelArt.tsx    # Main pixel art component
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── vite.config.ts          # Vite configuration
```
