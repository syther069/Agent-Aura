document.addEventListener('DOMContentLoaded', () => {
    const stateForm = document.getElementById('state-form');
    const stateLoading = document.getElementById('state-loading');
    const stateResult = document.getElementById('state-result');
    
    const form = document.getElementById('aura-form');
    const input = document.getElementById('wallet-input');
    const cardImage = document.getElementById('card-image');
    const cardFrame = document.querySelector('.card-glass-frame');
    const glowBackdrop = document.querySelector('.aura-glow-backdrop');
    
    const downloadBtn = document.getElementById('download-btn');
    const mintSbtBtn = document.getElementById('mint-sbt-btn');
    const shareXBtn = document.getElementById('share-x-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');
    const toast = document.getElementById('toast');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const headerConnectBtn = document.getElementById('header-connect-btn');

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

    // 🔮 Interactive 3D Holographic Card Tilt Effect
    if (cardFrame) {
        cardFrame.addEventListener('mousemove', (e) => {
            const rect = cardFrame.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within element
            const y = e.clientY - rect.top;  // y position within element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 12; // Max 12deg tilt Y
            const rotateX = -((y - centerY) / centerY) * 12; // Max 12deg tilt X
            
            cardFrame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            if (glowBackdrop) {
                const glowX = (x / rect.width) * 100;
                const glowY = (y / rect.height) * 100;
                glowBackdrop.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255, 255, 255, 0.22) 0%, transparent 65%)`;
            }
        });

        cardFrame.addEventListener('mouseleave', () => {
            cardFrame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (glowBackdrop) {
                glowBackdrop.style.background = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.10) 0%, transparent 70%)';
            }
        });
    }

    // 🔢 Smooth Number Count-Up Animation
    function animateValue(element, start, end, duration, prefix = '', suffix = '') {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = Math.floor(progress * (end - start) + start);
            element.textContent = `${prefix}${currentVal}${suffix}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    async function connectWallet() {
        const provider = window.okxwallet?.ethereum || window.okxwallet || window.ethereum;
        if (!provider) {
            showToast('OKX Wallet extension not detected! Please install OKX Wallet.');
            window.open('https://www.okx.com/web3', '_blank');
            return null;
        }

        try {
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                const addr = accounts[0];
                const shortAddr = `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
                if (headerConnectBtn) headerConnectBtn.textContent = shortAddr;
                showToast(`OKX Wallet Connected: ${shortAddr}`);
                return addr;
            }
        } catch (err) {
            console.error(err);
            showToast('Wallet connection cancelled.');
        }
        return null;
    }

    if (headerConnectBtn) {
        headerConnectBtn.addEventListener('click', () => connectWallet());
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
                rarityBadge.textContent = `◇ ${data.rarity.badge || data.rarity.label || 'RARE AURA'} ◇`;
            }
            if (trustBadge && (data.trust_score || data.stats?.trustScore)) {
                const targetScore = data.trust_score || data.stats?.trustScore;
                animateValue(trustBadge, 0, targetScore, 1000, 'TRUST SCORE ', '/100');
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

                if (headerConnectBtn) {
                    headerConnectBtn.textContent = `${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`;
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
