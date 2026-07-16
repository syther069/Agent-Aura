const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { determineArchetype } = require('./engine');
const { generateCardSvg } = require('./cardRenderer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static frontend

/**
 * Handle Aura requests
 */
async function handleAuraRequest(req, res) {
    const walletAddress = req.query.wallet || req.body.wallet_address || req.body.wallet;
    
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required.' });
    }

    try {
        const archetypeData = await determineArchetype(walletAddress);
        const svg = generateCardSvg(walletAddress, archetypeData);
        
        // Return JSON compliant with A2MCP specs
        res.json({
            wallet_address: walletAddress,
            archetype: archetypeData.archetype,
            reading: archetypeData.reading,
            // Returning the SVG directly as base64 or inline can be useful, 
            // but the spec mentioned card_svg_url. 
            // Since we don't save to disk (stateless), we can return a data URI
            // or an endpoint that returns the SVG.
            // Let's create an endpoint that returns the SVG directly.
            card_svg_url: `/card?wallet=${encodeURIComponent(walletAddress)}`,
            // Inline SVG data as requested in spec
            card_image_base64: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
            // Added for the frontend to style the button
            accent_color: archetypeData.color
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error processing aura.' });
    }
}

app.get('/aura', handleAuraRequest);
app.post('/aura', handleAuraRequest);

/**
 * Direct SVG endpoint
 */
app.get('/card', async (req, res) => {
    const walletAddress = req.query.wallet;
    if (!walletAddress) return res.status(400).send('Wallet required');
    
    try {
        const archetypeData = await determineArchetype(walletAddress);
        const svg = generateCardSvg(walletAddress, archetypeData);
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating card');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Agent Aura API running on port ${PORT}`);
});
