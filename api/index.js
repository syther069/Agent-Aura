const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { determineArchetype } = require('./engine');
const { generateCardSvg } = require('./cardRenderer');

dotenv.config();

const app = express();

// Configure CORS with exposed headers for x402 protocol
app.use(cors({
    origin: '*',
    exposedHeaders: ['PAYMENT-REQUIRED', 'X-Payment-Required', 'WWW-Authenticate']
}));
app.use(express.json());

// Handle malformed JSON body errors gracefully
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
    }
    next(err);
});

app.use(express.static('public')); // Serve static frontend

const X402_PAYTO_ADDRESS = process.env.X402_PAYTO_ADDRESS || '0x4131bdbd97f8f27fb5895bb1dc0cc3ba671555c5';
const X402_NETWORK = 'eip155:196'; // X Layer Chain ID

/**
 * Sanitize and validate wallet address or ENS domain name
 */
function sanitizeWalletAddress(input) {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed) || /^[a-zA-Z0-9-]+\.eth$/i.test(trimmed)) {
        return trimmed;
    }
    return null;
}

/**
 * Generate standard HTTP 402 Payment Required challenge compliant with OKX x402 / ERC-8004 specs
 */
function send402Challenge(req, res) {
    const payload = {
        x402Version: 2,
        code: 402,
        error: 'Payment Required',
        resource: {
            url: `${req.protocol}://${req.get('host') || 'agent-aura-umber.vercel.app'}${req.originalUrl || '/aura'}`,
            description: 'Agent Aura - Web3 Archetype Reader'
        },
        accepts: [
            {
                scheme: 'exact',
                network: X402_NETWORK,
                asset: '0x0000000000000000000000000000000000000000',
                amount: '0',
                payTo: X402_PAYTO_ADDRESS,
                description: 'Agent Aura Service Payment'
            }
        ]
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.setHeader('PAYMENT-REQUIRED', base64Payload);
    res.setHeader('X-Payment-Required', 'true');
    res.setHeader('WWW-Authenticate', `Payment network="${X402_NETWORK}", payTo="${X402_PAYTO_ADDRESS}"`);
    return res.status(402).json(payload);
}

/**
 * Explicit 402 endpoint for validator probes
 */
app.all('/402', (req, res) => send402Challenge(req, res));
app.all('/.well-known/x402', (req, res) => send402Challenge(req, res));

/**
 * A2MCP Manifest endpoint for AI Agent Discovery
 */
app.get(['/.well-known/mcp.json', '/manifest'], (req, res) => {
    res.json({
        name: "Agent Aura",
        description: "An on-chain oracle that reads wallet history and reveals unique web3 archetypes as SVG cards.",
        version: "1.0.0",
        services: [
            {
                serviceName: "Wallet Aura Reader",
                serviceType: "A2MCP",
                endpoint: `${req.protocol}://${req.get('host') || 'agent-aura-umber.vercel.app'}/aura`,
                fee: "0",
                parameters: {
                    wallet: "Ethereum wallet address (0x...) or ENS domain (name.eth)"
                }
            }
        ]
    });
});

/**
 * Handle Aura requests
 */
async function handleAuraRequest(req, res) {
    // Check if x402 probe/challenge is requested
    if (req.query?.check402 === 'true' || req.headers['x-payment-check'] === 'true' || req.headers['x-payment-required'] === 'check') {
        return send402Challenge(req, res);
    }

    const rawInput = req.query?.wallet || 
                      req.query?.address || 
                      req.query?.walletAddress || 
                      req.body?.wallet_address || 
                      req.body?.wallet || 
                      req.body?.address || 
                      req.body?.walletAddress;
    
    const walletAddress = sanitizeWalletAddress(rawInput);
    
    if (!walletAddress) {
        return res.status(400).json({ 
            error: 'Valid Ethereum wallet address or ENS domain is required (e.g. 0x1234... or name.eth).' 
        });
    }

    try {
        const archetypeData = await determineArchetype(walletAddress);
        const svg = generateCardSvg(walletAddress, archetypeData);
        
        // Return JSON compliant with A2MCP specs
        res.json({
            wallet_address: walletAddress,
            archetype: archetypeData.archetype,
            reading: archetypeData.reading,
            card_svg_url: `/card?wallet=${encodeURIComponent(walletAddress)}`,
            card_image_base64: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
            accent_color: archetypeData.color,
            stats: archetypeData.stats
        });
    } catch (error) {
        console.error('Error handling aura request:', error);
        res.status(500).json({ error: 'Internal server error processing aura.' });
    }
}

app.get('/aura', handleAuraRequest);
app.post('/aura', handleAuraRequest);

/**
 * Direct SVG endpoint
 */
app.get('/card', async (req, res) => {
    const rawInput = req.query?.wallet || req.query?.address;
    const walletAddress = sanitizeWalletAddress(rawInput);
    if (!walletAddress) return res.status(400).send('Valid Ethereum wallet address or ENS domain required');
    
    try {
        const archetypeData = await determineArchetype(walletAddress);
        const svg = generateCardSvg(walletAddress, archetypeData);
        
        if (req.query?.download === 'true') {
            res.setHeader('Content-Disposition', `attachment; filename="agent-aura-${walletAddress}.svg"`);
        }
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (error) {
        console.error('Error generating card:', error);
        res.status(500).send('Error generating card');
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Agent Aura API running on port ${PORT}`);
    });
}

module.exports = app;


