function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function generateCardSvg(walletAddress, archetypeData) {
    const { archetype, color, bgColor, glowColor, themeName, reading, stats, rarity, trust } = archetypeData;
    
    // Formatting the wallet address as a serial number (e.g. 0xAB...1234)
    const cleanAddress = String(walletAddress || '');
    const shortAddress = cleanAddress.length >= 10 
        ? `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`
        : cleanAddress;

    const safeShortAddress = escapeXml(shortAddress);
    const safeArchetype = escapeXml(archetype);
    const safeColor = escapeXml(color || '#10B981');
    const safeBgColor = escapeXml(bgColor || '#0B1310');
    const safeGlowColor = escapeXml(glowColor || safeColor);
    const rarityLabel = escapeXml(rarity?.badge || 'AURA CARD');
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `${stats.ageDays}D AGE` : '';
    const txText = stats ? `${stats.txCount} TXS` : '';
    const xLayerBadge = stats?.xLayerActive ? 'OKX X-LAYER' : '';
    const trustText = `TRUST ${trustScoreVal}/100`;
    const statLine = [ageText, txText, xLayerBadge, trustText].filter(Boolean).join('  ·  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&amp;family=Instrument+Sans:wght@400;500;600&amp;display=swap');
                
                .bg { fill: ${safeBgColor}; }
                .border-outer { stroke: ${safeColor}; stroke-width: 1.5; fill: none; opacity: 0.4; }
                .border-inner { stroke: ${safeColor}; stroke-width: 1; fill: none; opacity: 0.15; }
                
                .rarity-pill {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 11px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 68px;
                    font-weight: 300;
                    fill: #FFFFFF;
                    letter-spacing: -2px;
                }
                
                .reading {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 24px;
                    font-weight: 400;
                    fill: #E5E7EB;
                    opacity: 0.85;
                    letter-spacing: 0.3px;
                }
                
                .serial {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    fill: #9CA3AF;
                    letter-spacing: 6px;
                    text-transform: uppercase;
                    opacity: 0.7;
                }
                
                .stats-bar {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    opacity: 0.95;
                }

                .footer {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    fill: #6B7280;
                    opacity: 0.6;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                
                .line { stroke: ${safeColor}; stroke-width: 1; opacity: 0.2; }
            </style>
            
            <!-- Dynamic Theme Aura Glow -->
            <radialGradient id="auraGlow" cx="50%" cy="40%" r="55%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="${safeGlowColor}" stop-opacity="0.32" />
                <stop offset="50%" stop-color="${safeGlowColor}" stop-opacity="0.10" />
                <stop offset="100%" stop-color="${safeGlowColor}" stop-opacity="0" />
            </radialGradient>
            
            <!-- Noise filter for paper texture -->
            <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.04 0" />
            </filter>
        </defs>

        <!-- Base Background -->
        <rect class="bg" width="100%" height="100%" />
        
        <!-- The Dynamic Aura Glow -->
        <circle cx="400" cy="460" r="520" fill="url(#auraGlow)" />

        <!-- Noise Texture -->
        <rect width="100%" height="100%" style="pointer-events:none;" filter="url(#noise)" />
        
        <!-- Borders -->
        <rect class="border-outer" x="30" y="30" width="740" height="1140" />
        <rect class="border-inner" x="42" y="42" width="716" height="1116" />
        
        <!-- Geometric Accent (Diamond at the top) -->
        <polygon points="400,85 406,96 400,107 394,96" fill="${safeColor}" opacity="0.9"/>
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="145" text-anchor="middle">NO. ${safeShortAddress}</text>
        <line class="line" x1="280" y1="180" x2="520" y2="180" />
        
        <!-- Rarity Badge -->
        <text class="rarity-pill" x="400" y="212" text-anchor="middle">✦ ${rarityLabel} ✦</text>

        <!-- Main Content -->
        <g transform="translate(0, 480)">
            <!-- Title -->
            <text class="title" x="400" y="0" text-anchor="middle">${safeArchetype}</text>
            
            <!-- Reading Text -->
            <g transform="translate(0, 60)">
                ${wrapTextSvg(reading, 24, 580, 38, 'reading', 400, 'middle')}
            </g>
        </g>
        
        <!-- Stat Pills / Signals Bar -->
        ${statLine ? `<text class="stats-bar" x="400" y="940" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}

        <!-- Bottom Divider -->
        <line class="line" x1="340" y1="1020" x2="460" y2="1020" />
        
        <!-- Footer / CTA -->
        <text class="footer" x="400" y="1080" text-anchor="middle">REVEALED ON-CHAIN · OKX X-LAYER · AGENT AURA</text>
        
    </svg>`;
}

/**
 * Enhanced SVG text wrapper that supports text-anchoring and x-positioning.
 */
function wrapTextSvg(text, fontSize, maxWidth, lineHeight, className, x = 0, textAnchor = "start") {
    const words = String(text || '').split(' ');
    let lines = [];
    let currentLine = '';
    
    const charWidth = fontSize * 0.45; 
    const maxChars = Math.floor(maxWidth / charWidth);

    words.forEach(word => {
        if ((currentLine + word).length > maxChars) {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });
    lines.push(currentLine.trim());

    return lines.map((line, i) => {
        return `<text class="${className}" x="${x}" y="${i * lineHeight}" text-anchor="${textAnchor}">${escapeXml(line)}</text>`;
    }).join('');
}

module.exports = {
    generateCardSvg
};
