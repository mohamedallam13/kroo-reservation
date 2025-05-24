# KROO Reservations App

A modern, JavaScript-based room booking system for coworking spaces that enables seamless resource management and reservation experiences.

## Project Description

This project is a Google Apps Script web application designed to manage reservations for KROO CC Coworking Space. It provides a user interface for viewing available resources and booking them, integrating directly with Google services for data storage and automation.

## Architecture Overview

### Multi-Mode System
The application operates in three distinct modes, each optimized for different user types:

1. **Guest Mode**
   - Stateless operation with cookie-based storage
   - Local booking management using `BookingStorage` utility
   - Optimized for first-time users with minimal data persistence
   - Automatic cleanup of expired bookings

2. **User Mode**
   - Authenticated user experience with persistent storage
   - Server-side booking management
   - Access to booking history and preferences
   - Enhanced features like recurring bookings

3. **Admin Mode**
   - Full system access with advanced management capabilities
   - Real-time booking oversight
   - Special pricing and discount management
   - Comprehensive booking analytics

### Data Management Architecture

#### Frontend Storage
- **CookieStorage Utility**: Secure, encrypted cookie management
- **BookingStorage**: Specialized booking data persistence
- **PerformanceTracker**: Real-time performance monitoring
- **AppState**: Centralized state management

#### Backend Storage
- **Master Index System**: Central registry for all data files
- **Two-Phase Booking Process**:
  1. Buffer Phase: Temporary storage for pending bookings
  2. Database Phase: Permanent storage after verification
- **Optimized Data Fetching**:
  - Parallel resource and booking loading
  - Cached slot availability
  - Incremental updates for real-time changes

### Performance Optimizations

1. **Data Fetching**
   - Parallel loading of resources and bookings
   - Cached slot availability for instant response
   - Incremental updates to minimize data transfer
   - Smart prefetching of likely-needed data

2. **State Management**
   - Efficient cookie-based storage for guest users
   - Optimized data structures for quick access
   - Automatic cleanup of expired data
   - Smart caching strategies

3. **UI Performance**
   - Skeleton loaders for instant feedback
   - Progressive loading of resources
   - Optimized DOM updates
   - Efficient event handling

## Features

*   **Resource Discovery:** Browse meeting rooms, focus pods, and creative spaces with detailed information on capacity, location, and pricing.
*   **Interactive Booking:** Visual calendar and time slot selection with real-time availability checking.
*   **Multiple Payment Options:** Supports credit card, InstaPay (with receipt verification), and cash payments.
*   **Booking Management:** Users can view, track, and cancel their reservations from a unified dashboard.
*   **Admin Capabilities:** Allows administrators to create and manage bookings on behalf of users with special pricing options.
*   **Advanced Verification:** Includes OCR-powered receipt verification for digital payment confirmations.

## Technical Highlights

*   Pure JavaScript architecture with modular component design
*   Multi-mode system supporting guest, user, and admin experiences
*   Optimized data fetching with parallel loading and caching
*   Two-phase booking process for optimal performance and data integrity
*   Responsive UI with skeleton loaders and contextual loading indicators
*   Visual time availability system for intuitive booking experience
*   Comprehensive error handling and user feedback
*   Responsive design ensuring optimal viewing on mobile and desktop devices
*   Secure cookie-based storage for guest users
*   Performance tracking and optimization

## Performance

The application has been optimized for performance and user experience, as validated by Lighthouse analysis:

### Core Web Vitals
- **Performance**: Optimized for fast loading and smooth interactions
- **Accessibility**: Designed with WCAG guidelines in mind
- **Best Practices**: Following modern web development standards
- **SEO**: Optimized for search engine visibility

### Key Optimizations
- Efficient resource loading and caching
- Optimized images and assets
- Minimal DOM manipulation
- Smart state management
- Progressive loading of resources

## Getting Started

This project uses `clasp` to manage a Google Apps Script project locally and version control with Git and GitHub.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mohamedallam13/kroo-reservation.git
    cd kroo-reservation
    ```

2.  **Install clasp (if you haven't already):**

    ```bash
    npm install -g @google/clasp
    ```

3.  **Log in to clasp:**

    ```bash
    clasp login
    ```
    Follow the prompts to authorize clasp with your Google account.

4.  **Link the local project to your Apps Script project:**

    Ensure you have the correct Script ID for your Google Apps Script project. The `.clasp.json` file in the cloned repository should contain the correct `scriptId`.

5.  **Install project dependencies (if any):**

    ```bash
    # If using npm for frontend dependencies
    npm install
    ```

## Deployment (Web App)

To deploy the current state of your Apps Script project as a web app from the Google Apps Script IDE:

1.  Click `Deploy` > `New deployment`.
2.  Select the deployment type as `Web app`.
3.  Configure who has access (e.g., `Anyone` or `Anyone, even anonymous`).
4.  Click `Deploy`.
    The Web App URL will be provided.

## Usage

Once deployed as a web app, access the provided Web App URL in your browser. Users can then view resources and make reservations (subject to the configured access permissions and backend logic).

## Screenshots

### Resource Discovery
![Resource Discovery](screenshots/resource-discovery.png)
*Browse available spaces with detailed information and real-time availability*

### Booking Interface
![Booking Interface](screenshots/booking-interface.png)
*Interactive calendar and time slot selection with instant availability updates*

### Guest Booking Flow
![Guest Booking](screenshots/guest-booking.png)
*Streamlined booking process for first-time users*

### Payment Verification
![Payment Verification](screenshots/payment-verification.png)
*Secure payment processing with receipt verification*

*Note: Screenshots will be added as they become available. These placeholders represent the key screens of the application.*

