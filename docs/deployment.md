# Deployment configuration

The frontend and API are deployed separately. Configure both services before
testing sign-up or sign-in.

## Frontend (Vercel)

Set this environment variable in **Vercel → Project → Settings → Environment
Variables**, then redeploy:

```env
VITE_API_URL=https://contact-management-system-17sz.onrender.com/api/v1
```

The Vercel rewrite also proxies `/api/*` requests to the Render API. It keeps
authentication cookies first-party when `VITE_API_URL` is not supplied.

## Backend (Render)

Set the following Render environment variables and redeploy the service:

```env
NODE_ENV=production
FRONTEND_URL=https://your-vercel-project.vercel.app,http://localhost:5173
REQUIRE_EMAIL_VERIFICATION=false
```

Replace `your-vercel-project.vercel.app` with the actual Vercel URL. The
frontend URL must not end with a slash. `REQUIRE_EMAIL_VERIFICATION` should
stay `false` until SMTP delivery and an OTP verification UI are enabled.

Also confirm that `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
`JWT_ACCESS_EXPIRY`, and `JWT_REFRESH_EXPIRY` are present in Render. The API
cannot start if a required variable or MongoDB connection is missing.
