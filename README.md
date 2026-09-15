# MELA (Mother & Expectant Life Assistant)

MELA is a responsive web application built with React, Vite, and Tailwind CSS designed to assist expectant mothers and their companions throughout pregnancy.

## Features

- **Mother Mode**: Tracks daily vitamins, ANC schedules, weekly fetal development, and pregnancy symptoms.
- **Companion Mode (Suami)**: Allows the companion to monitor the mother's health, receive emergency alerts, and respond to them.
- **Interactive Dashboards**: Data visualizations for fetal weight/length, maternal blood pressure, and hemoglobin levels.
- **Emergency System**: One-tap emergency button with siren sound, GPS tracking, and real-time companion notification.
- **Offline Persistence**: App settings and states are saved in `localStorage` for quick recovery across reloads.

## Tech Stack

- **React 18** (with Hooks & React Router v7)
- **Vite** for blazing fast HMR and optimized builds
- **Tailwind CSS** & **Lucide React** for modern styling and iconography
- **TypeScript** for strong type-checking

## Getting Started

### Prerequisites

You need Node.js and `pnpm` (or `npm`) installed on your system.

### Installation

1. Clone or download the repository.
2. Install the dependencies:
   ```bash
   pnpm install
   ```
   *(or `npm install`)*

### Running the App Locally

To start the development server:
```bash
pnpm run dev
```
*(or `npm run dev`)*

Navigate to `http://localhost:5173` in your browser.

### Building for Production

To create a production-ready build:
```bash
pnpm run build
```
*(or `npm run build`)*

The compiled files will be generated in the `dist` folder. You can preview it with:
```bash
pnpm run preview
```

## Structure

- `/src/pages` - Individual screen components (Dashboard, Health, Calendar, etc.)
- `/src/components` - Reusable UI components
- `/src/constants` - App constants, themes, and mock data
- `/src/types` - TypeScript interfaces
- `/src/app/App.tsx` - Root router and layout

## License

This project is intended for personal use and prototyping.