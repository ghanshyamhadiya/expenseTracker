# Expense Tracker Deployment Implementation Guide

This document provides specific implementation details for preparing your expense tracking application for production deployment.

## Critical Security Updates

### 1. Environment Variables Configuration

Create a proper `.env.example` file to document required environment variables:

```
# Database Configuration
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Session Configuration
SESSION_SECRET=your_strong_random_secret_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 2. Update app.js to Use Environment Variables

Modify your app.js file to use environment variables for sensitive information:

```javascript
// Near the top of app.js, add:
require('dotenv').config();

// Replace hardcoded database URL
// const dbUrl = 'mongodb://localhost:27017/expense-tracker'
const dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/expense-tracker';

// Replace hardcoded session secret
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || "expense_tracker",
    },
    touchAfter: 24 * 3600,
});

const sessionOption = {
    store,
    secret: process.env.SESSION_SECRET || "expense_tracker",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        httpOnly: true // Prevent client-side JavaScript from accessing cookies
    }
};

// Update port configuration
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
```

### 3. Add Security Middleware

Install and configure Helmet.js for security headers:

```bash
npm install helmet express-rate-limit csurf compression --save
```

Update app.js:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const compression = require('compression');

// Add security headers
app.use(helmet());

// Enable compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to authentication routes
app.use('/login', limiter);
app.use('/signup', limiter);

// CSRF protection (after session middleware)
app.use(csrf({ cookie: true }));

// Pass CSRF token to all templates
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
```

## Database Configuration

### 1. Optimize MongoDB Connection

Update the MongoDB connection in app.js:

```javascript
async function main() {
    try {
        await mongoose.connect(dbUrl, {
            // These options may vary based on your MongoDB version
            // For mongoose 6.x and above, many are set by default
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}
```

## Error Handling & Logging

### 1. Implement Structured Logging

Install Winston for logging:

```bash
npm install winston --save
```

Create a logger.js file:

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

module.exports = logger;
```

Replace console.log with logger in app.js and other files.

### 2. Improve Error Handling

Update the error handler in app.js:

```javascript
const logger = require('./logger');

app.use((err, req, res, next) => {
    let { status, message } = err;
    
    if (err.name === "CastError") {
        status = 400;
        message = "Invalid ID format. The requested resource could not be found.";
    }
    
    // Don't expose error details in production
    if (process.env.NODE_ENV === 'production' && status === 500) {
        logger.error(err.stack || err);
        message = "Internal Server Error";
    } else {
        logger.error(err.stack || err);
    }
    
    status = status || 500;
    
    try {
        res.status(status).render("error.ejs", { message, status });
    } catch (renderError) {
        logger.error("Error rendering error page:", renderError);
        res.status(500).send("An unexpected error occurred.");
    }
});
```

## Package.json Updates

Update your package.json scripts:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "start": "NODE_ENV=production node app.js",
  "dev": "nodemon app.js"
}
```

## Form Updates

Update all forms to include CSRF token (example for update.ejs):

```html
<form action="/expense/update/<%= expense.id %>?_method=PUT" method="post" class="update-form" id="updateForm">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <!-- Rest of the form remains the same -->
</form>
```

## Production Deployment Considerations

1. **Process Manager**: Use PM2 to manage your Node.js application in production:

```bash
npm install pm2 -g
pm2 start app.js --name "expense-tracker"
```

2. **Nginx Configuration**: If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **SSL Configuration**: Use Let's Encrypt for free SSL certificates.

## Final Steps Before Deployment

1. Run security audit: `npm audit fix`
2. Test in a staging environment
3. Backup your database
4. Set up monitoring (consider services like UptimeRobot for basic monitoring)
5. Document your deployment process