document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const examplePromptsContainer = document.getElementById('example-prompts');
    const statusBox = document.getElementById('status-box');
    const statusText = document.getElementById('status-text');
    const statusIcon = document.getElementById('status-icon');
    const viewerContainer = document.getElementById('viewer-container');
    const statusIndicator = document.getElementById('status-indicator');
    const statusLabel = document.getElementById('status-label');
    const successBox = document.getElementById('success-box');

    const iconInfo = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`;
    const iconError = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    const initialPlaceholder = viewerContainer.innerHTML;

    function setLoading(isLoading) {
        promptInput.disabled = isLoading;
        generateBtn.disabled = isLoading;
        [...examplePromptsContainer.children].forEach(btn => {
            btn.disabled = isLoading;
            btn.classList.toggle('opacity-50', isLoading);
        });
        if (isLoading) {
            generateBtn.innerHTML = `<div class="spinner"></div><span>Génération en cours...</span>`;
            statusLabel.textContent = 'En création';
            statusIndicator.className = 'w-2 h-2 rounded-full bg-blue-500 animate-pulse';
            viewerContainer.innerHTML = `<div class="absolute inset-0 flex flex-col items-center justify-center p-8"><div class="relative mb-8"><div class="w-24 h-24 border-2 border-white/10 rounded-full"></div><div class="absolute inset-0 w-24 h-24 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div><div class="absolute inset-0 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 3v4"/><path d="M3 19h4"/><path d="M17 19h4"/></svg></div></div><p class="text-white text-lg font-medium mb-2">Création en cours</p><p class="text-slate-400 text-sm text-center max-w-xs">Le modèle 3D est en cours de génération.</p></div>`;
        } else {
            generateBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 3v4"/><path d="M3 19h4"/><path d="M17 19h4"/></svg><span>Générer mon Gri-Gri</span>`;
        }
    }
    function showStatus(message, isError = false) {
        statusBox.classList.remove('hidden');
        if (isError) {
            statusBox.className = 'mt-4 p-4 rounded-xl border backdrop-blur-xl flex items-start gap-3 bg-red-500/10 border-red-500/30';
            statusText.className = 'text-sm text-red-300';
            statusIcon.innerHTML = iconError;
        } else {
            statusBox.className = 'mt-4 p-4 rounded-xl border backdrop-blur-xl flex items-start gap-3 bg-blue-500/10 border-blue-500/30';
            statusText.className = 'text-sm text-blue-300';
            statusIcon.innerHTML = iconInfo;
        }
        statusText.textContent = message;
    }
    function resetUI() {
        statusBox.classList.add('hidden');
        successBox.classList.add('hidden');
        statusIndicator.className = 'w-2 h-2 rounded-full bg-slate-500';
        statusLabel.textContent = 'En attente';
        viewerContainer.innerHTML = initialPlaceholder;
    }

    async function handleGenerate() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showStatus("Veuillez d'abord décrire votre idée.", true);
            return;
        }
        setLoading(true);
        resetUI();
        showStatus("Connexion au pont d'API public...");
        try {
            const response = await fetch("https://hysts-shap-e-diffusers.hf.space/run/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: [prompt, true, 20, 5, 1024]
                })
            });
            if (!response.ok) throw new Error('La requête a échoué. Le service est peut-être surchargé.');
            const data = await response.json();
            const modelData = data.data[0];
            if (!modelData || !modelData.url) throw new Error('L\'API n\'a pas retourné de modèle valide.');
            const modelUrl = modelData.url;

            viewerContainer.innerHTML = ''; 
            const modelViewer = document.createElement('model-viewer');
            modelViewer.src = modelUrl;
            modelViewer.setAttribute('ar', '');
            modelViewer.setAttribute('camera-controls', '');
            modelViewer.setAttribute('auto-rotate', '');
            modelViewer.style.cssText = 'width: 100%; height: 100%;';
            viewerContainer.appendChild(modelViewer);
            
            statusBox.classList.add('hidden');
            successBox.classList.remove('hidden');
            statusIndicator.className = 'w-2 h-2 rounded-full bg-green-500 animate-pulse';
            statusLabel.textContent = 'Chargé';
        } catch (error) {
            console.error(error);
            showStatus(`Erreur: ${error.message}`, true);
            resetUI();
            statusIndicator.className = 'w-2 h-2 rounded-full bg-red-500';
            statusLabel.textContent = 'Erreur';
        } finally {
            setLoading(false);
        }
    }

    generateBtn.addEventListener('click', handleGenerate);
    examplePromptsContainer.addEventListener('click', (e) => {
        if(e.target.tagName === 'BUTTON' && !promptInput.disabled) {
            promptInput.value = e.target.textContent.trim();
        }
    });
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !generateBtn.disabled) {
            handleGenerate();
        }
    });
});