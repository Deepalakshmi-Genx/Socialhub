# SocialHub

SocialHub is a centralized social media management and advertising platform built with a Buffer-like user experience. It allows users to register, connect multiple social media accounts, create and manage organic posts, schedule content, and run advertising campaigns across Facebook, Instagram, and LinkedIn from a single dashboard.

---

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, Zustand (State Management), React Router, Vanilla CSS (Design System).
- **Backend**: PHP Laravel (REST API, Queues, OAuth).
- **Database**: MySQL.
- **Architecture**: Laravel + React Monolith (compiled via Laravel Vite Plugin).

---

## ✨ Core Features

- **Authentication**: JWT-based authentication, Google SSO integration, and secure password management.
- **Social Connect**: Secure OAuth 2.0 flows for Facebook, Instagram, and LinkedIn.
- **Content Management**: Create, preview, and organize posts with platform-specific formatting.
- **Scheduling**: Content calendar and background queue workers to publish scheduled posts reliably.
- **Media Library**: Centralized image and video management with validation.
- **Advertising**: Full lifecycle ad campaign management (Campaigns > Ad Sets > Ads) including audience targeting and budgeting.
- **Analytics**: Aggregate dashboards for tracking engagement, impressions, clicks, spend, and conversions.
- **Admin Panel**: System-wide statistics, user management, and API error monitoring.

---

## 🛠️ Application Architecture

The application operates as a **Monolith**:
- The **Laravel backend** handles all API routing (`routes/api.php`), database interactions (Eloquent Models), queued background jobs, and OAuth flows.
- The **React frontend** source code resides in `resources/js/`.
- **Vite** acts as the bridge, bundling the React code and serving it through a single Blade view (`resources/views/app.blade.php`), which acts as a catch-all route for the React Router.

---

## 💻 Local Development Setup

Follow these steps to run the application on your local machine.

### Prerequisites
- PHP 8.1+
- Composer
- Node.js & npm
- MySQL

### 1. Installation

Clone the repository and install both backend and frontend dependencies:

```bash
# Install PHP dependencies
composer install

# Install Javascript dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and generate an application key:

```bash
cp .env.example .env
php artisan key:generate
```

Update your `.env` file with your local database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=socialhub
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Database Migration

Run the migrations to create all necessary tables (Users, Social Accounts, Posts, Campaigns, Analytics, etc.):

```bash
php artisan migrate
```

### 4. Running the Application

To run the full stack locally, you need two terminal tabs open in the project root:

**Terminal 1 (Backend API):**
```bash
php artisan serve
```

**Terminal 2 (Frontend Vite Server):**
```bash
npm run dev
```

Visit `http://localhost:8000` in your browser. The Laravel server will automatically proxy the frontend assets from Vite.

---

## 🔑 Social Platform API Setup (Meta & LinkedIn)

To fully enable publishing and advertising, you must configure Developer Apps on the respective platforms.

### 1. Meta (Facebook & Instagram)
- Go to the [Meta Developer Portal](https://developers.facebook.com/).
- Create an app and enable the **Facebook Login** and **Instagram Graph API** products.
- Obtain your App ID and App Secret.
- Add them to your `.env`:
  ```env
  META_CLIENT_ID=your_app_id
  META_CLIENT_SECRET=your_app_secret
  META_WEBHOOK_VERIFY_TOKEN=your_custom_secure_string
  ```

### 2. LinkedIn
- Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
- Create an app and request access to the **Share on LinkedIn** and **Sign In with LinkedIn** products.
- Add your credentials to your `.env`:
  ```env
  LINKEDIN_CLIENT_ID=your_client_id
  LINKEDIN_CLIENT_SECRET=your_client_secret
  ```

---

## ⏱️ Background Jobs & Queues

SocialHub relies on Laravel Queues to handle delayed post scheduling and external API calls without blocking the user interface.

To process scheduled posts, ensure your queue worker is running:
```bash
php artisan queue:work
```
*(In a production environment, this should be managed by Supervisor or a similar process monitor).*

---

## 📄 License
Proprietary software. Created for the SocialHub platform.
