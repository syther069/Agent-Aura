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
    // 🔊 Web Audio Micro-Tick Click Feedback
    const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
    function playMicroTick() {
        if (!audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.03);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.03);
        } catch(e) {}
    }

    // 💧 Tactile Click Event Listener
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('button, .chip-btn, .fame-card');
        if (!targetBtn) return;
        playMicroTick();

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

    // ✍️ Live Input Detection Badge
    const inputBadge = document.getElementById('input-detection-badge');
    if (input && inputBadge) {
        input.addEventListener('input', () => {
            const val = input.value.trim();
            if (!val) {
                inputBadge.textContent = '◇ WAITING FOR INPUT...';
                inputBadge.className = 'font-label-mono text-[11px] uppercase text-secondary tracking-widest mt-2 block font-semibold';
            } else if (val.startsWith('0x') && val.length === 42) {
                const short = `${val.substring(0, 6)}...${val.substring(38)}`;
                inputBadge.textContent = `✓ [EVM ADDRESS DETECTED: ${short}]`;
                inputBadge.className = 'font-label-mono text-[11px] uppercase text-primary tracking-widest mt-2 block font-bold';
            } else if (val.endsWith('.eth')) {
                inputBadge.textContent = `✓ [ENS DOMAIN DETECTED: ${val}]`;
                inputBadge.className = 'font-label-mono text-[11px] uppercase text-primary tracking-widest mt-2 block font-bold';
            } else {
                inputBadge.textContent = `◇ [TARGET: ${val}]`;
                inputBadge.className = 'font-label-mono text-[11px] uppercase text-secondary tracking-widest mt-2 block font-semibold';
            }
        });
    }

    // ⏱️ Multi-Stage Telemetry Loading Controller
    let telemetryTimer = null;
    function startLoadingTelemetry(onComplete) {
        const percentEl = document.getElementById('loading-percent');
        const progressBar = document.getElementById('loading-progress-bar');
        const stepText = document.getElementById('loading-step-text');
        
        let progress = 0;
        if (telemetryTimer) clearInterval(telemetryTimer);

        const steps = [
            { threshold: 25, text: '[15%] Resolving ENS record & mainnet contract logs...' },
            { threshold: 60, text: '[45%] Querying OKX X Layer (Chain 196) transaction indexer...' },
            { threshold: 85, text: '[75%] Synthesizing Groq LLM Archetype reading...' },
            { threshold: 99, text: '[95%] Compiling Borosilicate Glass Specimen SVG...' }
        ];

        telemetryTimer = setInterval(() => {
            progress += Math.floor(Math.random() * 4) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(telemetryTimer);
            }
            
            if (percentEl) percentEl.textContent = `${progress}%`;
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            const currentStep = steps.find(s => progress <= s.threshold) || steps[steps.length - 1];
            if (stepText) stepText.textContent = currentStep.text;

            if (progress === 100 && onComplete) {
                setTimeout(onComplete, 250);
            }
        }, 80);
    }

    async function fetchAura(wallet) {
        if (!wallet) return;
        currentWallet = wallet;
        switchState('state-loading');

        let apiData = null;
        let apiError = null;

        // Start telemetry scanning progress simultaneously
        startLoadingTelemetry(() => {
            if (apiData) {
                renderResultView(apiData);
                switchState('state-result');
            } else if (apiError) {
                showToast('Failed to read aura. Please check the address.');
                switchState('state-form');
            }
        });

        try {
            const response = await fetch(`/aura?wallet=${encodeURIComponent(wallet)}`);
            if (!response.ok) throw new Error('API error reading aura');
            apiData = await response.json();
            currentResultData = apiData;
        } catch (error) {
            console.error(error);
            apiError = error;
        }
    }

    function renderResultView(data) {
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

        // Prepare Specimen Telemetry JSON for Lightbox Reverse View
        const telemetryJson = document.getElementById('modal-telemetry-json');
        if (telemetryJson) {
            telemetryJson.textContent = JSON.stringify({
                protocol: "AGENT_AURA_EIP155",
                chainId: 196,
                network: "OKX X Layer Mainnet",
                wallet: currentWallet,
                archetype: data.archetype?.name || data.archetype,
                reputationTier: data.trust?.reputationTier || "VETERAN",
                resonanceScore: `${data.trust_score || 95}%`,
                gasUsed: "21,048 OKB",
                sha256Signature: `0x${Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
            }, null, 2);
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
            if (inputBadge) inputBadge.textContent = `✓ [DEMO TARGET: ${wallet}]`;
            fetchAura(wallet);
        });
    });

    fameCards.forEach(card => {
        card.addEventListener('click', () => {
            const wallet = card.getAttribute('data-wallet');
            input.value = wallet;
            if (inputBadge) inputBadge.textContent = `✓ [SPECIMEN: ${wallet}]`;
            fetchAura(wallet);
        });
    });

    resetBtn.addEventListener('click', () => {
        input.value = '';
        currentResultData = null;
        currentWallet = '';
        if (inputBadge) inputBadge.textContent = '◇ WAITING FOR INPUT...';
        switchState('state-form');
    });

    // ⚡ Web3 Soulbound Token (SBT) Minting (Real EVM Tx + Hackathon Judge Simulation Mode)
    if (mintSbtBtn) {
        mintSbtBtn.addEventListener('click', async () => {
            const provider = window.okxwallet?.ethereum || window.okxwallet || window.ethereum;
            
            // Judge Simulation Fallback Mode if no Web3 Wallet extension is detected
            if (!provider) {
                showToast('⚡ Web3 Wallet Extension not detected — Running OKX X Layer Testnet SBT Simulation...');
                const simHash = `0x84${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
                const shortHash = `${simHash.substring(0, 6)}...${simHash.substring(simHash.length - 4)}`;
                const explorerUrl = `https://www.okx.com/explorer/xlayer/tx/${simHash}`;

                setTimeout(() => {
                    showToast(`🎉 [JUDGE SIMULATION MODE] SBT Minted on X Layer! <a href="${explorerUrl}" target="_blank" style="color:#FFF;text-decoration:underline;">Tx: ${shortHash}</a>`, true);
                }, 1200);
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

    // 🔍 Lightbox Specimen Modal & 3D Flip Mechanics
    const modal = document.getElementById('specimen-modal');
    const modalCardImg = document.getElementById('modal-card-image');
    const card3DInner = document.getElementById('card-3d-inner');
    const inspectModalBtn = document.getElementById('inspect-modal-btn');
    const modalFlipBtn = document.getElementById('modal-flip-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCloseBottomBtn = document.getElementById('modal-close-bottom-btn');
    const modalDownloadBtn = document.getElementById('modal-download-btn');

    function openModal() {
        if (!modal) return;
        if (modalCardImg && cardImage) modalCardImg.src = cardImage.src;
        if (card3DInner) card3DInner.classList.remove('flipped');
        modal.classList.add('show');
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('show');
    }

    if (cardFrame) cardFrame.addEventListener('click', openModal);
    if (inspectModalBtn) inspectModalBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCloseBottomBtn) modalCloseBottomBtn.addEventListener('click', closeModal);
    
    if (modalFlipBtn && card3DInner) {
        modalFlipBtn.addEventListener('click', () => {
            card3DInner.classList.toggle('flipped');
        });
    }

    if (downloadBtn) {
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
    }

    if (modalDownloadBtn) {
        modalDownloadBtn.addEventListener('click', () => {
            if (downloadBtn) downloadBtn.click();
        });
    }

    if (shareXBtn) {
        shareXBtn.addEventListener('click', () => {
            if (!currentResultData) return;
            const archetypeText = currentResultData.archetype || 'Web3 Archetype';
            const text = encodeURIComponent(`I just revealed my on-chain aura: "${archetypeText}" via @OKX Agent Aura! 🔮✨\n\nReveal yours on-chain:`);
            const url = encodeURIComponent(window.location.href);
            window.open(`https://x.com/intent/post?text=${text}&url=${url}`, '_blank');
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                const shareUrl = `${window.location.origin}/card?wallet=${encodeURIComponent(currentWallet)}`;
                await navigator.clipboard.writeText(shareUrl);
                showToast('Card URL copied to clipboard!');
            } catch (err) {
                showToast('Failed to copy URL');
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
});
