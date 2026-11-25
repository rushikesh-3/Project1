# DriveDesk — Car Rental Management Platform

A single-business car rental website for Hyderabad. The rental business administrator manages the fleet and all bookings. Registered customers can browse vehicles, request rentals online, and manage their own bookings. Public users cannot list cars or become administrators.

Bookings are handled in the website: customers submit requests, then the administrator confirms, cancels, or completes them from the admin dashboard. Payment remains at pickup. This version does not integrate online payments or outbound email/SMS notifications.

## Run locally

1. Install dependencies:
   ```
   npm install
   npm run install-all
   ```
2. Ensure MongoDB is running at `mongodb://127.0.0.1:27017`, or set `MONGODB_URI` in `server/.env`.
3. Copy `server/.env.example` to `server/.env`. Set `JWT_SECRET`. Set `ADMIN_EMAIL` to the rental business account email. For local demo use, the default email is `owner@carrental.local`.
4. Seed local demo data:
   ```
   npm run seed
   ```
5. Start the API and web client:
   ```
   npm run dev
   ```
6. Open http://localhost:5173.

## Local demo accounts

When using the default development configuration, seeding creates:

| Account | Email | Password |
|---|---|---|
| Rental admin | `owner@carrental.local` | `password123` |
| Customer | `renter@carrental.local` | `password123` |

These credentials are for development only. Do not use them for a production deployment.

## Production admin setup

Set `NODE_ENV=production`, configure a unique `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long random `JWT_SECRET`, then run the seed command before making the site public. Production seeding creates the configured administrator account if needed; it does not create demo renter accounts or demo vehicles. It also migrates legacy `owner` roles to customer, retaining admin access only for the configured account. New registrations always receive the customer role. Only the account matching `ADMIN_EMAIL` and explicitly provisioned as an administrator can use fleet and booking-management routes.

The app uses `MONGODB_URI` for the MongoDB server and adds the `car-rental` database name. ImageKit settings are optional; without them, image uploads use local storage under `server/uploads`.

## Main customer and admin flows

1. Customers register or log in, search available cars by location and dates, and submit a booking request with rental dates and a driving-license number.
2. Customers view and cancel their own bookings on **My Bookings**.
3. The administrator adds and edits fleet vehicles, controls availability, reviews booking requests, and updates booking status.
4. Booking statuses are `pending`, `confirmed`, `completed`, and `cancelled`. Payment is due at pickup.

The admin API is mounted at `/api/admin`. Booking routes for customer history and admin management are `/api/booking/user` and `/api/booking/admin`, respectively.

Password reset codes are printed to the backend terminal because this project has no email provider configured. Insurance arrangements happen outside the website; the app does not verify coverage.
