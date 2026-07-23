const crypto = require('crypto');
const axios = require('axios');
const archetypes = require('./archetypes');

/**
 * Deterministically generate an integer from a string seed (fallback).
 */
function hashString(str) {
    const safeStr = typeof str === 'string' ? str : String(str || '');
    const hash = crypto.createHash('sha256').update(safeStr.toLowerCase()).digest('hex');
    return parseInt(hash.substring(0, 8), 16);
}

/**
 * Resolve ENS domain (e.g. vitalik.eth) to a 0x address
 */
async function resolveEns(input) {
    if (!input || typeof input !== 'string') return input;
    const trimmed = input.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
        return trimmed;
    }
    if (/\.eth$/i.test(trimmed)) {
        try {
            const res = await axios.get(`https://api.ensideas.com/ens/resolve/${encodeURIComponent(trimmed.toLowerCase())}`, { timeout: 3500 });
            if (res.data && res.data.address) {
                return res.data.address;
            }
        } catch (err) {
            console.warn(`ENS resolution failed for ${trimmed}, falling back:`, err.message);
        }
    }
    return trimmed;
}

/**
 * Fetch real on-chain signals from Etherscan.
 */
async function getEtherscanSignals(rawAddress) {
    const walletAddress = await resolveEns(rawAddress);
    try {
        const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
        if (!ETHERSCAN_API_KEY) {
            throw new Error("Etherscan API key is not configured.");
        }

        // Fetch up to 10,000 normal transactions for the address using V2 API
        const response = await axios.get('https://api.etherscan.io/v2/api', {
            params: {
                chainid: 1,
                module: 'account',
                action: 'txlist',
                address: walletAddress,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 10000,
                sort: 'asc',
                apikey: ETHERSCAN_API_KEY
            },
            timeout: 5000
        });

        const data = response.data;
        if (data.status === '0' && data.message !== 'No transactions found') {
            throw new Error(`Etherscan API error/warning: ${data.result}`);
        }

        const txs = Array.isArray(data.result) ? data.result : [];
        const txCount = txs.length;
        
        let walletAgeDays = 0;
        let uniqueInteractions = 0;
        let highRiskActivity = false;

        if (txCount > 0) {
            // First transaction timestamp
            const firstTxTimestamp = parseInt(txs[0].timeStamp, 10);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            walletAgeDays = Math.max(0, (currentTimestamp - firstTxTimestamp) / 86400);

            // Calculate unique addresses interacted with (proxy for diversification)
            const uniqueToAddresses = new Set();
            txs.forEach(tx => {
                if (tx.to) uniqueToAddresses.add(tx.to.toLowerCase());
                if (tx.isError === '1') {
                    highRiskActivity = true; 
                }
            });
            uniqueInteractions = uniqueToAddresses.size;
        }

        return {
            resolvedAddress: walletAddress,
            txCount,
            walletAgeDays,
            uniqueInteractions,
            highRiskActivity
        };

    } catch (error) {
        console.error("Error fetching from Etherscan, falling back to mock:", error.message);
        // Fallback to deterministic mock if API fails
        const num = hashString(walletAddress);
        return {
            resolvedAddress: walletAddress,
            walletAgeDays: (num % 2000) + 1,
            txCount: (num % 5000) + 1,
            uniqueInteractions: (num % 100) + 1,
            highRiskActivity: (num % 10) > 7
        };
    }
}

/**
 * Map real signals to an archetype.
 */
async function determineArchetype(walletAddress) {
    const signals = await getEtherscanSignals(walletAddress);
    let selectedArchetype = null;

    // Scoring logic based on real signals
    if (signals.txCount === 0) {
        selectedArchetype = {
            name: 'The Seedling',
            description: 'A blank slate on the ledger. Your journey has yet to begin.',
            color: '#95A5A6'
        };
    } else if (signals.walletAgeDays > 1000 && signals.txCount > 500) {
        selectedArchetype = archetypes.find(a => a.id === 'whale_whisperer') || archetypes[0];
    } else if (signals.walletAgeDays > 1000 && signals.txCount < 50) {
        selectedArchetype = archetypes.find(a => a.id === 'diamond_mystic') || archetypes[0];
    } else if (signals.txCount > 5000) {
        selectedArchetype = archetypes.find(a => a.id === 'gas_martyr') || archetypes[0];
    } else if (signals.uniqueInteractions > 100) {
        selectedArchetype = archetypes.find(a => a.id === 'yield_alchemist') || archetypes[0];
    } else if (signals.highRiskActivity && signals.txCount > 500) {
        selectedArchetype = archetypes.find(a => a.id === 'chaotic_oracle') || archetypes[0];
    } else if (signals.txCount < 10) {
        selectedArchetype = archetypes.find(a => a.id === 'silent_accumulator') || archetypes[0];
    } else {
        const num = hashString(walletAddress);
        const index = num % archetypes.length;
        selectedArchetype = archetypes[index];
    }

    // Generate flavor text based on real signals
    let extraLine = '';
    if (signals.walletAgeDays > 1000) {
        extraLine = 'The genesis winds have weathered your spirit, yet you remain.';
    } else if (signals.txCount > 2000) {
        extraLine = 'A flurry of transactions, a restless soul seeking alpha.';
    } else if (signals.uniqueInteractions > 50) {
        extraLine = 'A diversified collector, scattered across the digital wind.';
    } else if (signals.txCount > 0) {
        extraLine = 'Quietly observing the chain, waiting for the perfect alignment.';
    }

    return {
        archetype: selectedArchetype.name,
        color: selectedArchetype.color,
        reading: `${selectedArchetype.description} ${extraLine}`.trim(),
        signals,
        stats: {
            ageDays: Math.floor(signals.walletAgeDays),
            txCount: signals.txCount,
            protocols: signals.uniqueInteractions
        }
    };
}

module.exports = {
    determineArchetype,
    getEtherscanSignals,
    resolveEns
};

