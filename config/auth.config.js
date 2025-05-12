module.exports = {
  // Clerk webhook secret for webhook verification
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,
  // JWT secret for internal token generation (used as backup or for special cases)
  jwtSecret: process.env.JWT_SECRET || "fashionmart-jwt-secret-key-change-in-production",
  // JWT expiration time
  jwtExpiration: 86400, // 24 hours in seconds
};