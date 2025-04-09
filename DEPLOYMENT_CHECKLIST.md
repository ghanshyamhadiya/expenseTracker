# Deployment Checklist for Expense Tracker Application

This document outlines the necessary changes and considerations before deploying your expense tracking application to production.

## Security Enhancements

### 1. Environment Variables

- [ ] Move all sensitive information to environment variables:
  - [ ] Replace hardcoded MongoDB connection string in app.js
  - [ ] Move session secrets to environment variables
  - [ ] Update the .env file with proper formatting and remove credentials from version control

```javascript
// Current in app.js
const dbUrl = 'mongodb://localhost:27017/expense-tracker'

// Change to:
const dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker'
```

```javascript
// Current in app.js
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "expense_tracker",
    },
    touchAfter: 24 * 3600,
})

// Change to:
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || "expense_tracker",
    },
    touchAfter: 24 * 3600,
})
```

```javascript
// Current in app.js
const sessionOption = {
    store,
    secret: "expense_tracker",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}

// Change to:
const sessionOption = {
    store,
    secret: process.env.SESSION_SECRET || "expense_tracker",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // Add for production:
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
}
```

### 2. Authentication & Authorization

- [ ] Add proper error handling in authentication routes
- [ ] Implement rate limiting for login attempts
- [ ] Add CSRF protection for forms
- [ ] Ensure all routes have proper authorization checks

### 3. Input Validation

- [ ] Add server-side validation for all form inputs
- [ ] Sanitize user inputs to prevent XSS attacks
- [ ] Validate MongoDB IDs before database operations

## Database Configuration

- [ ] Set up proper MongoDB Atlas connection (already started in .env)
- [ ] Configure connection pooling for production
- [ ] Implement database indexing for frequently queried fields
- [ ] Set up database backups

## Error Handling & Logging

- [ ] Implement a proper logging system (e.g., Winston, Morgan)
- [ ] Add structured error handling for all API routes
- [ ] Set up error monitoring service (e.g., Sentry)
- [ ] Remove console.log statements or replace with proper logging

## Performance Optimization

- [ ] Enable compression for Express
- [ ] Implement proper caching strategies
- [ ] Optimize static assets (minification, bundling)
- [ ] Set appropriate cache headers

## Deployment Configuration

- [ ] Add a proper start script in package.json

```json
// Current in package.json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}

// Change to:
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

- [ ] Configure process manager (e.g., PM2) for production
- [ ] Set up environment-specific configurations

```javascript
// Add to app.js
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
```

## Security Headers

- [ ] Implement Helmet.js for security headers
- [ ] Set up Content Security Policy
- [ ] Configure CORS properly

## Monitoring & Maintenance

- [ ] Set up application monitoring
- [ ] Configure health check endpoints
- [ ] Implement automated backups
- [ ] Set up alerting for critical errors

## SSL/TLS Configuration

- [ ] Ensure HTTPS is enforced in production
- [ ] Configure SSL certificates
- [ ] Redirect HTTP to HTTPS

## Documentation

- [ ] Document API endpoints
- [ ] Create deployment instructions
- [ ] Document environment variables

## Final Checklist

- [ ] Run security audit on dependencies (npm audit)
- [ ] Test application in a staging environment
- [ ] Verify all features work in production mode
- [ ] Set up CI/CD pipeline if applicable