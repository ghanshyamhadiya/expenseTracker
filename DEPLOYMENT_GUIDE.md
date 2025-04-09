# Expense Tracker Deployment Guide

## Security Issues Found

1. **Hardcoded Secrets**
   - Session secret is hardcoded in app.js: `secret: "expense_tracker"`
   - MongoDB store secret is hardcoded: `secret: "expense_tracker"`
   - These should be moved to environment variables

2. **Database Connection**
   - Local MongoDB connection string is hardcoded: `mongodb://localhost:27017/expense-tracker`
   - Production connection string in .env has credentials embedded: `Mongo_Url=mongodb+srv://ExpenseTraker_Web:<expense_Web@pp>@forall.nzinoww.mongodb.net/?retryWrites=true&w=majority&appName=forAll`
   - The .env file is being tracked in version control, exposing credentials

3. **Missing Security Headers**
   - No implementation of security headers (Helmet.js)
   - No Content Security Policy
   - No CORS configuration

4. **Cookie Security**
   - Session cookies don't have the secure or httpOnly flags set
   - No CSRF protection implemented

5. **Authentication**
   - Basic password validation (minimum 6 characters) but no complexity requirements
   - No rate limiting for login attempts
   - Error handling in authentication routes needs improvement

6. **Error Handling**
   - Console.log statements throughout the code expose information in production
   - No structured logging system
   - Error details might be exposed to users

7. **Missing Production Configuration**
   - No environment-specific settings (development vs production)
   - No proper start script in package.json
   - No process manager configuration

## Required Changes

### 1. Environment Variables

- Install dotenv if not already installed: `npm install dotenv`
- Update app.js to load environment variables: `require('dotenv').config()`
- Move all secrets and configuration to environment variables:
  ```javascript
  // Database connection
  const dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker';
  
  // Session store
  const store = MongoStore.create({
      mongoUrl: dbUrl,
      crypto: {
          secret: process.env.SESSION_SECRET || "fallback_dev_secret",
      },
      touchAfter: 24 * 3600,
  });
  
  // Session configuration
  const sessionOption = {
      store,
      secret: process.env.SESSION_SECRET || "fallback_dev_secret",
      resave: false,
      saveUninitialized: true,
      cookie: {
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true
      }
  };
  ```

### 2. Security Enhancements

- Install security packages: `npm install helmet express-rate-limit csurf compression`
- Add to app.js:
  ```javascript
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  const csrf = require('csurf');
  const compression = require('compression');
  
  // Add security headers
  app.use(helmet());
  
  // Enable compression
  app.use(compression());
  
  // Rate limiting for authentication routes
  const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many login attempts, please try again later'
  });
  app.use('/login', authLimiter);
  app.use('/signup', authLimiter);
  
  // CSRF protection
  app.use(csrf({ cookie: true }));
  app.use((req, res, next) => {
      res.locals.csrfToken = req.csrfToken();
      next();
  });
  ```

### 3. Logging

- Install Winston: `npm install winston`
- Create a logger.js file for structured logging
- Replace all console.log statements with logger

### 4. Error Handling

- Update the global error handler to be production-friendly
- Don't expose error details in production

### 5. Form Updates

- Add CSRF token to all forms:
  ```html
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  ```

### 6. Package.json Updates

- Add proper scripts:
  ```json
  "scripts": {
    "start": "NODE_ENV=production node app.js",
    "dev": "nodemon app.js"
  }
  ```

### 7. Port Configuration

- Use environment variable for port:
  ```javascript
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
      console.log(`Server started on port ${port}`);
  });
  ```

## Deployment Checklist

1. Create a proper .env file with all required variables
2. Add .env to .gitignore to prevent committing secrets
3. Run security audit: `npm audit fix`
4. Test in a staging environment
5. Set up a process manager (PM2): `npm install pm2 -g`
6. Configure a reverse proxy (Nginx/Apache) if needed
7. Set up SSL/TLS certificates
8. Configure database backups
9. Set up monitoring and logging
10. Document the deployment process

## Additional Recommendations

1. Implement input validation and sanitization for all user inputs
2. Add database indexing for frequently queried fields
3. Consider implementing a more robust authentication system
4. Set up automated testing
5. Create a CI/CD pipeline for smoother deployments