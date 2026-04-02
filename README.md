# Audio Chain Editor

A minimal frontend-only audio effects chain editor built with React, TypeScript, Vite, and @xyflow/react.

## Features

- Two horizontal audio chains with draggable effect blocks
- Rectangular blocks with neon outlines and dark UI
- IN/OUT endpoints with visual handles
- Clickable "+" slots to insert new blocks
- Block compatibility filtering based on audio signal flow
- Drag and drop block reordering
- Total compute weight calculation per chain
- Save/Load configuration via JSON export/import
- LocalStorage auto-save
- No backend required - fully static

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- @xyflow/react (drag/drop graph UI)
- CSS only (no extra UI libraries)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Click "+" slots between blocks to add new effects
2. Drag blocks to reposition them
3. Compatible blocks are filtered automatically based on signal flow
4. View total CPU load at bottom of each chain
5. Export/Import your configurations as JSON
6. Auto-saves to localStorage

## Structure

```
src/
├── components/
│   ├── AudioChainEditor.tsx  # Main chain editor with xyflow
│   ├── BlockNode.tsx         # Draggable block component
│   └── BlockPicker.tsx       # Modal for block selection
├── data/
│   └── blocks.ts             # Block library & compatibility rules
├── types/
│   └── audio.ts              # TypeScript interfaces
├── App.tsx                   # Main app component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## Deployment

Static hosting only - build with `npm run build` and deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, S3, etc).