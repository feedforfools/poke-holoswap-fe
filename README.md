# HoloSwap - Pokémon TCG Collection & Trading App (Frontend Prototype)

## Overview

HoloSwap aims to be a web/mobile application designed to help users manage their Pokémon Trading Card Game (TCG) collections, track missing cards, and facilitate **in-person trades** with friends and other collectors.

This repository contains the **frontend-only prototype** of the HoloSwap application. It focuses on visualizing the core user interface and interactions for browsing cards and managing a personal collection locally. It utilizes the public [PokemonTCG API](https://pokemontcg.io/) via the `pokemontcgsdk` for card data.

**Note:** This is currently a demonstration build. There is **no backend implementation**, meaning features like user accounts, real-time trading, and persistent data storage across devices are not yet functional.

## Current Status

*   **Stage:** Frontend Prototype
*   **Persistence:** Uses Browser `localStorage` for temporary, client-side data persistence (collection/wishlist state is saved *only* in the current browser).
*   **Focus:** Demonstrating card browsing, filtering, local collection simulation (Owned, Doubles, Wishlist), and the core UI structure.

## Technology Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/ui
*   **Data Fetching:** [PokemonTCG SDK (`pokemontcgsdk`)](https://github.com/PokemonTCG/pokemon-tcg-sdk-javascript)
*   **State Management:** React Context API (for local collection)
*   **Theme:** `next-themes`
*   **Local Persistence:** Browser `localStorage`

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up Environment Variables:**
    *   Create a `.env.local` file in the project root.
    *   Get an API key from [pokemontcg.io](https://pokemontcg.io/).
    *   Add your API key to the `.env.local` file:
        ```
        NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_actual_api_key_here
        ```
    *   **Note:** The application requires this API key to fetch card data.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) (or the specified port) in your browser.

## Implemented Features (Prototype)

*   **Card Browser:** View Pokémon cards fetched from the PokemonTCG API.
*   **Pagination:** Navigate through card results page by page.
*   **Search & Filtering:**
    *   Search cards by name (debounced).
    *   Filter cards by Set using a dropdown.
    *   Sort cards by Name, Release Date, or Set Order.
    *   Filter/Sort state is reflected in URL parameters.
*   **Local Collection Simulation:**
    *   Mark cards as "Owned", "Double", or "Wishlist".
    *   Visual feedback on cards indicating their status (badges/button states).
*   **Local Persistence:** Collection/Wishlist status is saved to the browser's `localStorage` and persists across page refreshes (but not across different browsers or devices).
*   **Collection View:** `/collection` page displays cards marked as "Owned" or "Doubles", with tabs for filtering.
*   **Wishlist View:** `/wishlist` page displays cards marked as "Wishlist".
*   **UI & Navigation:**
    *   Responsive sidebar navigation.
    *   Dark Mode / Light Mode / System theme toggle (integrated into sidebar).
    *   Feedback link in the sidebar.
*   **Error Handling:** Basic loading states (skeletons) and error messages for API fetching issues.
*   **Hydration Error Fixes:** Implemented techniques to prevent hydration errors related to client-side state (`localStorage`, `useTheme`).

## Current Limitations

*   **Frontend Only:** This prototype lacks a backend server and database.
*   **No User Accounts:** Cannot create accounts, log in, or have user-specific profiles. All data is anonymous within the browser.
*   **Local Storage Only:** Data persistence is limited to the current browser. Clearing browser data or using a different device will result in data loss.
*   **No Real Trading:** The core trading functionality (proposing, accepting, managing trades) is not implemented.
*   **No Social Features:** Friend lists, viewing friend collections, etc., are not implemented.
*   **No Privacy Settings:** Collection visibility cannot be configured.

## Future Features & Roadmap (MVP Vision)

The following features are planned for future development, requiring backend implementation and further UI work, to achieve the full MVP vision:

1.  **User Authentication & Profiles:**
    *   Secure Login/Registration system.
    *   Persistent user profiles with customizable details (username, avatar).
    *   Profile management interface.
2.  **Backend Database & Persistence:**
    *   Server-side database (e.g., PostgreSQL, MongoDB) to reliably store all user data (collections, wishlists, trades, friends, profiles).
    *   API endpoints for CRUD operations on user data.
3.  **Friends System:**
    *   Functionality to add, remove, and view friends.
    *   Ability to view friends' collections (respecting privacy settings).
4.  **Collection Privacy Settings:**
    *   UI and backend logic for setting collections as Private, Friends Only, or Public.
5.  **Full Trading System:**
    *   UI for proposing trades (selecting cards from own doubles and target user's viewable cards).
    *   System for managing trade offers (viewing, accepting, rejecting, canceling).
    *   Tracking trade status (Pending, Accepted, Completed, etc.).
    *   *Potential:* Integration with external sources or internal logic for card value comparison during trades.
    *   *Potential:* "Smart Matching" feature to suggest possible trades based on mutual wants/doubles.
6.  **Advanced Collection Features:**
    *   Ability to mark cards as explicitly "Missing" within a set.
    *   Filtering collection to show cards "Not Owned" compared to a master set list.
    *   Adding fields for card `Condition` and potentially user-uploaded `Photos`.
7.  **Geographic Features:**
    *   *Potential:* Storing user location (optional, with consent) to allow filtering for nearby users/doubles.
8.  **Notifications:**
    *   In-app or push notifications for friend requests, trade offers, etc.