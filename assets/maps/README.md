# Map Assets

This directory contains TopoJSON map data files for the SA-DASH application.

## Files

- `countries-110m.json` - World countries map (low resolution)
- `states-10m.json` - US states map (medium resolution)

## Setup

These files should be downloaded from the world-atlas and us-atlas npm packages:

```bash
# Download world map
curl -o assets/maps/countries-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json

# Download US states map
curl -o assets/maps/states-10m.json https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
```

Or install via npm and copy:

```bash
npm install world-atlas us-atlas
cp node_modules/world-atlas/countries-110m.json assets/maps/
cp node_modules/us-atlas/states-10m.json assets/maps/
```

## Fallback

If these files are not present, the application will automatically fall back to fetching them from the CDN:
- https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
- https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json

## License

Map data is from Natural Earth and is in the public domain.
TopoJSON files are distributed under ISC license by Mike Bostock.
