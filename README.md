# Olympia Garden Materials

Welcome to the Olympia Garden Materials project! This is an e-commerce platform currently under development, designed to provide a seamless shopping experience for garden supplies.

**Note:** This project is a work in progress. Features are actively being developed and the structure may change.

## About The Project

Olympia Garden Materials aims to be a modern, single-page application for an online gardening store. It leverages a powerful backend with a reactive, JavaScript-driven frontend to create a fast and user-friendly experience, without the complexity of a traditional SPA API.

## Technology Stack

This project is built using a modern technology stack that emphasizes developer productivity and performance.

- **Backend**: [Laravel](https://laravel.com/) - A robust PHP framework known for its elegant syntax and extensive feature set.
- **Frontend**:
    - [Inertia.js](https://inertiajs.com/) - Acts as the bridge between the Laravel backend and the JavaScript frontend, allowing for the creation of modern, single-page apps with server-side routing and controllers.
    - [Vite](https://vitejs.dev/) - A next-generation frontend build tool that provides an extremely fast development environment and bundles code for production.
    - The frontend is likely built with a modern JavaScript framework like **Vue.js** or **React**.
- **Database**: Configured for MySQL/MariaDB, but easily adaptable to other databases supported by Laravel (PostgreSQL, SQLite, etc.).

## Features (Current & Planned)

Based on the current codebase, here are the features that are implemented or on the roadmap:

- [x] **Product Catalog**: Browse products and categories.
- [x] **User Authentication**: Full authentication system including registration, login, password reset, and email verification.
- [x] **Shopping Cart**: Add items to the cart, update quantities, and view the cart.
- [x] **Customer Profile Management**: Users can update their profile information, manage shipping/billing addresses, and change their password.
- [x] **Contact Form**: A functional "Contact Us" page.
- [ ] **Product Search**: A robust search functionality.
- [ ] **Order & Checkout Process**: Complete checkout flow with payment integration.
- [ ] **Administrative Dashboard**: A back-office for managing products, orders, and customers.

## Getting Started

To get a local copy up and running, please follow these steps.

### Prerequisites

- PHP >= 8.1
- [Composer](https://getcomposer.org/)
- Node.js & npm
- A local database server (e.g., MySQL, MariaDB)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone <your-repository-url>
    cd olympia-garden-materials
    ```

2.  **Install backend dependencies:**

    ```sh
    composer install
    ```

3.  **Install frontend dependencies:**

    ```sh
    npm install
    ```

4.  **Setup your environment:**
    - Copy the `.env.example` file to `.env`: `cp .env.example .env`
    - Generate an application key: `php artisan key:generate`
    - Configure your database connection details in the `.env` file (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

5.  **Run database migrations:**

    ```sh
    php artisan migrate
    ```

6.  **Run the development servers:**
    - In one terminal, start the Laravel server:
        ```sh
        php artisan serve
        ```
    - In another terminal, start the Vite development server:
        ```sh
        npm run dev
        ```

You should now be able to access the application at `http://localhost:8000`.

## Contributing

Since this is a personal project under active development, contributions are not open at this time. However, feel free to fork the repository to explore the codebase.
