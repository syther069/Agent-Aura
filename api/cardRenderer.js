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
    
    // Formatting wallet address as a serial number
    const cleanAddress = String(walletAddress || '');
    const shortAddress = cleanAddress.length >= 10 
        ? `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`
        : cleanAddress;

    const safeShortAddress = escapeXml(shortAddress).toUpperCase();
    const safeArchetype = escapeXml(archetype);
    const safeColor = escapeXml(color || '#10B981');
    const safeBgColor = escapeXml(bgColor || '#0A0D12');
    const safeGlowColor = escapeXml(glowColor || safeColor);
    const rarityLabel = escapeXml(rarity?.badge || 'RARE AURA').toUpperCase();
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `${stats.ageDays}D AGE` : '';
    const txText = stats ? `${stats.txCount} TXS` : '';
    const xLayerBadge = stats?.xLayerActive ? 'OKX X-LAYER' : '';
    const trustText = `TRUST ${trustScoreVal}/100`;
    const statLine = [ageText, txText, xLayerBadge, trustText].filter(Boolean).join('  ·  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&amp;family=Inter:wght@400;500;600&amp;display=swap');
                
                .bg { fill: ${safeBgColor}; }
                .border-outer { stroke: ${safeColor}; stroke-width: 1.5; fill: none; opacity: 0.35; }
                .border-inner { stroke: #1F2937; stroke-width: 1; fill: none; opacity: 0.6; }
                
                .serial {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    fill: #9CA3AF;
                    letter-spacing: 5px;
                    text-transform: uppercase;
                }
                
                .rarity-pill {
                    font-family: 'Inter', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    fill: ${safeColor};
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 64px;
                    font-weight: 700;
                    fill: #FFFFFF;
                    letter-spacing: -1.5px;
                }
                
                .reading {
                    font-family: 'Inter', sans-serif;
                    font-size: 23px;
                    font-weight: 400;
                    fill: #E5E7EB;
                    opacity: 0.88;
                    line-height: 1.5;
                }
                
                .stats-bar {
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    fill: ${safeColor};
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                }

                .footer {
                    font-family: 'Inter', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    fill: #6B7280;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                
                .line { stroke: #1F2937; stroke-width: 1; opacity: 0.8; }
            </style>
            
            <!-- Soft Dynamic Glow -->
            <radialGradient id="cardGlow" cx="50%" cy="38%" r="60%" fx="50%" fy="38%">
                <stop offset="0%" stop-color="${safeGlowColor}" stop-opacity="0.22" />
                <stop offset="50%" stop-color="${safeGlowColor}" stop-opacity="0.06" />
                <stop offset="100%" stop-color="${safeGlowColor}" stop-opacity="0" />
            </radialGradient>
        </defs>

        <!-- Base Dark Background -->
        <rect class="bg" width="100%" height="100%" />
        
        <!-- Aura Glow -->
        <circle cx="400" cy="450" r="520" fill="url(#cardGlow)" />
        
        <!-- Elegant Outer & Inner Borders -->
        <rect class="border-outer" x="35" y="35" width="730" height="1130" rx="12" />
        <rect class="border-inner" x="48" y="48" width="704" height="1104" rx="8" />
        
        <!-- Diamond Geometric Accent -->
        <polygon points="400,85 405,95 400,105 395,95" fill="${safeColor}" opacity="0.85"/>
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="145" text-anchor="middle">NO. ${safeShortAddress}</text>
        <line class="line" x1="280" y1="180" x2="520" y2="180" />
        
        <!-- Rarity Badge -->
        <rect x="250" y="202" width="300" height="32" rx="16" fill="#111827" stroke="${safeColor}" stroke-width="1" stroke-opacity="0.5"/>
        <text class="rarity-pill" x="400" y="223" text-anchor="middle">✦ ${rarityLabel} ✦</text>

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
        <rect x="65" y="915" width="670" height="44" rx="22" fill="#111827" stroke="#1F2937" stroke-width="1"/>
        ${statLine ? `<text class="stats-bar" x="400" y="942" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}

        <!-- Bottom Line -->
        <line class="line" x1="340" y1="1020" x2="460" y2="1020" />
        
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
