// map.js - Minimal D3 world map

let worldMapData = null;

export async function renderGlobalMap() {
    const panel = document.getElementById('mapPanel');
    if (!panel) {
        console.error('mapPanel not found');
        return;
    }

    console.log('renderGlobalMap called');

    // Check D3
    if (typeof d3 === 'undefined') {
        panel.innerHTML = '<div style="color:red;padding:20px;">D3 not loaded</div>';
        return;
    }

    // Check topojson
    if (typeof topojson === 'undefined') {
        panel.innerHTML = '<div style="color:red;padding:20px;">TopoJSON not loaded</div>';
        return;
    }

    console.log('D3 and TopoJSON OK');

    // Simple container
    panel.innerHTML = '<svg id="mapSvg" style="width:100%;height:100%;background:#0a1a14;"></svg>';

    const svg = d3.select('#mapSvg');
    const width = 800;
    const height = 500;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Projection
    const projection = d3.geoEquirectangular()
        .scale(130)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world data
    try {
        console.log('Loading world map data...');
        if (!worldMapData) {
            const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            worldMapData = await response.json();
        }
        console.log('World map data loaded');

        const countries = topojson.feature(worldMapData, worldMapData.objects.countries);

        svg.selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', '#0f3028')
            .attr('stroke', '#1a5040')
            .attr('stroke-width', 0.5);

        console.log('Map rendered successfully');
    } catch (e) {
        console.error('Map error:', e);
        panel.innerHTML = `<div style="color:red;padding:20px;">Map error: ${e.message}</div>`;
    }
}

export function analyzeHotspotActivity() {
    return {};
}
