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
    const { archetype, color, bgColor, glowColor, reading, stats, rarity, trust } = archetypeData;
    
    // Formatting the wallet address as a serial number (e.g. 0xAB...1234)
    const cleanAddress = String(walletAddress || '');
    const shortAddress = cleanAddress.length >= 10 
        ? `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`
        : cleanAddress;

    const safeShortAddress = escapeXml(shortAddress).toUpperCase();
    const safeArchetype = escapeXml(archetype);
    const safeColor = escapeXml(color || '#A3E635');
    const safeBgColor = escapeXml(bgColor || '#080A0D');
    const safeGlowColor = escapeXml(glowColor || safeColor);
    const rarityLabel = escapeXml(rarity?.badge || 'RARE AURA').toUpperCase();
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `AGE: ${stats.ageDays}D` : '';
    const txText = stats ? `TXS: ${stats.txCount}` : '';
    const xLayerBadge = stats?.xLayerActive ? 'X-LAYER: ACTIVE' : 'CHAIN: ETH MAINNET';
    const trustText = `TRUST: ${trustScoreVal}/100`;
    const statLine = [ageText, txText, xLayerBadge, trustText].filter(Boolean).join('  //  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&amp;family=JetBrains+Mono:wght@400;500;600;700&amp;display=swap');
                
                .bg { fill: ${safeBgColor}; }
                .border-main { stroke: ${safeColor}; stroke-width: 1.5; fill: none; opacity: 0.5; }
                .border-sub { stroke: #1E232B; stroke-width: 1; fill: none; }
                .grid-line { stroke: #1E232B; stroke-width: 1; stroke-dasharray: 4 4; opacity: 0.4; }
                
                .corner-tick {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 16px;
                    font-weight: 700;
                    fill: ${safeColor};
                    opacity: 0.8;
                }

                .header-tag {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }

                .serial {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 15px;
                    font-weight: 600;
                    fill: #9CA3AF;
                    letter-spacing: 5px;
                    text-transform: uppercase;
                }
                
                .rarity-pill {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    fill: ${safeColor};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 64px;
                    font-weight: 700;
                    fill: #FFFFFF;
                    letter-spacing: -1.5px;
                }
                
                .reading {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 23px;
                    font-weight: 400;
                    fill: #D1D5DB;
                    opacity: 0.88;
                    line-height: 1.5;
                }
                
                .stats-bar {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                }

                .footer {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    font-weight: 500;
                    fill: #6B7280;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
            </style>
            
            <!-- Dynamic Matrix Glow -->
            <radialGradient id="matrixGlow" cx="50%" cy="40%" r="60%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="${safeGlowColor}" stop-opacity="0.25" />
                <stop offset="50%" stop-color="${safeGlowColor}" stop-opacity="0.08" />
                <stop offset="100%" stop-color="${safeGlowColor}" stop-opacity="0" />
            </radialGradient>

            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E232B" stroke-width="0.8" opacity="0.3"/>
            </pattern>
        </defs>

        <!-- Base Dark Background -->
        <rect class="bg" width="100%" height="100%" />
        
        <!-- Grid Pattern Overlay -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Radial Aura Glow -->
        <circle cx="400" cy="460" r="540" fill="url(#matrixGlow)" />
        
        <!-- Technical Outer & Inner Borders -->
        <rect class="border-main" x="35" y="35" width="730" height="1130" />
        <rect class="border-sub" x="47" y="47" width="706" height="1106" />
        
        <!-- Corner Crosshairs (+) -->
        <text class="corner-tick" x="42" y="58" text-anchor="start">+</text>
        <text class="corner-tick" x="758" y="58" text-anchor="end">+</text>
        <text class="corner-tick" x="42" y="1150" text-anchor="start">+</text>
        <text class="corner-tick" x="758" y="1150" text-anchor="end">+</text>
        
        <!-- Top Terminal Header -->
        <text class="header-tag" x="400" y="95" text-anchor="middle">// AGENT AURA ORACLE / X LAYER 196</text>
        <line class="grid-line" x1="80" y1="115" x2="720" y2="115" />
        
        <!-- Serial Number -->
        <text class="serial" x="400" y="155" text-anchor="middle">SERIAL: ${safeShortAddress}</text>
        <line class="grid-line" x1="280" y1="185" x2="520" y2="185" />
        
        <!-- Rarity Badge Box -->
        <rect x="250" y="205" width="300" height="32" rx="4" fill="#111318" stroke="${safeColor}" stroke-width="1" opacity="0.9"/>
        <text class="rarity-pill" x="400" y="226" text-anchor="middle">✦ ${rarityLabel} ✦</text>

        <!-- Main Content -->
        <g transform="translate(0, 480)">
            <!-- Title -->
            <text class="title" x="400" y="0" text-anchor="middle">${safeArchetype}</text>
            
            <!-- Reading Text Box -->
            <g transform="translate(0, 65)">
                ${wrapTextSvg(reading, 23, 580, 38, 'reading', 400, 'middle')}
            </g>
        </g>
        
        <!-- Stat Pills / Signals Bar -->
        <rect x="65" y="915" width="670" height="42" rx="4" fill="#111318" stroke="#1E232B" stroke-width="1" opacity="0.95"/>
        ${statLine ? `<text class="stats-bar" x="400" y="941" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}

        <!-- Bottom Line -->
        <line class="grid-line" x1="320" y1="1020" x2="480" y2="1020" />
        
        <!-- Footer / CTA -->
        <text class="footer" x="400" y="1080" text-anchor="middle">SOULBOUND ON-CHAIN AURA · OKX X-LAYER</text>
        
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
