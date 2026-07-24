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
    const safeArchetype = escapeXml(archetype).toUpperCase();
    const safeColor = escapeXml(color || '#1E1E1E');
    const safeGlowColor = escapeXml(glowColor || '#E8D5B7');
    const rarityLabel = escapeXml(rarity?.badge || 'RARE SPECIMEN').toUpperCase();
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `${stats.ageDays} DAYS` : '';
    const txText = stats ? `${stats.txCount} TRANS` : '';
    const xLayerBadge = stats?.xLayerActive ? 'X-LAYER 196' : 'ETHEREUM';
    const trustText = `RESONANCE ${trustScoreVal}%`;
    const statLine = [ageText, txText, xLayerBadge, trustText].filter(Boolean).join('   ·   ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;family=Manrope:wght@500;600;700&amp;display=swap');
                
                .bg { fill: #F7F5F0; }
                .machined-outer-frame { fill: rgba(255, 254, 252, 0.40); stroke: rgba(30, 30, 30, 0.12); stroke-width: 1.5; }
                .machined-inner-bevel { fill: none; stroke: rgba(255, 255, 255, 0.85); stroke-width: 1.2; }
                .brass-edge-accent { fill: none; stroke: #E8D5B7; stroke-width: 1; opacity: 0.6; }
                .caustic-ray-line { stroke: rgba(232, 213, 183, 0.45); stroke-width: 1; fill: none; }
                .cool-refraction-line { stroke: rgba(200, 220, 235, 0.35); stroke-width: 0.8; fill: none; }
                .reticle-hairline { stroke: rgba(30, 30, 30, 0.05); stroke-width: 0.5; }
                
                .serial {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 13px;
                    font-weight: 500;
                    fill: #7A756E;
                    letter-spacing: 6px;
                }
                
                .rarity-pill {
                    font-family: 'Manrope', sans-serif;
                    font-size: 10px;
                    font-weight: 700;
                    fill: #1E1E1E;
                    letter-spacing: 4px;
                }

                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 54px;
                    font-weight: 300;
                    fill: #1E1E1E;
                    letter-spacing: 1px;
                }
                
                .reading {
                    font-family: 'Manrope', sans-serif;
                    font-size: 18px;
                    font-weight: 400;
                    fill: #4A4640;
                    line-height: 1.7;
                    letter-spacing: -0.01em;
                }
                
                .stats-bar {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 11px;
                    font-weight: 600;
                    fill: #1E1E1E;
                    letter-spacing: 3px;
                }

                .footer {
                    font-family: 'Manrope', sans-serif;
                    font-size: 10px;
                    font-weight: 600;
                    fill: #7A756E;
                    letter-spacing: 5px;
                }
            </style>
            
            <!-- Iridescent Bevel Specular Gradient -->
            <linearGradient id="iridescentBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E8D5B7" stop-opacity="0.8" />
                <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#C8DCEB" stop-opacity="0.6" />
            </linearGradient>

            <!-- Focused Sunlight Caustic Glow -->
            <radialGradient id="causticGlow" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="#E8D5B7" stop-opacity="0.28" />
                <stop offset="50%" stop-color="#E8D5B7" stop-opacity="0.08" />
                <stop offset="100%" stop-color="#F7F5F0" stop-opacity="0" />
            </radialGradient>
        </defs>

        <!-- Base Rice Paper Ground -->
        <rect class="bg" width="100%" height="100%" />

        <!-- Caustic Light Spot -->
        <circle cx="400" cy="450" r="480" fill="url(#causticGlow)" />
        
        <!-- Precision Machined Double-Line Borosilicate Frame -->
        <rect class="machined-outer-frame" x="40" y="40" width="720" height="1120" rx="4" />
        <rect class="machined-inner-bevel" x="44" y="44" width="712" height="1112" rx="2" />
        <rect class="brass-edge-accent" x="48" y="48" width="704" height="1104" rx="2" />
        
        <!-- Geometric Crystal Refraction Caustic Paths -->
        <path class="caustic-ray-line" d="M 60 220 Q 400 120 740 220" />
        <path class="cool-refraction-line" d="M 60 230 Q 400 130 740 230" />
        <path class="caustic-ray-line" d="M 60 920 Q 400 1020 740 920" />
        <path class="cool-refraction-line" d="M 60 910 Q 400 1010 740 910" />

        <!-- Optical Reticle Lines -->
        <line class="reticle-hairline" x1="40" y1="280" x2="760" y2="280" />
        <line class="reticle-hairline" x1="40" y1="880" x2="760" y2="880" />
        <line class="reticle-hairline" x1="120" y1="40" x2="120" y2="1160" />
        <line class="reticle-hairline" x1="680" y1="40" x2="680" y2="1160" />
        <circle cx="400" cy="450" r="280" stroke="rgba(30,30,30,0.04)" stroke-width="0.5" fill="none" />
        
        <!-- Header: Specimen Serial -->
        <text class="serial" x="400" y="115" text-anchor="middle">SPECIMEN NO: ${safeShortAddress}</text>
        <line class="reticle-hairline" x1="300" y1="145" x2="500" y2="145" />
        
        <!-- Rarity Badge (Brass-Trimmed Glass Slide Tag) -->
        <rect x="240" y="180" width="320" height="34" rx="2" fill="rgba(255,254,252,0.8)" stroke="#E8D5B7" stroke-width="1" />
        <text class="rarity-pill" x="400" y="202" text-anchor="middle">◇ ${rarityLabel} ◇</text>

        <!-- Main Specimen Content -->
        <g transform="translate(0, 470)">
            <!-- Title -->
            <text class="title" x="400" y="0" text-anchor="middle">${safeArchetype}</text>
            
            <!-- Reading Text Box -->
            <g transform="translate(0, 80)">
                ${wrapTextSvg(reading, 18, 500, 34, 'reading', 400, 'middle')}
            </g>
        </g>
        
        <!-- Stat Signal Bar -->
        <rect x="80" y="930" width="640" height="46" rx="2" fill="rgba(255,254,252,0.85)" stroke="rgba(30,30,30,0.08)" stroke-width="1" />
        ${statLine ? `<text class="stats-bar" x="400" y="958" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}

        <!-- Footer / CTA -->
        <line class="reticle-hairline" x1="320" y1="1040" x2="480" y2="1040" />
        <text class="footer" x="400" y="1090" text-anchor="middle">PRECISION OPTICAL OBSERVATION · AGENT AURA</text>
        
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
