// script.js - MODERN BRUTALIST INTERACTIVITY

console.log('%c⚡ KEFIR//PARADOX ⚡', 'color: #ff00ff; font-size: 24px; font-weight: bold;');
console.log('%cBrutalist glitch effects initialized', 'color: #00ffff; font-size: 14px;');

// ===== CONFIGURATION =====
const CONFIG = {
    glitch: {
        intensity: 3, // px offset for glitch effects
        frequency: 5000, // ms between random glitches
        duration: 100 // ms glitch duration
    },
    particles: {
        count: 50,
        colors: ['#ff00ff', '#00ffff', '#00ff00', '#8a2be2'],
        size: { min: 1, max: 4 },
        speed: { min: 0.5, max: 2 }
    },
    scroll: {
        parallax: true,
        threshold: 0.1
    }
};

// ===== GLOBAL STATE =====
let mouseX = 0;
let mouseY = 0;
let scrollY = 0;
let glitchActive = false;

// ===== DOM ELEMENTS =====
const dom = {
    body: document.body,
    container: document.querySelector('.container'),
    glitchElements: document.querySelectorAll('.glitch-text, .data-glitch'),
    dataTable: document.querySelector('.data-table'),
    collageItems: document.querySelectorAll('.collage-item'),
    timelineItems: document.querySelectorAll('.timeline-item')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing brutalist effects...');
    
    // Remove loading screen
    removeLoadingScreen();
    
    // Initialize all effects
    initMouseTracking();
    initGlitchEffects();
    initParticleSystem();
    initScrollEffects();
    initInteractiveData();
    initImageDistortion();
    initAudioFeedback();
    
    // Start background processes
    startRandomGlitches();
    startDataCorruption();
    
    console.log('✅ All effects initialized');
});

// ===== LOADING SCREEN =====
function removeLoadingScreen() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    // Add exit animation
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease';
    
    // Remove from DOM
    setTimeout(() => {
        loader.style.display = 'none';
        
        // Trigger initial glitch for dramatic effect
        triggerMassiveGlitch();
    }, 500);
}

function triggerMassiveGlitch() {
    dom.body.style.transform = 'translateX(5px)';
    dom.body.style.filter = 'hue-rotate(180deg) contrast(200%)';
    
    setTimeout(() => {
        dom.body.style.transform = 'translateX(-5px)';
        dom.body.style.filter = 'hue-rotate(0deg) contrast(100%)';
    }, 50);
    
    setTimeout(() => {
        dom.body.style.transform = '';
        dom.body.style.filter = '';
    }, 100);
}

// ===== MOUSE TRACKING =====
function initMouseTracking() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update CSS variables for cursor effects
        document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);
        
        // Create occasional mouse trail
        if (Math.random() > 0.7) {
            createMouseTrail(e);
        }
    });
    
    // Click effects
    document.addEventListener('click', (e) => {
        createClickRipple(e);
        triggerLocalGlitch(e.target);
    });
    
    // Special effects for data table
    if (dom.dataTable) {
        dom.dataTable.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'TD') {
                distortTableData(e.target);
            }
        });
    }
}

function createMouseTrail(e) {
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    
    // Random color from palette
    const colors = CONFIG.particles.colors;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = Math.random() * (CONFIG.particles.size.max - CONFIG.particles.size.min) + CONFIG.particles.size.min;
    
    // Position at mouse
    trail.style.cssText = `
        position: fixed;
        left: ${e.pageX}px;
        top: ${e.pageY}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.7;
        transform: translate(-50%, -50%);
        mix-blend-mode: screen;
    `;
    
    document.body.appendChild(trail);
    
    // Animate out
    const animation = trail.animate([
        { 
            transform: 'translate(-50%, -50%) scale(1)',
            opacity: 0.7
        },
        { 
            transform: 'translate(-50%, -50%) scale(0)',
            opacity: 0
        }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
    
    animation.onfinish = () => trail.remove();
}

function createClickRipple(e) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    
    ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 20px;
        height: 20px;
        border: 2px solid #ff00ff;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        transform: translate(-50%, -50%) scale(0);
    `;
    
    document.body.appendChild(ripple);
    
    // Animate ripple
    ripple.animate([
        { 
            transform: 'translate(-50%, -50%) scale(0)',
            opacity: 1,
            borderWidth: '2px'
        },
        { 
            transform: 'translate(-50%, -50%) scale(10)',
            opacity: 0,
            borderWidth: '0px'
        }
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }).onfinish = () => ripple.remove();
}

// ===== GLITCH EFFECTS =====
function initGlitchEffects() {
    // Add glitch listeners to all glitchable elements
    dom.glitchElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (!glitchActive) {
                triggerElementGlitch(element, true);
            }
        });
        
        element.addEventListener('mouseleave', () => {
            // Reset glitch
            element.style.transform = '';
            element.style.filter = '';
        });
    });
}

function triggerElementGlitch(element, intense = false) {
    if (glitchActive) return;
    
    glitchActive = true;
    
    const intensity = intense ? CONFIG.glitch.intensity * 2 : CONFIG.glitch.intensity;
    
    // Apply glitch effect
    element.style.transition = 'none';
    element.style.transform = `translate(${Math.random() * intensity - intensity/2}px, ${Math.random() * intensity - intensity/2}px)`;
    element.style.filter = `hue-rotate(${Math.random() * 90}deg) brightness(${1 + Math.random() * 0.5})`;
    
    // Reset after duration
    setTimeout(() => {
        element.style.transition = `all ${CONFIG.glitch.duration}ms`;
        element.style.transform = '';
        element.style.filter = '';
        glitchActive = false;
    }, CONFIG.glitch.duration);
}

function triggerLocalGlitch(element) {
    const rect = element.getBoundingClientRect();
    
    // Create glitch overlay
    const glitch = document.createElement('div');
    glitch.className = 'local-glitch';
    
    glitch.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        background: linear-gradient(45deg, #ff00ff22, #00ffff22);
        pointer-events: none;
        z-index: 9996;
        mix-blend-mode: overlay;
        animation: localGlitch 0.3s forwards;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes localGlitch {
            0% { opacity: 0; transform: translateX(0); }
            25% { opacity: 0.5; transform: translateX(5px); }
            50% { opacity: 0.7; transform: translateX(-5px); }
            75% { opacity: 0.5; transform: translateX(3px); }
            100% { opacity: 0; transform: translateX(0); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(glitch);
    
    setTimeout(() => {
        glitch.remove();
        style.remove();
    }, 300);
}

function startRandomGlitches() {
    setInterval(() => {
        if (Math.random() > 0.3 && !glitchActive) {
            const elements = Array.from(dom.glitchElements);
            if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                triggerElementGlitch(randomElement);
            }
        }
    }, CONFIG.glitch.frequency);
}

// ===== PARTICLE SYSTEM =====
function initParticleSystem() {
    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9995;
        overflow: hidden;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Create particles
    for (let i = 0; i < CONFIG.particles.count; i++) {
        createParticle(particleContainer);
    }
    
    // Animate particles
    animateParticles();
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const color = CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)];
    const size = Math.random() * (CONFIG.particles.size.max - CONFIG.particles.size.min) + CONFIG.particles.size.min;
    const speed = Math.random() * (CONFIG.particles.speed.max - CONFIG.particles.speed.min) + CONFIG.particles.speed.min;
    
    // Initial position
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    
    particle.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        opacity: ${Math.random() * 0.3 + 0.1};
        pointer-events: none;
    `;
    
    // Store animation properties
    particle.dataset.speed = speed;
    particle.dataset.angle = Math.random() * Math.PI * 2;
    particle.dataset.radius = Math.random() * 2 + 1;
    
    container.appendChild(particle);
    return particle;
}

function animateParticles() {
    const particles = document.querySelectorAll('.particle');
    const time = Date.now() * 0.001;
    
    particles.forEach(particle => {
        const speed = parseFloat(particle.dataset.speed);
        const angle = parseFloat(particle.dataset.angle);
        const radius = parseFloat(particle.dataset.radius);
        
        // Calculate new position with sine wave for organic movement
        const x = parseFloat(particle.style.left) + Math.cos(time + angle) * radius;
        const y = parseFloat(particle.style.top) + Math.sin(time + angle) * radius;
        
        // Wrap around screen
        particle.style.left = `${(x + speed) % window.innerWidth}px`;
        particle.style.top = `${(y + speed * 0.5) % window.innerHeight}px`;
        
        // Pulsing opacity
        const opacity = 0.1 + 0.2 * Math.sin(time * 2 + angle);
        particle.style.opacity = opacity;
    });
    
    requestAnimationFrame(animateParticles);
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    if (!CONFIG.scroll.parallax) return;
    
    // Track scroll position
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        
        // Update CSS variable
        document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
        
        // Parallax effect on collage items
        dom.collageItems.forEach((item, index) => {
            const speed = 0.1 * (index + 1);
            const yOffset = scrollY * speed;
            item.style.transform = `translateY(${yOffset}px)`;
        });
        
        // Animate timeline items on scroll
        animateOnScroll();
    }, { passive: true });
}

function animateOnScroll() {
    const windowHeight = window.innerHeight;
    const windowTop = scrollY;
    const windowBottom = windowTop + windowHeight;
    
    dom.timelineItems.forEach(item => {
        const itemTop = item.offsetTop;
        const itemBottom = itemTop + item.offsetHeight;
        
        // Check if item is in viewport
        if (itemBottom > windowTop && itemTop < windowBottom) {
            const visibility = Math.min(
                1,
                (windowBottom - itemTop) / (item.offsetHeight + windowHeight)
            );
            
            // Animate based on visibility
            item.style.opacity = visibility;
            item.style.transform = `translateX(${(1 - visibility) * 50}px)`;
        }
    });
}

// ===== INTERACTIVE DATA =====
function initInteractiveData() {
    if (!dom.dataTable) return;
    
    const rows = dom.dataTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        // Add hover effect
        row.addEventListener('mouseenter', () => {
            animateDataRow(row, 'enter');
        });
        
        row.addEventListener('mouseleave', () => {
            animateDataRow(row, 'leave');
        });
        
        // Click to "corrupt" data
        row.addEventListener('click', (e) => {
            e.preventDefault();
            corruptDataRow(row);
        });
    });
    
    // Add data visualization
    createDataVisualization();
}

function animateDataRow(row, action) {
    const cells = row.querySelectorAll('td');
    
    cells.forEach((cell, index) => {
        if (action === 'enter') {
            cell.style.transition = `all 0.3s ${index * 0.1}s`;
            cell.style.transform = 'translateX(10px)';
            cell.style.backgroundColor = '#ff00ff11';
        } else {
            cell.style.transition = 'all 0.3s';
            cell.style.transform = '';
            cell.style.backgroundColor = '';
        }
    });
}

function corruptDataRow(row) {
    const cells = row.querySelectorAll('td');
    const originalTexts = Array.from(cells).map(cell => cell.textContent);
    
    // Corrupt animation
    cells.forEach((cell, index) => {
        // Add glitch class
        cell.classList.add('data-glitch');
        
        // Temporarily replace text with corrupted version
        let corruptedText = originalTexts[index];
        for (let i = 0; i < 5; i++) {
            const pos = Math.floor(Math.random() * corruptedText.length);
            corruptedText = corruptedText.substring(0, pos) + 
                          String.fromCharCode(33 + Math.random() * 90) + 
                          corruptedText.substring(pos + 1);
        }
        
        cell.textContent = corruptedText;
        
        // Restore after delay
        setTimeout(() => {
            cell.textContent = originalTexts[index];
            cell.classList.remove('data-glitch');
        }, 500);
    });
}

function createDataVisualization() {
    const vizContainer = document.createElement('div');
    vizContainer.className = 'data-visual';
    vizContainer.innerHTML = '<div class="data-bars"></div>';
    
    // Find a place to insert the visualization (after the table)
    if (dom.dataTable.parentNode) {
        dom.dataTable.parentNode.insertBefore(vizContainer, dom.dataTable.nextSibling);
        
        // Create bars based on data
        setTimeout(() => createDataBars(vizContainer), 100);
    }
}

function createDataBars(container) {
    const barsContainer = container.querySelector('.data-bars');
    if (!barsContainer) return;
    
    // Sample data for visualization
    const data = [
        { label: 'L. kefiri', value: 0.8, color: '#ff00ff' },
        { label: 'L. lactis', value: 0.7, color: '#00ffff' },
        { label: 'Saccharomyces', value: 0.6, color: '#00ff00' },
        { label: 'Leuconostoc', value: 0.5, color: '#8a2be2' }
    ];
    
    data.forEach((item, index) => {
        const bar = document.createElement('div');
        bar.className = 'data-bar';
        bar.style.cssText = `
            left: ${index * 25}%;
            height: ${item.value * 100}%;
            background: ${item.color};
        `;
        
        bar.dataset.value = item.value;
        bar.dataset.label = item.label;
        
        // Tooltip on hover
        bar.addEventListener('mouseenter', () => {
            showDataTooltip(bar, item);
        });
        
        bar.addEventListener('mouseleave', () => {
            hideDataTooltip();
        });
        
        barsContainer.appendChild(bar);
    });
}

function showDataTooltip(bar, data) {
    const tooltip = document.createElement('div');
    tooltip.className = 'data-tooltip';
    tooltip.textContent = `${data.label}: ${(data.value * 1e8).toExponential(0)} CFU/g`;
    tooltip.style.cssText = `
        position: absolute;
        left: ${bar.offsetLeft + bar.offsetWidth/2}px;
        top: ${bar.offsetTop - 30}px;
        background: #000;
        color: ${data.color};
        padding: 5px 10px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        border: 1px solid ${data.color};
        transform: translateX(-50%);
        z-index: 10000;
        white-space: nowrap;
    `;
    
    bar.appendChild(tooltip);
}

function hideDataTooltip() {
    const tooltips = document.querySelectorAll('.data-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
}

function startDataCorruption() {
    // Randomly corrupt data points
    setInterval(() => {
        if (Math.random() > 0.7) {
            const bars = document.querySelectorAll('.data-bar');
            if (bars.length > 0) {
                const randomBar = bars[Math.floor(Math.random() * bars.length)];
                animateBarCorruption(randomBar);
            }
        }
    }, 3000);
}

function animateBarCorruption(bar) {
    const originalHeight = bar.style.height;
    const originalColor = bar.style.background;
    
    // Corrupt animation
    bar.animate([
        { height: originalHeight, background: originalColor },
        { height: `${Math.random() * 100}%`, background: '#ff0000' },
        { height: originalHeight, background: originalColor }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
}

// ===== IMAGE DISTORTION =====
function initImageDistortion() {
    dom.collageItems.forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;
        
        item.addEventListener('mouseenter', () => {
            distortImage(img, true);
        });
        
        item.addEventListener('mouseleave', () => {
            distortImage(img, false);
        });
    });
}

function distortImage(img, distort) {
    if (distort) {
        // Apply glitch distortion
        img.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        img.style.filter = `
            hue-rotate(${Math.random() * 60 - 30}deg)
            contrast(${1 + Math.random() * 0.5})
            saturate(${1 + Math.random() * 0.5})
        `;
        img.style.transform = `
            scale(${1 + Math.random() * 0.1})
            rotate(${Math.random() * 2 - 1}deg)
        `;
    } else {
        // Reset to normal
        img.style.filter = '';
        img.style.transform = '';
    }
}

// ===== AUDIO FEEDBACK =====
function initAudioFeedback() {
    // Create audio context for sound effects
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        window.audioContext = new (AudioContext || webkitAudioContext)();
        
        // Click sounds
        document.addEventListener('click', (e) => {
            if (Math.random() > 0.5) {
                playGlitchSound();
            }
        });
        
        // Hover sounds for glitch elements
        dom.glitchElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                playHoverSound();
            });
        });
    }
}

function playGlitchSound() {
    if (!window.audioContext) return;
    
    const oscillator = window.audioContext.createOscillator();
    const gainNode = window.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(window.audioContext.destination);
    
    // Glitchy sound parameters
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(100, window.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, window.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, window.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(window.audioContext.currentTime + 0.1);
}

function playHoverSound() {
    if (!window.audioContext) return;
    
    const oscillator = window.audioContext.createOscillator();
    const gainNode = window.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(window.audioContext.destination);
    
    // Subtle hover sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, window.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, window.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.2);
    
    oscillator.start();
    oscillator.stop(window.audioContext.currentTime + 0.2);
}

// ===== UTILITY FUNCTIONS =====
function distortTableData(cell) {
    const original = cell.textContent;
    let distorted = '';
    
    // Randomly distort some characters
    for (let i = 0; i < original.length; i++) {
        if (Math.random() > 0.9) {
            distorted += String.fromCharCode(original.charCodeAt(i) + Math.floor(Math.random() * 10) - 5);
        } else {
            distorted += original[i];
        }
    }
    
    cell.textContent = distorted;
    
    // Restore after delay
    setTimeout(() => {
        cell.textContent = original;
    }, 300);
}

// ===== WINDOW RESIZE HANDLER =====
window.addEventListener('resize', () => {
    // Reinitialize particles if needed
    const particleContainer = document.getElementById('particle-container');
    if (particleContainer) {
        particleContainer.innerHTML = '';
        initParticleSystem();
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.log('%c⚠️ BRUTALIST ERROR (INTENTIONAL?) ⚠️', 'color: #ff0000; font-size: 16px;');
    console.error(e);
    
    // Create error glitch effect
    dom.body.style.animation = 'none';
    setTimeout(() => {
        dom.body.style.animation = 'text-glitch 0.3s';
    }, 10);
});

// ===== EXPORT FOR DEBUGGING =====
if (typeof window !== 'undefined') {
    window.kefirParadox = {
        triggerGlitch: () => triggerMassiveGlitch(),
        corruptAllData: () => {
            const rows = document.querySelectorAll('.data-table tbody tr');
            rows.forEach(row => corruptDataRow(row));
        },
        toggleParticles: () => {
            const container = document.getElementById('particle-container');
            if (container) {
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
            }
        },
        config: CONFIG
    };
    
    console.log('🎮 Debug controls available: window.kefirParadox');
}