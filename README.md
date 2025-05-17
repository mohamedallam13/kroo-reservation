# KROO Reservations App

A modern, JavaScript-based room booking system for coworking spaces that enables seamless resource management and reservation experiences.

## Project Description

This project is a Google Apps Script web application designed to manage reservations for KROO CC Coworking Space. It provides a user interface for viewing available resources and booking them, integrating directly with Google services for data storage and automation.

## Features

*   **Resource Discovery:** Browse meeting rooms, focus pods, and creative spaces with detailed information on capacity, location, and pricing.
*   **Interactive Booking:** Visual calendar and time slot selection with real-time availability checking.
*   **Multiple Payment Options:** Supports credit card, InstaPay (with receipt verification), and cash payments (Backend implementation dependent).
*   **Booking Management:** Users can view, track, and cancel their reservations from a unified dashboard.
*   **Admin Capabilities:** Allows administrators to create and manage bookings on behalf of users with special pricing options (Backend implementation dependent).
*   **Advanced Verification:** Includes OCR-powered receipt verification for digital payment confirmations (Backend implementation dependent).

## Technical Highlights

*   Pure JavaScript architecture with modular component design.
*   Two-phase booking process (buffer → database) for optimal performance and data integrity (Backend implementation dependent).
*   Responsive UI with skeleton loaders and contextual loading indicators.
*   Visual time availability system for intuitive booking experience.
*   Comprehensive error handling and user feedback.
*   Responsive design ensuring optimal viewing on mobile and desktop devices.

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

## Development Workflow

Development is managed using a `main` and `dev` branch strategy. New features and bug fixes are developed on the `dev` branch (or feature branches from `dev`) and merged into `main` for releases.

1.  **Switch to the `dev` branch:**

    ```bash
    git checkout dev
    ```

2.  **Make your changes** to the project files.

3.  **Push changes to Apps Script:**

    To update your Google Apps Script project with local changes for testing:

    ```bash
    clasp push
    ```

4.  **Commit your changes:**

    ```bash
    git add .
    git commit -m "Briefly describe your changes"
    ```

5.  **Push your `dev` branch to GitHub:**

    ```bash
    git push origin dev
    ```

6.  **Create a Pull Request (PR):**

    On GitHub, create a Pull Request from your `dev` branch into the `main` branch to propose your changes.

7.  **Merge the PR:**

    After reviewing and testing, merge the Pull Request on GitHub.

8.  **Update your local `main` branch:**

    ```bash
    git checkout main
    git pull origin main
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

