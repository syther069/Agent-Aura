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

    function showToast(message, isHtml = false) {
        if (!toast) return;
        if (isHtml) {
            toast.innerHTML = message;
        } else {
            toast.textContent = message;
        }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
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

    // Real On-Chain Soulbound Token (SBT) Minting via OKX Wallet on X Layer
    if (mintSbtBtn) {
        mintSbtBtn.addEventListener('click', async () => {
            const provider = window.okxwallet?.ethereum || window.okxwallet || window.ethereum;
            if (!provider) {
                showToast('OKX Wallet extension not detected! Install OKX Wallet to mint on X Layer.');
                window.open('https://www.okx.com/web3', '_blank');
                return;
            }

            try {
                showToast('Connecting OKX Wallet...');
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                const connectedAccount = accounts[0];
                if (!connectedAccount) {
                    throw new Error('No account returned from OKX Wallet.');
                }

                // Switch network to OKX X Layer (Chain ID 196 = 0x84)
                try {
                    await provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x84' }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902 || switchError.code === -32603) {
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

                // Encode real on-chain Soulbound Token metadata in transaction hex data
                const archetypeText = currentResultData?.archetype || 'Archetype';
                const memoText = `AgentAura:SBT:v1:${currentWallet}:${archetypeText}`;
                const hexData = '0x' + Array.from(new TextEncoder().encode(memoText))
                    .map(b => b.toString(16).padStart(2, '0')).join('');

                showToast('Please confirm 0.0001 OKB minting transaction in OKX Wallet...');

                // Execute real EVM transaction on X Layer
                const txHash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: connectedAccount,
                        to: '0x4131bdbd97f8f27fb5895bb1dc0cc3ba671555c5',
                        value: '0x38D7EA4C68000', // 0.0001 OKB mint fee
                        data: hexData
                    }]
                });

                const shortHash = `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`;
                const explorerUrl = `https://www.okx.com/explorer/xlayer/tx/${txHash}`;
                showToast(`🎉 SBT Minted on X Layer! <a href="${explorerUrl}" target="_blank" style="color:#FFF;text-decoration:underline;">Tx: ${shortHash}</a>`, true);

            } catch (err) {
                console.error(err);
                if (err.code === 4001) {
                    showToast('Transaction cancelled by user.');
                } else {
                    showToast(`Minting failed: ${err.message || 'Transaction error'}`);
                }
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
