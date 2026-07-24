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
    const { archetype, color, glowColor, reading, stats, rarity, trust } = archetypeData;
    
    // Formatting wallet address as a serial number
    const cleanAddress = String(walletAddress || '');
    const shortAddress = cleanAddress.length >= 10 
        ? `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`
        : cleanAddress;

    const safeShortAddress = escapeXml(shortAddress).toUpperCase();
    const safeArchetype = escapeXml(archetype);
    const safeColor = escapeXml(color || '#F7F5F1');
    const safeGlowColor = escapeXml(glowColor || safeColor);
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
                
                .bg { fill: #0B0D12; }
                .border-outer { stroke: ${safeColor}; stroke-width: 1.5; fill: none; opacity: 0.6; }
                .border-inner { stroke: #1F2937; stroke-width: 1; fill: none; opacity: 0.8; }
                
                .serial {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 14px;
                    font-weight: 500;
                    fill: #9CA3AF;
                    letter-spacing: 5px;
                    text-transform: uppercase;
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
                    font-size: 70px;
                    font-weight: 300;
                    fill: #F7F5F1;
                    letter-spacing: -2px;
                }
                
                .reading {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 21px;
                    font-weight: 400;
                    fill: #E5E7EB;
                    opacity: 0.85;
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
                    fill: #6B7280;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                
                .line { stroke: #1F2937; stroke-width: 1; opacity: 0.8; }
            </style>
            
            <!-- Soft Dynamic Dark Aura Glow -->
            <radialGradient id="auraGlow" cx="50%" cy="40%" r="55%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="${safeGlowColor}" stop-opacity="0.25" />
                <stop offset="60%" stop-color="${safeGlowColor}" stop-opacity="0.06" />
                <stop offset="100%" stop-color="${safeGlowColor}" stop-opacity="0" />
            </radialGradient>
        </defs>

        <!-- Base Dark Obsidian Background -->
        <rect class="bg" width="100%" height="100%" />

        <!-- Aura Glow -->
        <circle cx="400" cy="450" r="520" fill="url(#auraGlow)" />
        
        <!-- Architectural Borders -->
        <rect class="border-outer" x="35" y="35" width="730" height="1130" rx="12" />
        <rect class="border-inner" x="47" y="47" width="706" height="1106" rx="8" />
        
        <!-- Diamond Geometric Accent (◇) -->
        <polygon points="400,85 406,96 400,107 394,96" fill="${safeColor}" opacity="0.9"/>
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="145" text-anchor="middle">NO. ${safeShortAddress}</text>
        <line class="line" x1="280" y1="180" x2="520" y2="180" />
        
        <!-- Rarity Tag -->
        <rect x="240" y="202" width="320" height="32" rx="16" fill="#111827" stroke="${safeColor}" stroke-width="1" stroke-opacity="0.5"/>
        <text class="rarity-pill" x="400" y="223" text-anchor="middle">◇ ${rarityLabel} ◇</text>

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
        <rect x="65" y="915" width="670" height="44" rx="22" fill="#111827" stroke="#1F2937" stroke-width="1"/>
        ${statLine ? `<text class="stats-bar" x="400" y="942" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}

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
