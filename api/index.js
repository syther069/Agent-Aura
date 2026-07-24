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
const DEFAULT_DEMO_WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

/**
 * Dynamically determine the base URL using APP_URL env, host header, or approved domain fallback.
 */
function getBaseUrl(req) {
    if (process.env.APP_URL) {
        return process.env.APP_URL.replace(/\/$/, '');
    }
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'agent-aura-7y0s.onrender.com';
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    return `${proto}://${host}`;
}

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
 * Helper to build standardized deliverable objects compliant with ASP / A2MCP / OKX specs
 */
function buildDeliverableList(walletAddress, archetypeData, svg, baseUrl) {
    const svgBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    const cardUrl = `${baseUrl}/card?wallet=${encodeURIComponent(walletAddress)}`;

    const item = {
        id: `aura-card-${walletAddress}`,
        type: 'image/svg+xml',
        media_type: 'image/svg+xml',
        name: `Agent Aura Card - ${walletAddress}`,
        description: `Web3 Archetype Card for ${walletAddress}: ${archetypeData.archetype} (${archetypeData.rarity.label})`,
        url: cardUrl,
        data: svgBase64,
        content: svg,
        meta: {
            wallet: walletAddress,
            archetype: archetypeData.archetype,
            color: archetypeData.color,
            bgColor: archetypeData.bgColor,
            themeName: archetypeData.themeName,
            reading: archetypeData.reading,
            isGroqLlm: archetypeData.isGroqLlm,
            rarity: archetypeData.rarity,
            trust: archetypeData.trust,
            stats: archetypeData.stats
        }
    };

    return [item];
}

/**
 * Generate standard HTTP 402 Payment Required challenge compliant with OKX x402 / ERC-8004 specs
 */
function send402Challenge(req, res) {
    const baseUrl = getBaseUrl(req);
    const payload = {
        x402Version: 2,
        code: 402,
        error: 'Payment Required',
        resource: {
            url: `${baseUrl}${req.originalUrl || '/aura'}`,
            description: 'Agent Aura - AI Web3 Archetype & Trust Oracle (Groq LLM Powered)'
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
    const baseUrl = getBaseUrl(req);
    res.json({
        name: "Agent Aura",
        description: "An on-chain Groq LLM-powered AI oracle that reads wallet history, generates dynamic holographic SVG cards, and provides Agent-to-Agent trust ratings on OKX X Layer.",
        version: "2.0.0",
        services: [
            {
                serviceName: "Wallet Aura Reader",
                serviceType: "A2MCP",
                endpoint: `${baseUrl}/aura`,
                fee: "0",
                parameters: {
                    wallet: "Ethereum wallet address (0x...) or ENS domain (name.eth)"
                }
            },
            {
                serviceName: "Agent-to-Agent Trust Score Oracle",
                serviceType: "A2MCP",
                endpoint: `${baseUrl}/api/agent-trust-score`,
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
    // Check if explicit x402 probe/challenge is requested
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
        const baseUrl = getBaseUrl(req);
        const deliverables = buildDeliverableList(walletAddress, archetypeData, svg, baseUrl);
        
        // If caller explicitly wants raw SVG (e.g. x402 SVG replay or image request)
        if (req.headers['accept']?.includes('image/svg+xml') || req.query?.format === 'svg' || req.query?.type === 'svg') {
            res.setHeader('Content-Type', 'image/svg+xml');
            return res.send(svg);
        }

        // Return JSON compliant with A2MCP and Task Deliverable specs
        res.json({
            status: 'completed',
            wallet_address: walletAddress,
            archetype: archetypeData.archetype,
            reading: archetypeData.reading,
            is_groq_llm: archetypeData.isGroqLlm,
            theme_name: archetypeData.themeName,
            bg_color: archetypeData.bgColor,
            rarity: archetypeData.rarity,
            trust_score: archetypeData.trust.trustScore,
            risk_level: archetypeData.trust.riskLevel,
            reputation_tier: archetypeData.trust.reputationTier,
            recommended_max_tx: archetypeData.trust.recommendedMaxTx,
            agent_recommendation: archetypeData.trust.agentRecommendation,
            card_svg_url: `${baseUrl}/card?wallet=${encodeURIComponent(walletAddress)}`,
            card_image_base64: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
            card_svg: svg,
            accent_color: archetypeData.color,
            stats: archetypeData.stats,
            deliverables: deliverables,
            deliverable_list: deliverables,
            task_deliverables: deliverables,
            deliverable: deliverables[0]
        });
    } catch (error) {
        console.error('Error handling aura request:', error);
        res.status(500).json({ error: 'Internal server error processing aura.' });
    }
}

app.get('/aura', handleAuraRequest);
app.post('/aura', handleAuraRequest);

/**
 * Agent-to-Agent (A2A) Trust Score & Reputation Oracle Endpoint
 */
app.get(['/api/agent-trust-score', '/trust-score'], async (req, res) => {
    const rawInput = req.query?.wallet || req.query?.address || DEFAULT_DEMO_WALLET;
    const walletAddress = sanitizeWalletAddress(rawInput) || DEFAULT_DEMO_WALLET;

    try {
        const archetypeData = await determineArchetype(walletAddress);
        res.json({
            status: 'completed',
            wallet_address: walletAddress,
            trust_score: archetypeData.trust.trustScore,
            risk_level: archetypeData.trust.riskLevel,
            reputation_tier: archetypeData.trust.reputationTier,
            recommended_max_tx: archetypeData.trust.recommendedMaxTx,
            agent_recommendation: archetypeData.trust.agentRecommendation,
            rarity: archetypeData.rarity,
            xlayer_active: archetypeData.signals.xLayerActive,
            is_groq_llm: archetypeData.isGroqLlm,
            signals: archetypeData.signals
        });
    } catch (error) {
        console.error('Error serving agent trust score:', error);
        res.status(500).json({ error: 'Internal server error processing trust score.' });
    }
});

/**
 * Task Deliverable List Endpoints (for direct-accept buyers)
 */
async function handleDeliverablesRequest(req, res) {
    const rawInput = req.query?.wallet || 
                      req.query?.address || 
                      req.query?.walletAddress || 
                      req.query?.task_id || 
                      req.query?.taskId || 
                      req.body?.wallet_address || 
                      req.body?.wallet || 
                      req.body?.address || 
                      req.body?.task_id || 
                      req.body?.taskId || 
                      req.params?.taskId;

    const walletAddress = sanitizeWalletAddress(rawInput) || DEFAULT_DEMO_WALLET;

    try {
        const archetypeData = await determineArchetype(walletAddress);
        const svg = generateCardSvg(walletAddress, archetypeData);
        const baseUrl = getBaseUrl(req);
        const deliverables = buildDeliverableList(walletAddress, archetypeData, svg, baseUrl);

        res.json({
            status: 'completed',
            task_id: rawInput || walletAddress,
            wallet_address: walletAddress,
            rarity: archetypeData.rarity,
            trust_score: archetypeData.trust.trustScore,
            risk_level: archetypeData.trust.riskLevel,
            deliverables: deliverables,
            deliverable_list: deliverables,
            task_deliverables: deliverables,
            deliverable: deliverables[0]
        });
    } catch (error) {
        console.error('Error serving deliverables:', error);
        res.status(500).json({ error: 'Internal server error getting deliverables.' });
    }
}

app.get(['/task-deliverable-list', '/task/deliverables', '/deliverables', '/task/:taskId/deliverables', '/task/:taskId'], handleDeliverablesRequest);
app.post(['/task-deliverable-list', '/task/deliverables', '/deliverables'], handleDeliverablesRequest);

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
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Agent Aura API running on port ${PORT}`);
    });
}

module.exports = app;
