/**
 * Public routes that don't require authentication
 * These routes will not include Authorization header in HTTP requests
 */
export const PUBLIC_ROUTES = [
  '/shop',           // Shop homepage
  '/shop/products',  // Product listing
  '/shop/store',     // Store information
  '/login',          // Login page
  '/confirm-otp',    // OTP confirmation
  '/403',            // Forbidden page
];

/**
 * Check if a given URL is a public route
 * @param url - The URL to check
 * @returns true if the URL is a public route
 */
export function isPublicRoute(url: string): boolean {
  return PUBLIC_ROUTES.some(route => url.startsWith(route));
}

/**
 * Shop routes that will require authentication in the future
 * (e.g., when adding checkout, order creation features)
 */
export const FUTURE_PROTECTED_SHOP_ROUTES = [
  '/shop/checkout',
  '/shop/orders',
  '/shop/account',
];
