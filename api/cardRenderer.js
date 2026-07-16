function generateCardSvg(walletAddress, archetypeData) {
    const { archetype, color, reading } = archetypeData;
    
    // Formatting the wallet address as a serial number (e.g. 0xAB...1234)
    const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200" width="800" height="1200">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&amp;family=Instrument+Sans:wght@400;500&amp;display=swap');
                
                .bg { fill: #F7F5F1; }
                .border-outer { stroke: ${color}; stroke-width: 1; fill: none; opacity: 0.3; }
                .border-inner { stroke: ${color}; stroke-width: 1; fill: none; opacity: 0.1; }
                
                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 76px;
                    font-weight: 300;
                    fill: #111110;
                    letter-spacing: -2px;
                }
                
                .reading {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 26px;
                    font-weight: 400;
                    fill: #111110;
                    opacity: 0.7;
                    letter-spacing: 0.5px;
                }
                
                .serial {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    fill: #111110;
                    letter-spacing: 6px;
                    text-transform: uppercase;
                    opacity: 0.5;
                }
                
                .footer {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    fill: #111110;
                    opacity: 0.3;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                }
                
                .line { stroke: #111110; stroke-width: 1; opacity: 0.1; }
            </style>
            
            <!-- Beautiful subtle aura glow -->
            <radialGradient id="auraGlow" cx="50%" cy="40%" r="50%" fx="50%" fy="40%">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.12" />
                <stop offset="50%" stop-color="${color}" stop-opacity="0.04" />
                <stop offset="100%" stop-color="${color}" stop-opacity="0" />
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
        <polygon points="400,90 405,100 400,110 395,100" fill="${color}" opacity="0.6"/>
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="150" text-anchor="middle">NO. ${shortAddress}</text>
        <line class="line" x1="300" y1="190" x2="500" y2="190" />
        
        <!-- Main Content (Centered vertically around the glow) -->
        <g transform="translate(0, 480)">
            <!-- Title -->
            <text class="title" x="400" y="0" text-anchor="middle">${archetype}</text>
            
            <!-- Reading Text -->
            <g transform="translate(0, 60)">
                ${wrapTextSvg(reading, 26, 560, 40, 'reading', 400, 'middle')}
            </g>
        </g>
        
        <!-- Bottom Divider -->
        <line class="line" x1="360" y1="1040" x2="440" y2="1040" />
        
        <!-- Footer / CTA -->
        <text class="footer" x="400" y="1090" text-anchor="middle">REVEALED ON-CHAIN</text>
        
    </svg>`;
}

/**
 * Enhanced SVG text wrapper that supports text-anchoring and x-positioning.
 */
function wrapTextSvg(text, fontSize, maxWidth, lineHeight, className, x = 0, textAnchor = "start") {
    const words = text.split(' ');
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
        return `<text class="${className}" x="${x}" y="${i * lineHeight}" text-anchor="${textAnchor}">${line}</text>`;
    }).join('');
}

module.exports = {
    generateCardSvg
};
