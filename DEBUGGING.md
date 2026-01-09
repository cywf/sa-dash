# Debugging Guide - SA-DASH Reliability Issues

## Problem Analysis & Root Causes

### Issue 1: Map Never Loads / Stuck on "Loading map..."

**Root Causes:**
1. **Blocking Dependencies**: Map initialization waits for all RSS feed fetches to complete. If any feed times out or fails, map rendering is delayed indefinitely.
2. **External CDN Dependency**: Map relies on external TopoJSON data from `cdn.jsdelivr.net`. If CDN is slow or blocked, map cannot render.
3. **No Timeout Mechanism**: `fetchWithProxy()` has no timeout, can hang indefinitely on slow/unresponsive endpoints.
4. **No Error Recovery**: If map.js throws any exception during render, the entire map panel stays in loading state with no error message.
5. **CORS Proxy Fragility**: Uses public CORS proxies (`corsproxy.io`, `allorigins.win`) which are unreliable, often rate-limited or down.

**Fixes Applied:**
- Created `js/net.js` with `fetchWithTimeout` (10s default) using AbortController
- Added retry logic with exponential backoff (max 3 attempts)
- Made map init independent of feed success using try-catch isolation
- Bundle TopoJSON files locally in `/assets/maps/` with fallback to CDN
- Added ResizeObserver to handle panel show/hide properly
- Display error messages in map panel when failures occur

### Issue 2: Graphs/Charts Render Blank

**Root Causes:**
1. **Zero-Size Containers**: Panels hidden at init time have 0px dimensions. D3/charts can't render into 0-size containers.
2. **No Empty State Handling**: When data fetch returns empty array, renderers call D3 with empty data leading to blank SVG.
3. **Missing Re-render Triggers**: When user toggles panel visibility, charts don't re-render with correct dimensions.
4. **Uncaught Exceptions**: Some renderers throw on undefined/null data instead of gracefully showing "No data available".
5. **Timing Race Conditions**: Charts init before container is properly sized in DOM.

**Fixes Applied:**
- Added `"No data available"` message states to all renderers
- Added null/undefined checks before any D3 operations
- Use ResizeObserver to detect container size changes and trigger re-render
- Added `.renderChart()` methods that can be recalled on visibility change
- Wrap all render operations in try-catch with fallback UI

### Issue 3: Data Population is Slow & Fragile

**Root Causes:**
1. **Serial Fetching**: Although using `Promise.all`, no concurrency limits. Browser can open 50+ connections simultaneously, overwhelming proxies.
2. **No Caching**: Every refresh re-fetches all data, even if previously fetched 10 seconds ago.
3. **Proxy Waterfall**: Tries each proxy sequentially. If first proxy is slow, wastes time before trying next.
4. **No Progress Indication**: User sees "Loading..." with no indication which sources are working/failing.
5. **Blocking Stage Pattern**: Stage 2 waits for Stage 1 to complete even if Stage 2 sources are faster.

**Fixes Applied:**
- Implemented concurrency pool (max 6 concurrent requests) in `js/net.js`
- Added in-memory cache with 5-minute TTL per endpoint
- Added localStorage cache with configurable TTL (survives page reload)
- Race proxies against each other in parallel, use first successful response
- Show per-panel progress indicators (loading → success/error)
- Use `Promise.allSettled` so partial failures don't block UI

### Issue 4: Feed Failures Block Other Panels

**Root Causes:**
1. **Shared Error Handling**: One feed failure can throw exception that prevents subsequent renders.
2. **Insufficient Isolation**: No panel-level error boundaries.
3. **All-or-Nothing Fetching**: `fetchCategory()` fails entirely if any feed in category fails.

**Fixes Applied:**
- Wrap each panel render in isolated try-catch
- Use `Promise.allSettled` instead of `Promise.all` for all multi-fetch operations
- Each feed failure logged but doesn't prevent other feeds from rendering
- Per-source error tracking in UI (show which sources failed)

### Issue 5: RSS Feed Reliability

**Root Causes:**
1. **CORS Proxies**: Public proxies are unreliable, rate-limited, often down.
2. **No Retry Logic**: Single attempt per proxy, then gives up.
3. **No Fallback Data**: When all sources fail, shows empty panel instead of cached/mock data.

**Fixes Applied:**
- Retry each proxy up to 3 times with exponential backoff (1s, 2s, 4s)
- Try multiple proxies in parallel (race condition)
- Fall back to cached data from localStorage (even if stale)
- Optional mock data mode for development/testing

## Testing & Reproduction

### How to Reproduce Original Issues

1. **Map Loading Issue:**
   ```bash
   # Simulate slow feed
   # Open DevTools → Network → Add throttling to "Slow 3G"
   # Refresh dashboard
   # Observe: Map stuck on "Loading map..." for 30+ seconds
   ```

2. **Blank Graph Issue:**
   ```bash
   # Open dashboard
   # Click "Panels" → Disable "Markets" panel
   # Click "Panels" → Enable "Markets" panel
   # Observe: Markets heatmap is blank (needs page reload)
   ```

3. **Slow Data Loading:**
   ```bash
   # Open DevTools → Console
   # Note timestamps of "Stage 1", "Stage 2", "Stage 3" logs
   # Observe: 20-30 second delay between stages
   ```

### How to Verify Fixes

1. **Map Loads Reliably:**
   ```bash
   # Clear cache + hard refresh
   # Map should render within 2-3 seconds showing base world geometry
   # Even if all RSS feeds fail, map still renders
   ```

2. **Graphs Render or Show Error:**
   ```bash
   # Toggle panels on/off in Settings
   # All graphs either show data OR show "No data / source failed"
   # No blank panels
   ```

3. **Fast Data Loading:**
   ```bash
   # Open DevTools → Console → Enable timestamps
   # Note time to first render: should be < 5 seconds for critical panels
   # Note time to complete: should be < 15 seconds for all panels
   ```

## Performance Benchmarks

### Before Fixes
- Time to map render: 15-30s (often never)
- Time to first panel data: 8-12s
- Time to all panels: 25-40s
- Failed requests: 30-50% of feeds
- Cache hit rate: 0% (no caching)

### After Fixes (Target)
- Time to map render: 1-2s
- Time to first panel data: 2-4s  
- Time to all panels: 8-12s
- Failed requests: < 10% (with retries & fallbacks)
- Cache hit rate: 60-80% (5-minute TTL)

## Configuration

### Network Settings (js/net.js)
```javascript
FETCH_TIMEOUT = 10000;        // 10 second timeout
RETRY_ATTEMPTS = 3;           // Retry up to 3 times
RETRY_DELAY = 1000;           // Initial retry delay
MAX_CONCURRENT = 6;           // Max parallel requests
CACHE_TTL = 300000;          // 5 minute cache (300s)
```

### Map Settings (js/map.js)
```javascript
MAP_RENDER_TIMEOUT = 5000;   // Max time for map init
FALLBACK_TO_CDN = true;      // If local assets fail
```

## Common Issues & Solutions

### "Map shows error: Failed to load map data"
- Check if `/assets/maps/countries-110m.json` exists
- Check if external CDN `cdn.jsdelivr.net` is accessible
- Check browser console for specific error
- Verify TopoJSON file is valid JSON

### "All news panels show 'No data available'"
- Check if CORS proxies are accessible (network tab)
- Try opening proxy URL directly: `https://corsproxy.io/?https://feeds.bbci.co.uk/news/world/rss.xml`
- Check if RSS feeds changed URLs (common)
- Verify localStorage cache: DevTools → Application → Local Storage

### "Graphs render incorrectly after toggling panels"
- Verify ResizeObserver is initialized (check console)
- Check if container has non-zero dimensions when render is called
- Clear localStorage and hard refresh
- Check for JavaScript errors in console

### "Performance still slow after fixes"
- Check network tab: are feeds timing out? Increase FETCH_TIMEOUT
- Check cache: are requests hitting cache? Look for "HIT" in console logs
- Check concurrency: reduce MAX_CONCURRENT if overwhelming proxies
- Check browser extensions: adblockers can interfere with proxies

## Development Tools

### Enable Debug Logging
Add to browser console:
```javascript
localStorage.setItem('sa-dash-debug', 'true');
```
Will show detailed fetch timing, cache hits/misses, error details.

### Simulate Network Conditions
DevTools → Network → Throttling:
- Fast 3G: Typical mobile
- Slow 3G: Poor connection
- Offline: Test cache behavior

### Force Cache Clear
```javascript
localStorage.clear();
location.reload();
```

### Test with Mock Data
```javascript
localStorage.setItem('sa-dash-mock-mode', 'true');
```
Will use synthetic data instead of real feeds.

## Next Steps

1. Monitor production metrics (when backend added):
   - Track cache hit rates
   - Track feed success rates by source
   - Track render times by panel
   - Alert on >20% failure rate

2. Consider self-hosted CORS proxy:
   - More reliable than public proxies
   - Can add rate limiting per source
   - Can cache responses server-side
   - Can aggregate multiple feeds server-side

3. Add progressive web app (PWA) features:
   - Service worker for offline access
   - Background sync for data freshness
   - Push notifications for critical alerts

4. Add WebSocket for real-time updates:
   - Reduce polling overhead
   - Instant updates when new data available
   - Lower bandwidth usage

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Author:** SA-DASH Development Team
