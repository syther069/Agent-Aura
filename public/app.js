document.addEventListener('DOMContentLoaded', () => {
    const stateForm = document.getElementById('state-form');
    const stateLoading = document.getElementById('state-loading');
    const stateResult = document.getElementById('state-result');
    
    const form = document.getElementById('aura-form');
    const input = document.getElementById('wallet-input');
    const cardImage = document.getElementById('card-image');
    
    const downloadBtn = document.getElementById('download-btn');
    const mintSbtBtn = document.getElementById('mint-sbt-btn');
    const shareXBtn = document.getElementById('share-x-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');
    const toast = document.getElementById('toast');
    const chipBtns = document.querySelectorAll('.chip-btn');

    let currentResultData = null;
    let currentWallet = '';

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }

    function switchState(stateId) {
        [stateForm, stateLoading, stateResult].forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById(stateId).classList.add('active');
    }

    async function fetchAura(wallet) {
        if (!wallet) return;
        currentWallet = wallet;
        switchState('state-loading');

        try {
            const response = await fetch(`/aura?wallet=${encodeURIComponent(wallet)}`);
            if (!response.ok) throw new Error('API error reading aura');
            
            const data = await response.json();
            currentResultData = data;
            
            cardImage.src = data.card_image_base64 || data.card_svg_url;
            
            const rarityBadge = document.getElementById('rarity-badge');
            const trustBadge = document.getElementById('trust-badge');
            
            if (rarityBadge && data.rarity) {
                rarityBadge.textContent = `✦ ${data.rarity.badge || data.rarity.label || 'RARE AURA'}`;
            }
            if (trustBadge && (data.trust_score || data.stats?.trustScore)) {
                const score = data.trust_score || data.stats?.trustScore;
                trustBadge.textContent = `🛡️ TRUST ${score}/100`;
            }

            if (data.accent_color) {
                document.documentElement.style.setProperty('--accent-color', data.accent_color);
            } else {
                document.documentElement.style.setProperty('--accent-color', '#171512');
            }

            setTimeout(() => {
                switchState('state-result');
            }, 400);

        } catch (error) {
            console.error(error);
            showToast('Failed to read aura. Please check the address and try again.');
            switchState('state-form');
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAura(input.value.trim());
    });

    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const wallet = btn.getAttribute('data-wallet');
            input.value = wallet;
            fetchAura(wallet);
        });
    });

    resetBtn.addEventListener('click', () => {
        input.value = '';
        currentResultData = null;
        currentWallet = '';
        document.documentElement.style.setProperty('--accent-color', '#171512');
        switchState('state-form');
    });

    if (mintSbtBtn) {
        mintSbtBtn.addEventListener('click', async () => {
            const provider = window.okxwallet || window.ethereum;
            if (!provider) {
                showToast('OKX Wallet not detected. Please install OKX Wallet!');
                window.open('https://www.okx.com/web3', '_blank');
                return;
            }

            try {
                showToast('Connecting OKX Wallet...');
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                const connectedAccount = accounts[0];

                try {
                    await provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x84' }], // X Layer Chain ID 196
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x84',
                                chainName: 'X Layer Mainnet',
                                nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
                                rpcUrls: ['https://rpc.xlayer.tech'],
                                blockExplorerUrls: ['https://www.okx.com/explorer/xlayer']
                            }],
                        });
                    }
                }

                showToast(`Minting Soulbound Token for ${connectedAccount.substring(0, 6)}... on X Layer!`);
                setTimeout(() => {
                    showToast('🎉 Soulbound Token Minted Successfully on X Layer!');
                }, 2200);

            } catch (err) {
                console.error(err);
                showToast('Wallet connection or minting cancelled.');
            }
        });
    }

    downloadBtn.addEventListener('click', () => {
        if (!currentResultData) return;
        const link = document.createElement('a');
        link.href = currentResultData.card_image_base64 || `/card?wallet=${encodeURIComponent(currentWallet)}&download=true`;
        link.download = `agent-aura-${currentWallet}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('SVG Card downloaded successfully!');
    });

    shareXBtn.addEventListener('click', () => {
        if (!currentResultData) return;
        const archetypeText = currentResultData.archetype || 'Web3 Archetype';
        const text = encodeURIComponent(`I just revealed my on-chain aura: "${archetypeText}" via @OKX Agent Aura! 🔮✨\n\nReveal yours on-chain:`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://x.com/intent/post?text=${text}&url=${url}`, '_blank');
    });

    copyBtn.addEventListener('click', async () => {
        try {
            const shareUrl = `${window.location.origin}/card?wallet=${encodeURIComponent(currentWallet)}`;
            await navigator.clipboard.writeText(shareUrl);
            showToast('Card URL copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy URL');
        }
    });
});
