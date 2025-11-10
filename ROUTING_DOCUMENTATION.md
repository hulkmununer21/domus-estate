# Domus Servitia - Deep Linking & Routing Documentation

## Overview
This document outlines the complete routing structure for the Domus Servitia website, including all deep linking implementations and configuration files necessary for proper SPA (Single Page Application) routing.

## Routing Configuration Files

### 1. **public/_redirects** (Netlify)
```
/* /index.html 200
```
This configuration ensures that all routes are redirected to index.html for client-side routing on Netlify deployments.

### 2. **vercel.json** (Vercel)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This configuration handles SPA routing for Vercel deployments, ensuring all URLs are properly routed to index.html.

### 3. **netlify.toml** (Netlify Alternative Configuration)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Alternative Netlify configuration for handling SPA routing.

## Complete Route Structure

### Public Routes (No Authentication Required)

| Route | Component | Description | SEO Optimized |
|-------|-----------|-------------|---------------|
| `/` | Index | Homepage with hero, services, properties, testimonials | ✅ |
| `/properties` | Properties | Property listing page with filters and search | ✅ |
| `/property/:id` | PropertyDetail | Individual property details with inquiry form | ✅ |
| `/about` | About | Company information, mission, values, team | ✅ |
| `/services` | ServicesPage | Detailed services information | ✅ |
| `/contact` | ContactPage | Contact form and office locations | ✅ |
| `/faq` | FAQ | Frequently asked questions by category | ✅ |
| `/submit-complaint` | SubmitComplaint | Complaint submission form | ✅ |
| `/login` | Login | User authentication login page | ✅ |
| `/signup` | Signup | User registration page | ✅ |

### Legal Pages (No Authentication Required)

| Route | Component | Description | SEO Optimized |
|-------|-----------|-------------|---------------|
| `/privacy` | Privacy | Privacy policy | ✅ |
| `/terms` | Terms | Terms of service | ✅ |
| `/cookies` | Cookies | Cookie policy | ✅ |
| `/gdpr` | GDPR | GDPR compliance information | ✅ |

### Protected Portal Routes (Authentication Required)

| Route | Component | Allowed Roles | Description | SEO Optimized |
|-------|-----------|---------------|-------------|---------------|
| `/lodger-portal` | LodgerPortal | lodger | Lodger dashboard with payments, documents, messages | ✅ |
| `/landlord-portal` | LandlordPortal | landlord | Landlord dashboard with property management | ✅ |
| `/staff-portal` | StaffPortal | staff | Staff management portal | ❌ |
| `/admin-portal` | AdminPortal | admin | Administrative control panel | ❌ |

### Error Pages

| Route | Component | Description | SEO Optimized |
|-------|-----------|-------------|---------------|
| `*` (404) | NotFound | Catch-all 404 error page | ✅ |

## Deep Linking Features

### Homepage Section Deep Links
The homepage supports hash-based deep linking to specific sections:

- `/#home` - Hero section
- `/#properties` - Featured properties section
- `/#services` - Services overview section
- `/#testimonials` - Client testimonials section
- `/#contact` - Contact form section

### Implementation Details

#### ScrollToTop Component
Located at: `src/components/ScrollToTop.tsx`

This component ensures that:
- Page navigation scrolls to top by default
- Hash-based navigation (deep links with #) preserves scroll position
- Works seamlessly with React Router

```typescript
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};
```

#### Protected Routes
Protected routes use the `ProtectedRoute` component that:
- Checks user authentication status
- Verifies user role permissions
- Redirects unauthorized users to login
- Maintains intended destination for post-login redirect

## Testing Checklist

### Desktop Testing
- [x] Direct URL access to all public pages
- [x] Direct URL access to property detail pages with various IDs
- [x] Homepage section deep links (/#home, /#services, etc.)
- [x] Browser refresh maintains correct page
- [x] Back/forward navigation works correctly
- [x] Protected routes redirect to login when not authenticated
- [x] Legal page links from footer
- [x] 404 page displays for invalid routes

### Mobile Testing
- [x] All deep links accessible on mobile browsers
- [x] Mobile menu navigation closes after link click
- [x] Scroll-to-top functionality works on mobile
- [x] Hash navigation scrolls to correct section on mobile
- [x] Protected portal access on mobile devices

### SEO Testing
- [x] All pages have unique meta titles
- [x] All pages have descriptive meta descriptions
- [x] Canonical URLs properly configured
- [x] Open Graph tags for social sharing
- [x] Proper semantic HTML structure (H1, main, nav, etc.)
- [x] Dynamic property page SEO with property-specific data

## URL Structure Best Practices

### Implemented Standards
1. **Kebab-case naming**: All multi-word routes use kebab-case (e.g., `/submit-complaint`)
2. **Semantic naming**: Route names clearly indicate content (e.g., `/lodger-portal`)
3. **Dynamic parameters**: Property details use standard `:id` parameter pattern
4. **No trailing slashes**: Routes defined without trailing slashes for consistency
5. **Hash navigation**: Homepage sections use hash-based navigation for smooth scrolling

### SEO-Friendly Features
- Clean, descriptive URLs
- Canonical URL specification on all pages
- Dynamic meta tags based on page content
- Proper heading hierarchy (single H1 per page)
- Semantic HTML5 elements throughout
- Alt attributes on all images
- Mobile-responsive design

## Known Limitations & Future Enhancements

### Current Limitations
1. Portal pages (admin, staff) do not have SEO implementation (by design - auth protected)
2. Property IDs are numeric - consider slugified URLs for better SEO
3. No sitemap.xml generation (should be added for production)
4. No robots.txt customization beyond basic file

### Recommended Enhancements
1. **Dynamic Sitemap**: Generate XML sitemap including all property listings
2. **Slugified URLs**: Convert property URLs from `/property/1` to `/property/modern-city-centre-studio-manchester`
3. **Breadcrumbs Schema**: Add structured data for breadcrumb navigation
4. **Property Schema**: Add structured data for real estate listings
5. **Search Functionality**: Implement search with URL parameter persistence
6. **Pagination**: Add pagination with URL state management for properties
7. **Filter State**: Persist filter selections in URL parameters

## Troubleshooting Common Issues

### Issue: 404 on Page Refresh
**Solution**: Ensure deployment platform has proper redirect configuration (_redirects, vercel.json, or netlify.toml)

### Issue: Hash Links Not Scrolling
**Solution**: Verify ScrollToTop component is imported and properly positioned in App.tsx router

### Issue: Protected Routes Not Working
**Solution**: Check AuthContext is wrapping routes and ProtectedRoute component has correct role configuration

### Issue: SEO Tags Not Updating
**Solution**: Verify SEO component is imported and placed before page content, ensure unique canonical URLs

## Maintenance Notes

When adding new routes:
1. Add route definition in `src/App.tsx`
2. Import and add SEO component to new page
3. Update this documentation with route details
4. Test deep linking on both desktop and mobile
5. Verify SEO tags with browser inspector
6. Add links to navigation/footer as appropriate
7. Test authentication requirements if applicable

## Contact & Support

For issues related to routing or deep linking:
- Review console errors in browser DevTools
- Check Network tab for failed route requests
- Verify authentication status for protected routes
- Consult this documentation for route structure

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0
**Maintained By**: Domus Servitia Development Team
