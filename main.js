let dialedNumber = "";

const numberDisplay = document.getElementById('number-display');
const clickSound = document.getElementById('click-sound');
const successSound = document.getElementById('success-sound');
const dispatcherAudio = document.getElementById('dispatcher-audio-placeholder');
const successOverlay = document.getElementById('success-overlay');
const errorFeedback = document.getElementById('error-feedback');
const displayArea = document.getElementById('display-area');

function pressKey(key) {
    if (dialedNumber.length < 3) {
        dialedNumber += key;
        updateDisplay();
        playSound(clickSound);
        hideError();
    }
}

function updateDisplay() {
    numberDisplay.innerText = dialedNumber;
    const deleteBtn = document.getElementById('delete-btn');
    if (dialedNumber.length > 0) {
        deleteBtn.classList.remove('hidden');
    } else {
        deleteBtn.classList.add('hidden');
    }
}

function deleteDigit() {
    if (dialedNumber.length > 0) {
        dialedNumber = dialedNumber.slice(0, -1);
        updateDisplay();
        playSound(clickSound);
    }
}

let callInterval;
let callSeconds = 0;
let audioContext;
let analyser;
let micStream;
let vadActive = false;
let isSpeaking = false;
let speechStartTime = 0;
let silenceStartTime = 0;
let fallbackStartTime = 0;
let currentInteractionStep = 0;

const VAD_THRESHOLD = 0.005; // Umbral extremadamente bajo para máxima sensibilidad
const MIN_SPEECH_DURATION = 300; // Captura incluso un "Sí" muy corto (0.3 seg)
const MAX_SILENCE_DURATION = 1500; // Espera 1.5 seg de silencio para estar seguros de que terminó
const FALLBACK_TIMEOUT = 15000; // 15 segundos máximo por paso (más dinámico)

async function initVAD() {
    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        const source = audioContext.createMediaStreamSource(micStream);

        // Agregar ganancia para amplificar voces bajas
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 3.0; // Amplifica la señal x3

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        source.connect(gainNode);
        gainNode.connect(analyser);

        requestAnimationFrame(monitorVAD);
        return true;
    } catch (err) {
        console.error("No se pudo acceder al micrófono:", err);
        return false;
    }
}

function monitorVAD() {
    if (!vadActive) return;

    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    // Calcular el volumen (RMS)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    if (callSeconds % 2 === 0 && !isSpeaking) console.log("Nivel de voz (RMS):", rms.toFixed(4));

    const now = Date.now();
    const visualizer = document.getElementById('mic-visualizer');
    const bars = visualizer.querySelectorAll('.bar');

    if (rms > VAD_THRESHOLD) {
        if (!isSpeaking) {
            isSpeaking = true;
            speechStartTime = now;
        }
        silenceStartTime = 0;

        // Efecto visual de habla
        bars.forEach(bar => {
            const height = Math.min(30, 8 + rms * 200);
            bar.style.height = `${height}px`;
            bar.style.opacity = '1';
        });
    } else {
        if (isSpeaking) {
            isSpeaking = false;
            silenceStartTime = now;
        }

        bars.forEach(bar => {
            bar.style.height = '8px';
            bar.style.opacity = '0.5';
        });
    }

    // Lógica de avance de pasos
    if (vadActive) {
        const timeSinceSpeechStart = isSpeaking ? (now - speechStartTime) : 0;
        const timeSinceSilenceStart = !isSpeaking && silenceStartTime > 0 ? (now - silenceStartTime) : 0;
        const timeInThisStep = now - fallbackStartTime;

        // Condición para avanzar:
        // (Habló suficiente Y terminó de hablar) O (Pasó demasiado tiempo sin hablar)
        if ((timeSinceSpeechStart > MIN_SPEECH_DURATION && timeSinceSilenceStart > MAX_SILENCE_DURATION) ||
            (timeInThisStep > FALLBACK_TIMEOUT)) {
            advanceInteraction();
        } else {
            requestAnimationFrame(monitorVAD);
        }
    }
}

function advanceInteraction() {
    vadActive = false;
    document.getElementById('mic-visualizer').classList.add('hidden');

    currentInteractionStep++;

    if (currentInteractionStep === 1) {
        // Reproducir pregunta de ubicación
        const locationAudio = document.getElementById('location-audio');
        locationAudio.onended = () => startListening();
        playSound(locationAudio);
    } else if (currentInteractionStep === 2) {
        // Reproducir ayuda en camino
        const helpAudio = document.getElementById('help-audio');
        helpAudio.onended = () => {
            showSuccess();
        };
        playSound(helpAudio);
    }
}

function startListening() {
    if (!vadActive) {
        vadActive = true;
        fallbackStartTime = Date.now();
        speechStartTime = 0;
        silenceStartTime = 0;
        isSpeaking = false;

        document.getElementById('mic-visualizer').classList.remove('hidden');
        document.getElementById('mic-visualizer').classList.add('listening');
        requestAnimationFrame(monitorVAD);
    }
}

function validateCall() {
    const callBtn = document.getElementById('call-btn');
    if (callBtn.classList.contains('active-call')) {
        endCall();
    } else {
        if (dialedNumber === "911") {
            startCallSimulation();
        } else {
            showError();
            dialedNumber = "";
            updateDisplay();
        }
    }
}

async function startCallSimulation() {
    const callBtn = document.getElementById('call-btn');
    const deleteBtn = document.getElementById('delete-btn');

    // Intentar inicializar el VAD (pedir micro)
    const micReady = await initVAD();
    if (!micReady) {
        alert("¡Hola! Requerimos permiso de micrófono para que el policía pueda escucharte.");
        return;
    }

    // UI State for calling
    callBtn.classList.add('active-call');
    deleteBtn.classList.add('hidden');
    document.getElementById('instruction-icon').classList.add('hidden');
    document.getElementById('call-timer').classList.remove('hidden');

    document.getElementById('keypad').style.pointerEvents = 'none';

    callSeconds = 0;
    currentInteractionStep = 0;
    updateCallTimerDisplay();

    callInterval = setInterval(() => {
        callSeconds++;
        updateCallTimerDisplay();
    }, 1000);

    // Primer audio: Saludo inicial
    dispatcherAudio.onended = () => startListening();
    playSound(dispatcherAudio);
}

function endCall() {
    vadActive = false;
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }

    // Stop all audio
    [dispatcherAudio, document.getElementById('location-audio'), document.getElementById('help-audio')].forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.onended = null;
    });

    clearInterval(callInterval);
    resetSimulator();
}

function updateCallTimerDisplay() {
    const mins = Math.floor(callSeconds / 60).toString().padStart(2, '0');
    const secs = (callSeconds % 60).toString().padStart(2, '0');
    document.getElementById('call-timer').innerText = `${mins}:${secs}`;
}

function showSuccess() {
    clearInterval(callInterval);
    const callBtn = document.getElementById('call-btn');
    callBtn.classList.remove('active-call');
    playSound(successSound);
    successOverlay.classList.remove('hidden');
}

function resetSimulator() {
    if (callInterval) clearInterval(callInterval);

    const callBtn = document.getElementById('call-btn');
    callBtn.classList.remove('active-call');

    successOverlay.classList.add('hidden');
    document.getElementById('call-timer').classList.add('hidden');
    document.getElementById('instruction-icon').classList.remove('hidden');

    // Re-enable keypad
    document.getElementById('keypad').style.pointerEvents = 'auto';

    dialedNumber = "";
    updateDisplay();
}

function showError() {
    errorFeedback.classList.remove('hidden');
    displayArea.classList.add('shake');
    setTimeout(() => {
        displayArea.classList.remove('shake');
    }, 500);

    // Auto hide error after 2 seconds
    setTimeout(hideError, 2000);
}

function hideError() {
    errorFeedback.classList.add('hidden');
}

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Audio play blocked", e));
    }
}

// Update time
function updateTime() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').innerText = timeStr;
}

setInterval(updateTime, 1000);
updateTime();
