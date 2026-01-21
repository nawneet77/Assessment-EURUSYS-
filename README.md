# EURUSYS - Contract Management Platform

A Contract Management Platform System for EURUSYS

## 📋 Project Overview

This repository contains a Frontend of Contract Management Platform that enables organizations to create, manage, and track contracts through their entire lifecycle. The platform provides a blueprint-based contract creation system, allowing users to build reusable templates and generate contracts efficiently.

## 🌐 Live Demo

**Deployed Application**: [View Live Demo](https://nawneet77.github.io/Assessment-EURUSYS-/)

The application is hosted on GitHub Pages and is accessible at the link above.

## 🚀 Setup Instructions

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the application**:
    The app will be available at `http://localhost:5000`.

## 📦 Deployment

To deploy to GitHub Pages:

```bash
npm run deploy
```

This will build the application and deploy it to the `gh-pages` branch, making it available at `https://nawneet77.github.io/Assessment-EURUSYS-/`.

## 🏗 Architecture & Design Decisions

### Tech Stack
-   **React 18**: For component-based UI architecture.
-   **TypeScript**: For type safety and better developer experience.
-   **Tailwind CSS (v4)**: For rapid, utility-first styling and a consistent design system.
-   **Wouter**: For lightweight, minimalist client-side routing.
-   **React Hook Form + Zod**: For robust form handling and validation (Blueprint creation).
-   **Context API**: For state management (mocking a database/backend).
-   **Lucide React**: For consistent and clean iconography.
-   **Date-fns**: For date formatting.

### Design System
The UI follows a "Clean Enterprise" aesthetic, focusing on clarity, trust, and usability.
-   **Typography**: `Plus Jakarta Sans` for headers (modern, geometric) and `Inter` for body text (highly legible).
-   **Color Palette**: Trustworthy blues (`hsl(221 83% 53%)`) as the primary action color, with a neutral grayscale foundation.
-   **Visual Hierarchy**: Uses card-based layouts with subtle shadows and borders to distinguish content areas.

### State Management (Mock Persistence)
Since no backend is provided, the application uses `ContractContext` (`client/src/context/contract-context.tsx`) to manage state.
-   **Data Store**: `blueprints` and `contracts` are stored in React state.
-   **Persistence**: Data resets on page reload (as per mockup mode limitations, though LocalStorage could be added easily).
-   **Lifecycle Logic**: State transitions (e.g., Created -> Approved -> Signed) are handled within the context actions to ensure validity.


## ✨ Key Features
1.  **Blueprint Builder**: Dynamic form builder to create reusable contract templates.
2.  **Contract Lifecycle**: strict state machine (Draft -> Created -> Approved -> Sent -> Signed -> Locked).
3.  **Dashboard**: Overview of contract status and activity.
4.  **Audit Trail**: Visual history of contract status changes.
