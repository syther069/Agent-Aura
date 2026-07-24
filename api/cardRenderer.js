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
    const safeColor = escapeXml(color || '#FFFFFF');
    const safeGlowColor = escapeXml(glowColor || '#94A3B8');
    const rarityLabel = escapeXml(rarity?.badge || 'RARE ARCHETYPE').toUpperCase();
    const trustScoreVal = trust?.trustScore || stats?.trustScore || 85;
    
    const ageText = stats ? `${stats.ageDays} DAYS` : '';
    const txText = stats ? `${stats.txCount} TRANS` : '';
    const xLayerBadge = stats?.xLayerActive ? 'X-LAYER' : 'ETHEREUM';
    const trustText = `TRUST ${trustScoreVal}%`;
    const statLine = [ageText, txText, xLayerBadge, trustText].filter(Boolean).join('   ·   ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap');
                
                .bg { fill: #000000; }
                .glass-card-base { fill: rgba(255, 255, 255, 0.03); stroke: rgba(255, 255, 255, 0.15); stroke-width: 1.5; }
                .glass-highlight-ring { fill: none; stroke: url(#specularGrad); stroke-width: 1.2; opacity: 0.65; }
                .glass-accent-circle { fill: none; stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
                .glass-accent-line { stroke: rgba(255, 255, 255, 0.08); stroke-width: 1; }
                
                .serial {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 13px;
                    font-weight: 500;
                    fill: #E2E8F0;
                    letter-spacing: 6px;
                }
                
                .rarity-pill {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 10px;
                    font-weight: 600;
                    fill: #FFFFFF;
                    letter-spacing: 4px;
                }

                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 56px;
                    font-weight: 300;
                    fill: #F5F3EF;
                    letter-spacing: 2px;
                }
                
                .reading {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 19px;
                    font-weight: 400;
                    fill: #CBD5E1;
                    line-height: 1.7;
                    letter-spacing: 0.5px;
                }
                
                .stats-bar {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 11px;
                    font-weight: 600;
                    fill: #E2E8F0;
                    letter-spacing: 3px;
                }

                .footer {
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 11px;
                    font-weight: 500;
                    fill: #64748B;
                    letter-spacing: 5px;
                }
            </style>
            
            <!-- Luxury Specular Reflection Gradient -->
            <linearGradient id="specularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
                <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.1" />
                <stop offset="70%" stop-color="#94A3B8" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.6" />
            </linearGradient>

            <!-- Dynamic Liquid Background Glow -->
            <radialGradient id="auraGlow" cx="50%" cy="42%" r="50%" fx="50%" fy="42%">
                <stop offset="0%" stop-color="${safeGlowColor}" stop-opacity="0.22" />
                <stop offset="60%" stop-color="${safeGlowColor}" stop-opacity="0.05" />
                <stop offset="100%" stop-color="${safeGlowColor}" stop-opacity="0" />
            </radialGradient>
        </defs>

        <!-- Base Background -->
        <rect class="bg" width="100%" height="100%" />

        <!-- Liquid Ambient Glow -->
        <circle cx="400" cy="450" r="500" fill="url(#auraGlow)" />
        
        <!-- Overlapping Glass Plates & Specular Geometry -->
        <rect class="glass-card-base" x="40" y="40" width="720" height="1120" rx="20" />
        <rect class="glass-highlight-ring" x="52" y="52" width="696" height="1096" rx="16" />
        
        <!-- Abstract Glass Circular Rings (Simulating Liquid Lens Refractions) -->
        <circle class="glass-accent-circle" cx="400" cy="450" r="320" />
        <circle class="glass-accent-circle" cx="400" cy="450" r="240" />
        <path d="M 120 450 A 280 280 0 0 1 680 450" fill="none" stroke="url(#specularGrad)" stroke-width="1.5" opacity="0.4" />
        <path d="M 200 450 A 200 200 0 0 0 600 450" fill="none" stroke="url(#specularGrad)" stroke-width="1.2" opacity="0.3" />

        <!-- Decorative Technical Glass Lines -->
        <line class="glass-accent-line" x1="40" y1="280" x2="760" y2="280" />
        <line class="glass-accent-line" x1="40" y1="880" x2="760" y2="880" />
        <line class="glass-accent-line" x1="120" y1="40" x2="120" y2="1160" />
        <line class="glass-accent-line" x1="680" y1="40" x2="680" y2="1160" />
        
        <!-- Header: Serial number -->
        <text class="serial" x="400" y="115" text-anchor="middle">RESONANCE ID: ${safeShortAddress}</text>
        <line class="glass-accent-line" x1="300" y1="145" x2="500" y2="145" />
        
        <!-- Rarity Badge (Minimal Glass Frame) -->
        <rect x="250" y="180" width="300" height="34" rx="17" fill="rgba(255,255,255,0.02)" stroke="url(#specularGrad)" stroke-width="1" />
        <text class="rarity-pill" x="400" y="202" text-anchor="middle">◇ ${rarityLabel} ◇</text>

        <!-- Main Content -->
        <g transform="translate(0, 470)">
            <!-- Title -->
            <text class="title" x="400" y="0" text-anchor="middle">${safeArchetype}</text>
            
            <!-- Reading Text Box -->
            <g transform="translate(0, 80)">
                ${wrapTextSvg(reading, 19, 500, 36, 'reading', 400, 'middle')}
            </g>
        </g>
        
        <!-- Stat signals -->
        <rect x="80" y="930" width="640" height="46" rx="23" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        ${statLine ? `<text class="stats-bar" x="400" y="958" text-anchor="middle">${escapeXml(statLine)}</text>` : ''}

        <!-- Footer / CTA -->
        <line class="glass-accent-line" x1="320" y1="1040" x2="480" y2="1040" />
        <text class="footer" x="400" y="1090" text-anchor="middle">ON-CHAIN DECENTRALIZED PROTOCOL · AGENT AURA</text>
        
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
