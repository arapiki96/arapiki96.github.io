import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  // Content Security Policy
  // Note: 'unsafe-inline' is required for Astro's inline scripts and styles
  // Consider tightening this further if you remove all inline scripts
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Astro uses inline scripts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Google Fonts
    "font-src 'self' https://fonts.gstatic.com", // Google Fonts
    "img-src 'self' data: https:", // Allow images from any HTTPS source
    "connect-src 'self' https://businessdesk.co.nz", // BusinessDesk feed
    "frame-ancestors 'self'", // Prevent clickjacking
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  return next().then((response) => {
    // Security headers
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Strict-Transport-Security (HSTS)
    // GitHub Pages serves over HTTPS, so this is safe
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
  });
});
