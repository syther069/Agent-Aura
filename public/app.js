document.addEventListener('DOMContentLoaded', () => {
    const stateForm = document.getElementById('state-form');
    const stateLoading = document.getElementById('state-loading');
    const stateResult = document.getElementById('state-result');
    
    const form = document.getElementById('aura-form');
    const input = document.getElementById('wallet-input');
    const cardImage = document.getElementById('card-image');
    
    const shareBtn = document.getElementById('share-btn');
    const resetBtn = document.getElementById('reset-btn');

    function switchState(stateId) {
        [stateForm, stateLoading, stateResult].forEach(el => {
            el.classList.remove('active');
        });
        document.getElementById(stateId).classList.add('active');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const wallet = input.value.trim();
        if (!wallet) return;

        switchState('state-loading');

        try {
            const response = await fetch(`/aura?wallet=${encodeURIComponent(wallet)}`);
            if (!response.ok) throw new Error('API error');
            
            const data = await response.json();
            
            // Set image source
            cardImage.src = data.card_image_base64 || data.card_svg_url;
            
            // Set accent color if provided by API (extending spec for UI)
            if (data.accent_color) {
                document.documentElement.style.setProperty('--accent-color', data.accent_color);
            } else {
                document.documentElement.style.setProperty('--accent-color', '#171512');
            }

            // Small delay to ensure image loads before transition
            setTimeout(() => {
                switchState('state-result');
            }, 500);

        } catch (error) {
            console.error(error);
            alert('Failed to read aura. Please try again.');
            switchState('state-form');
        }
    });

    resetBtn.addEventListener('click', () => {
        input.value = '';
        document.documentElement.style.setProperty('--accent-color', '#171512');
        switchState('state-form');
    });

    shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Agent Aura',
                    text: 'I just revealed my on-chain aura! Check yours out.',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share canceled or failed');
            }
        } else {
            alert('Screenshot this card and tag someone to reveal their Aura!');
        }
    });
});
