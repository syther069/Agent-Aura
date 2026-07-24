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
    
    // Formatting wallet address as a serial number
    const cleanAddress = String(walletAddress || '');
    const shortAddress = cleanAddress.length >= 10 
        ? `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`
        : cleanAddress;

    const safeShortAddress = escapeXml(shortAddress).toUpperCase();
    const safeArchetype = escapeXml(archetype);
    const safeColor = escapeXml(color || '#111110');
    const rarityLabel = escapeXml(rarity?.badge || 'RARE AURA').toUpperCase();
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `${stats.ageDays}D AGE` : '';
    const txText = stats ? `${stats.txCount} TXS` : '';
    const xLayerBadge = stats?.xLayerActive ? 'OKX X-LAYER' : 'ETH MAINNET';
    const trustText = `TRUST ${trustScoreVal}/100`;
    const statLine = [ageText, txText, xLayerBadge, trustText].filter(Boolean).join('   ·   ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap');
                
                .bg { fill: #F7F5F1; }
                .border-outer { stroke: ${safeColor}; stroke-width: 1.5; fill: none; opacity: 0.8; }
                .border-inner { stroke: ${safeColor}; stroke-width: 1; fill: none; opacity: 0.2; }
                
                .serial {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 14px;
                    font-weight: 500;
                    fill: #111110;
                    letter-spacing: 5px;
                    text-transform: uppercase;
                    opacity: 0.65;
                }
                
                .rarity-pill {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 11px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 72px;
                    font-weight: 300;
                    fill: #111110;
                    letter-spacing: -2px;
                }
                
                .reading {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 21px;
                    font-weight: 400;
                    fill: #171513;
                    opacity: 0.82;
                    line-height: 1.6;
                }
                
                .stats-bar {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 12px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                }

                .footer {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 12px;
                    font-weight: 500;
                    fill: #111110;
                    opacity: 0.4;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                
                .line { stroke: #111110; stroke-width: 1; opacity: 0.15; }
            </style>
            
            <!-- Soft Dynamic Aura Glow -->
            <radialGradient id="auraGlow" cx="50%" cy="40%" r="55%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="${safeColor}" stop-opacity="0.18" />
                <stop offset="60%" stop-color="${safeColor}" stop-opacity="0.04" />
                <stop offset="100%" stop-color="${safeColor}" stop-opacity="0" />
            </radialGradient>
            
            <!-- Paper Noise Texture Filter -->
            <filter id="paperNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.045 0" />
            </filter>
        </defs>

        <!-- Base Alabaster Paper Background -->
        <rect class="bg" width="100%" height="100%" />
        
        <!-- Subtle Paper Noise Texture -->
        <rect width="100%" height="100%" style="pointer-events:none;" filter="url(#paperNoise)" />

        <!-- Aura Glow -->
        <circle cx="400" cy="450" r="520" fill="url(#auraGlow)" />
        
        <!-- Architectural Borders -->
        <rect class="border-outer" x="35" y="35" width="730" height="1130" />
        <rect class="border-inner" x="47" y="47" width="706" height="1106" />
        
        <!-- Diamond Geometric Accent (◇) -->
        <polygon points="400,85 406,96 400,107 394,96" fill="${safeColor}" opacity="0.9"/>
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="145" text-anchor="middle">NO. ${safeShortAddress}</text>
        <line class="line" x1="280" y1="180" x2="520" y2="180" />
        
        <!-- Rarity Tag -->
        <text class="rarity-pill" x="400" y="215" text-anchor="middle">◇ ${rarityLabel} ◇</text>

        <!-- Main Content -->
        <g transform="translate(0, 480)">
            <!-- Title -->
            <text class="title" x="400" y="0" text-anchor="middle">${safeArchetype}</text>
            
            <!-- Reading Text Box -->
            <g transform="translate(0, 70)">
                ${wrapTextSvg(reading, 21, 580, 36, 'reading', 400, 'middle')}
            </g>
        </g>
        
        <!-- Stat Pills / Signals Bar -->
        <line class="line" x1="120" y1="915" x2="680" y2="915" />
        ${statLine ? `<text class="stats-bar" x="400" y="942" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}
        <line class="line" x1="120" y1="965" x2="680" y2="965" />

        <!-- Bottom Line -->
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
    
    const charWidth = fontSize * 0.5; 
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
