// session.js
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require("./db"); // Adjust the path as needed

// Initialize the session store
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions",
  checkExpirationInterval: 15 * 60 * 1000, // Remove expired sessions every 15 minutes
  expiration: 24 * 60 * 60 * 1000, // Sessions expire after 1 day
});

// Synchronize the session store with the database
sessionStore.sync().catch((err) => {
  console.error("Error syncing session store:", err);
});

// Initialize session middleware
const sessionMiddleware = session({
  store: sessionStore,
  name: "session", // Name of the session ID cookie
  secret: process.env.SESSION_SECRET || "default-secret", // Replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  },
});


// sessionStore.sync({ force: true }).catch((err) => {
//   console.error("Error syncing session store:", err);
// });

module.exports = { sessionMiddleware, sessionStore };