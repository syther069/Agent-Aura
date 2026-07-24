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
    const fameCards = document.querySelectorAll('.fame-card');
    const headerConnectBtn = document.getElementById('header-connect-btn');
    const themePillBtns = document.querySelectorAll('.theme-pill-btn');

    let currentResultData = null;
    let currentWallet = '';

    // 💧 Liquid Glass Theme Controller
    const savedTheme = localStorage.getItem('agent_aura_theme') || 'obsidian';

    function setTheme(themeId) {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('agent_aura_theme', themeId);
        
        themePillBtns.forEach(btn => {
            if (btn.dataset.themeId === themeId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    setTheme(savedTheme);

    themePillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeId = btn.dataset.themeId;
            setTheme(themeId);
            showToast(`Liquid Theme Active: ${btn.textContent.trim()}`);
        });
    });

    // 💧 Caustic Flash & Liquid Click Ripple Physics
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button, .chip-btn, .theme-pill-btn, .fame-card');
        if (!targetBtn) return;

        const rect = targetBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'liquid-ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        targetBtn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    });

    // 🌊 Interactive Liquid Glass Container Spotlight Physics
    const glassContainers = document.querySelectorAll('.glass-search-container, .fame-card, .liquid-console-wrapper, .loading-glass-card');
    glassContainers.forEach(container => {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            container.style.backgroundImage = `radial-gradient(circle at ${x}% ${y}%, var(--glass-bg-hover) 0%, var(--glass-bg) 85%)`;
        });

        container.addEventListener('mouseleave', () => {
            container.style.backgroundImage = '';
        });
    });

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
            if (!el) return;
            el.classList.remove('active');
            el.classList.add('hidden');
        });
        const target = document.getElementById(stateId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    }

    // 🔬 Hydraulic Borosilicate Specimen Card Tilt Physics
    if (cardFrame) {
        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        let animId = null;

        function updateHydraulicTilt() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            cardFrame.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
                animId = requestAnimationFrame(updateHydraulicTilt);
            } else {
                animId = null;
            }
        }

        cardFrame.addEventListener('mousemove', (e) => {
            const rect = cardFrame.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            targetY = ((x - centerX) / centerX) * 10;
            targetX = -((y - centerY) / centerY) * 10;

            if (!animId) {
                animId = requestAnimationFrame(updateHydraulicTilt);
            }
            
            if (glowBackdrop) {
                const glowX = (x / rect.width) * 100;
                const glowY = (y / rect.height) * 100;
                glowBackdrop.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(232, 213, 183, 0.35) 0%, transparent 65%)`;
            }
        });

        cardFrame.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            if (!animId) {
                animId = requestAnimationFrame(updateHydraulicTilt);
            }
            if (glowBackdrop) {
                glowBackdrop.style.background = 'radial-gradient(circle at 50% 50%, rgba(232, 213, 183, 0.15) 0%, transparent 70%)';
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
            const resultArchetype = document.getElementById('result-archetype');
            const resultReading = document.getElementById('result-reading');

            if (resultArchetype && data.archetype) {
                resultArchetype.textContent = data.archetype.name || data.archetype;
            }
            if (resultReading && data.reading) {
                resultReading.textContent = data.reading;
            }
            
            if (rarityBadge && data.rarity) {
                rarityBadge.textContent = `COLLECTIBLE_ID: #${data.rarity.id || '88219'}`;
            }
            if (trustBadge && (data.trust_score || data.stats?.trustScore)) {
                const targetScore = data.trust_score || data.stats?.trustScore;
                animateValue(trustBadge, 0, targetScore, 1000, 'RESONANCE ', '%');
            }

            // Populate Agent-to-Agent (A2A) Trust Matrix Panel
            const mRisk = document.getElementById('matrix-risk');
            const mTier = document.getElementById('m-tier');
            const mLimit = document.getElementById('m-limit');
            const mXLayer = document.getElementById('m-xlayer');

            if (data.trust) {
                if (mRisk) mRisk.textContent = `RISK LEVEL: ${data.trust.riskLevel || 'OPTIMAL'}`;
                if (mTier) mTier.textContent = data.trust.reputationTier || 'VETERAN';
                if (mLimit) mLimit.textContent = data.trust.recommendedMaxTx || '100.0 ETH';
            }
            if (mXLayer) {
                mXLayer.textContent = data.stats?.xLayerActive ? 'ACTIVE (196)' : 'MAINNET OBSERVER';
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

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = input ? input.value.trim() : '';
            if (val) {
                fetchAura(val);
            } else {
                showToast('Please enter a wallet address or ENS domain.');
            }
        });
    }

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            const val = input ? input.value.trim() : '';
            if (val) {
                e.preventDefault();
                fetchAura(val);
            }
        });
    }

    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const wallet = btn.getAttribute('data-wallet');
            input.value = wallet;
            fetchAura(wallet);
        });
    });

    fameCards.forEach(card => {
        card.addEventListener('click', () => {
            const wallet = card.getAttribute('data-wallet');
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
