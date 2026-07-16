function generateCardSvg(walletAddress, archetypeData) {
    const { archetype, color, reading } = archetypeData;
    
    // Formatting the wallet address as a serial number (e.g. 0xAB...1234)
    const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;

    // A subtle background color based on the accent color (using opacity/hex magic)
    // We can simulate a low opacity by blending with the off-white background (#F7F5F1).
    // In SVG, we can just use the color and set fill-opacity.
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
        <defs>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&amp;family=Instrument+Sans:wght@400;500&amp;display=swap');
                
                .bg { fill: #F7F5F1; }
                .accent-bg { fill: ${color}; fill-opacity: 0.05; }
                .border { stroke: ${color}; stroke-width: 2; fill: none; }
                
                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 72px;
                    font-weight: 300;
                    fill: ${color};
                    letter-spacing: -1px;
                }
                
                .reading {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 32px;
                    font-weight: 400;
                    fill: #171512;
                    line-height: 1.4;
                }
                
                .serial {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 20px;
                    font-weight: 500;
                    fill: #171512;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    opacity: 0.6;
                }
                
                .footer {
                    font-family: 'Instrument Sans', sans-serif;
                    font-size: 18px;
                    font-weight: 400;
                    fill: #171512;
                    opacity: 0.4;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                
                .line { stroke: ${color}; stroke-width: 1; opacity: 0.3; }
            </style>
        </defs>

        <!-- Base Background -->
        <rect class="bg" width="100%" height="100%" />
        
        <!-- Subtle tinted background overlay -->
        <rect class="accent-bg" width="100%" height="100%" />
        
        <!-- Outer Border -->
        <rect class="border" x="40" y="40" width="720" height="920" />
        
        <!-- Inner Structure Lines -->
        <line class="line" x1="40" y1="880" x2="760" y2="880" />
        <line class="line" x1="40" y1="120" x2="760" y2="120" />
        
        <!-- Header: Serial Number -->
        <text class="serial" x="400" y="85" text-anchor="middle">NO. ${shortAddress}</text>
        
        <!-- Main Content -->
        <!-- Since SVG text doesn't auto-wrap easily, we split the reading into tspan or manually wrap.
             For simplicity, we'll try to keep the reading short or use foreignObject, 
             but foreignObject has bad support in image tags. 
             We will write a simple word-wrapper here. -->
        <g transform="translate(80, 240)">
            <!-- Archetype Name (can be multiline if very long, but we assume it fits) -->
            ${wrapTextSvg(archetype, 72, 640, 0, 'title')}
        </g>
        
        <g transform="translate(80, 500)">
            <!-- Reading Text -->
            ${wrapTextSvg(reading, 32, 640, 45, 'reading')}
        </g>
        
        <!-- Footer / CTA -->
        <text class="footer" x="400" y="940" text-anchor="middle">TAG SOMEONE TO REVEAL THEIR AURA — OKX.AI</text>
        
    </svg>`;
}

/**
 * Very basic SVG text wrapper.
 */
function wrapTextSvg(text, fontSize, maxWidth, lineHeight, className) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    // Approximate character width (very rough)
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
        return `<text class="${className}" x="0" y="${i * lineHeight}">${line}</text>`;
    }).join('');
}

module.exports = {
    generateCardSvg
};
