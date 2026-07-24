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
    const { archetype, color, reading, stats, rarity, trust } = archetypeData;
    
    // Formatting the wallet address as a serial number (e.g. 0xAB...1234)
    const cleanAddress = String(walletAddress || '');
    const shortAddress = cleanAddress.length >= 10 
        ? `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`
        : cleanAddress;

    const safeShortAddress = escapeXml(shortAddress);
    const safeArchetype = escapeXml(archetype);
    const safeColor = escapeXml(color || '#95A5A6');
    const rarityLabel = escapeXml(rarity?.badge || 'AURA CARD');
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `${stats.ageDays}D AGE` : '';
    const txText = stats ? `${stats.txCount} TXS` : '';
    const trustText = `TRUST ${trustScoreVal}/100`;
    const statLine = [ageText, txText, trustText].filter(Boolean).join('  ·  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&amp;family=Instrument+Sans:wght@400;500;600&amp;display=swap');
                
                .bg { fill: #F7F5F1; }
                .border-outer { stroke: ${safeColor}; stroke-width: 1; fill: none; opacity: 0.3; }
                .border-inner { stroke: ${safeColor}; stroke-width: 1; fill: none; opacity: 0.1; }
                
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
                    font-size: 70px;
                    font-weight: 300;
                    fill: #111110;
                    letter-spacing: -2px;
                }
                
                .reading {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 24px;
                    font-weight: 400;
                    fill: #111110;
                    opacity: 0.78;
                    letter-spacing: 0.3px;
                }
                
                .serial {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 16px;
                    font-weight: 600;
                    fill: #111110;
                    letter-spacing: 6px;
                    text-transform: uppercase;
                    opacity: 0.5;
                }
                
                .stats-bar {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    opacity: 0.9;
                }

                .footer {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    fill: #111110;
                    opacity: 0.35;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                
                .line { stroke: #111110; stroke-width: 1; opacity: 0.1; }
            </style>
            
            <!-- Beautiful subtle aura glow -->
            <radialGradient id="auraGlow" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="${safeColor}" stop-opacity="0.15" />
                <stop offset="50%" stop-color="${safeColor}" stop-opacity="0.05" />
                <stop offset="100%" stop-color="${safeColor}" stop-opacity="0" />
            </radialGradient>
            
            <!-- Noise filter for paper texture -->
            <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.035 0" />
            </filter>
        </defs>

        <!-- Base Background -->
        <rect class="bg" width="100%" height="100%" />
        
        <!-- Noise Texture -->
        <rect width="100%" height="100%" style="pointer-events:none;" filter="url(#noise)" />
        
        <!-- The Aura Glow -->
        <circle cx="400" cy="460" r="500" fill="url(#auraGlow)" />
        
        <!-- Borders -->
        <rect class="border-outer" x="30" y="30" width="740" height="1140" />
        <rect class="border-inner" x="42" y="42" width="716" height="1116" />
        
        <!-- Geometric Accent (A tiny diamond at the top) -->
        <polygon points="400,85 405,95 400,105 395,95" fill="${safeColor}" opacity="0.8"/>
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="145" text-anchor="middle">NO. ${safeShortAddress}</text>
        <line class="line" x1="300" y1="180" x2="500" y2="180" />
        
        <!-- Rarity Badge -->
        <text class="rarity-pill" x="400" y="210" text-anchor="middle">✦ ${rarityLabel} ✦</text>

        <!-- Main Content (Centered vertically around the glow) -->
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
        <line class="line" x1="360" y1="1020" x2="440" y2="1020" />
        
        <!-- Footer / CTA -->
        <text class="footer" x="400" y="1080" text-anchor="middle">REVEALED ON-CHAIN · AGENT AURA</text>
        
    </svg>`;
}

/**
 * Enhanced SVG text wrapper that supports text-anchoring and x-positioning.
 */
function wrapTextSvg(text, fontSize, maxWidth, lineHeight, className, x = 0, textAnchor = "start") {
    const words = String(text || '').split(' ');
    let lines = [];
    let currentLine = '';
    
    // Better character width approximation for varying fonts
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
