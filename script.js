// État global de l'application
const state = {
    currentIndex: 0,
    isTransitioning: false,
    mode: 'showcase',
    touchStartX: 0,
    touchEndX: 0,
    mouseX: 0,
    mouseY: 0
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    initWebGL();
    initParticles();
    initCursor();
    initNavigation();
    initCards();
    initModeToggle();
    initCharts();
    animateNumbers();
    initKeyboardNavigation();
    initTouchNavigation();
    initScrollNavigation();
    initCardTilt();
    createCardParticles();
});

// Système WebGL avec Three.js pour le fond
function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Géométrie morphing
    const geometry = new THREE.IcosahedronGeometry(5, 1);
    const material = new THREE.MeshPhongMaterial({
        color: 0x667eea,
        emissive: 0x764ba2,
        emissiveIntensity: 0.2,
        shininess: 100,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Lumières dynamiques
    const light1 = new THREE.PointLight(0x00f0ff, 2, 100);
    light1.position.set(20, 20, 20);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xff00ff, 2, 100);
    light2.position.set(-20, -20, 20);
    scene.add(light2);
    
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    camera.position.z = 30;
    
    // Variables pour le morphing
    let morphTargets = [];
    const morphGeometries = [
        new THREE.TetrahedronGeometry(5, 0),
        new THREE.OctahedronGeometry(5, 0),
        new THREE.DodecahedronGeometry(5, 0),
        new THREE.IcosahedronGeometry(5, 1)
    ];
    
    let currentGeometry = 0;
    let morphProgress = 0;
    let targetPositions = [];
    
    // Fonction de morphing
    function morphToNextGeometry() {
        const nextGeometry = morphGeometries[(currentGeometry + 1) % morphGeometries.length];
        targetPositions = nextGeometry.attributes.position.array;
        morphProgress = 0;
        
        gsap.to({ progress: morphProgress }, {
            progress: 1,
            duration: 3,
            ease: "power2.inOut",
            onUpdate: function() {
                const positions = geometry.attributes.position.array;
                const currentPositions = morphGeometries[currentGeometry].attributes.position.array;
                
                for (let i = 0; i < positions.length; i++) {
                    positions[i] = currentPositions[i] + (targetPositions[i] - currentPositions[i]) * this.targets()[0].progress;
                }
                
                geometry.attributes.position.needsUpdate = true;
            },
            onComplete: () => {
                currentGeometry = (currentGeometry + 1) % morphGeometries.length;
            }
        });
    }
    
    // Morphing automatique
    setInterval(morphToNextGeometry, 5000);
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotation basée sur la souris
        mesh.rotation.x += 0.001 + (state.mouseY * 0.00001);
        mesh.rotation.y += 0.002 + (state.mouseX * 0.00001);
        
        // Animation des lumières
        const time = Date.now() * 0.001;
        light1.position.x = Math.sin(time) * 30;
        light1.position.y = Math.cos(time) * 30;
        
        light2.position.x = Math.cos(time) * 30;
        light2.position.y = Math.sin(time) * 30;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Système de particules dynamiques
function initParticles() {
    const container = document.querySelector('.particles-container');
    const particleCount = state.mode === 'showcase' ? 50 : 10;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
    
    // Créer des particules continuellement
    setInterval(() => {
        if (container.children.length < particleCount) {
            createParticle(container);
        }
    }, 1000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position aléatoire
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    
    // Taille aléatoire
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Durée d'animation aléatoire
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    
    container.appendChild(particle);
    
    // Supprimer après animation
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

// Curseur personnalisé avec traînée
function initCursor() {
    const cursor = { x: 0, y: 0 };
    const cursorTrail = { x: 0, y: 0 };
    
    document.addEventListener('mousemove', (e) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
        
        state.mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        state.mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        
        // Mise à jour des variables CSS pour le curseur
        document.body.style.setProperty('--cursor-x', cursor.x + 'px');
        document.body.style.setProperty('--cursor-y', cursor.y + 'px');
    });
    
    // Animation fluide du curseur
    function animateCursor() {
        cursorTrail.x += (cursor.x - cursorTrail.x) * 0.1;
        cursorTrail.y += (cursor.y - cursorTrail.y) * 0.1;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// Navigation entre les cartes
function initNavigation() {
    const cards = document.querySelectorAll('.card');
    const dots = document.querySelectorAll('.nav-dot');
    const prevBtn = document.querySelector('.nav-prev');
    const nextBtn = document.querySelector('.nav-next');
    const track = document.querySelector('.cards-track');
    
    // Navigation par boutons
    prevBtn.addEventListener('click', () => navigateCards('prev'));
    nextBtn.addEventListener('click', () => navigateCards('next'));
    
    // Navigation par dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => navigateToCard(index));
    });
    
    // Clic sur carte pour la sélectionner
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (index !== state.currentIndex) {
                navigateToCard(index);
            }
        });
    });
}

function navigateCards(direction) {
    if (state.isTransitioning) return;
    
    const cards = document.querySelectorAll('.card');
    const totalCards = cards.length;
    
    if (direction === 'next') {
        state.currentIndex = (state.currentIndex + 1) % totalCards;
    } else {
        state.currentIndex = (state.currentIndex - 1 + totalCards) % totalCards;
    }
    
    updateCardsDisplay();
}

function navigateToCard(index) {
    if (state.isTransitioning || index === state.currentIndex) return;
    
    state.currentIndex = index;
    updateCardsDisplay();
}

function updateCardsDisplay() {
    state.isTransitioning = true;
    
    const cards = document.querySelectorAll('.card');
    const dots = document.querySelectorAll('.nav-dot');
    const track = document.querySelector('.cards-track');
    
    // Calcul de la translation
    const cardWidth = 380;
    const cardGap = 60;
    const offset = -(state.currentIndex * (cardWidth + cardGap));
    
    // Animation GSAP fluide
    gsap.to(track, {
        x: offset,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
            state.isTransitioning = false;
        }
    });
    
    // Mise à jour des classes
    cards.forEach((card, index) => {
        if (index === state.currentIndex) {
            card.classList.add('active');
            // Animation d'entrée de la carte active
            gsap.fromTo(card, 
                { scale: 0.85, opacity: 0.7, filter: "blur(2px)" },
                { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out" }
            );
        } else {
            card.classList.remove('active');
        }
    });
    
    // Mise à jour des dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentIndex);
    });
}

// Initialisation des cartes avec effets
function initCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Animation d'entrée échelonnée
        gsap.fromTo(card,
            { y: 100, opacity: 0, scale: 0.8 },
            { 
                y: 0, 
                opacity: index === 0 ? 1 : 0.7, 
                scale: index === 0 ? 1 : 0.85,
                duration: 1,
                delay: index * 0.1,
                ease: "power3.out"
            }
        );
        
        // Effet de hover avec GSAP
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active')) {
                gsap.to(card, {
                    scale: 0.9,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active')) {
                gsap.to(card, {
                    scale: 0.85,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    });
}

// Toggle entre mode Showcase et Sobre
function initModeToggle() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === state.mode) return;
            
            state.mode = mode;
            document.body.classList.toggle('sobre-mode', mode === 'sobre');
            
            // Mise à jour des boutons
            modeBtns.forEach(b => {
                b.setAttribute('aria-pressed', b.dataset.mode === mode);
            });
            
            // Réinitialiser les particules selon le mode
            const container = document.querySelector('.particles-container');
            container.innerHTML = '';
            initParticles();
            
            // Animation de transition
            gsap.to('body', {
                backgroundColor: mode === 'sobre' ? '#1a1a2e' : '#0a0a0f',
                duration: 1,
                ease: "power2.inOut"
            });
        });
    });
}

// Graphiques avec Chart.js
function initCharts() {
    const charts = document.querySelectorAll('.mini-chart');
    
    charts.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const type = canvas.dataset.chart;
        
        // Configuration selon le type
        let data, options;
        
        switch(type) {
            case 'contacts':
                data = {
                    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                    datasets: [{
                        data: [65, 78, 90, 81, 96, 85, 90],
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                };
                break;
            case 'entreprises':
                data = {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                        data: [120, 150, 180, 220],
                        backgroundColor: ['#ff00ff', '#ff0080', '#ff00ff', '#ff0080']
                    }]
                };
                break;
            case 'taches':
                data = {
                    labels: ['Complétées', 'En cours', 'En retard'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: ['#00ff80', '#00ffff', '#ff4444']
                    }]
                };
                break;
            case 'pipeline':
                data = {
                    labels: ['Prospect', 'Qualifié', 'Proposition', 'Négociation', 'Gagné'],
                    datasets: [{
                        data: [30, 25, 20, 15, 10],
                        backgroundColor: '#ffff00',
                        borderColor: '#ff8000',
                        borderWidth: 2
                    }]
                };
                break;
        }
        
        // Options communes
        options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: state.mode === 'showcase' }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        };
        
        // Type de graphique selon la carte
        const chartType = type === 'entreprises' ? 'bar' : 
                         type === 'taches' ? 'doughnut' : 
                         type === 'pipeline' ? 'bar' : 'line';
        
        new Chart(ctx, {
            type: chartType,
            data: data,
            options: options
        });
    });
}

// Animation des nombres
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseFloat(element.dataset.value);
                const isDecimal = targetValue % 1 !== 0;
                
                gsap.fromTo(element,
                    { textContent: 0 },
                    {
                        textContent: targetValue,
                        duration: 2,
                        ease: "power2.out",
                        snap: { textContent: isDecimal ? 0.1 : 1 },
                        onUpdate: function() {
                            const value = parseFloat(this.targets()[0].textContent);
                            element.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
                        }
                    }
                );
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    numbers.forEach(number => observer.observe(number));
}

// Navigation au clavier
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                navigateCards('prev');
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigateCards('next');
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const index = parseInt(e.key) - 1;
                navigateToCard(index);
                break;
        }
    });
}

// Navigation tactile (swipe)
function initTouchNavigation() {
    const container = document.querySelector('.cards-container');
    
    container.addEventListener('touchstart', (e) => {
        state.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        state.touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = state.touchStartX - state.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            navigateCards('next');
        } else {
            navigateCards('prev');
        }
    }
}

// Navigation à la molette
function initScrollNavigation() {
    let scrollTimeout;
    const container = document.querySelector('.cards-container');
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
                navigateCards('next');
            } else {
                navigateCards('prev');
            }
        }, 50);
    }, { passive: false });
}

// Effet de tilt 3D sur les cartes
function initCardTilt() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const inner = card.querySelector('.card-inner');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            gsap.to(inner, {
                rotationX: -rotateX,
                rotationY: rotateY,
                duration: 0.3,
                ease: "power2.out",
                transformPerspective: 1000,
                transformOrigin: "center center"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(inner, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
}

// Particules dans les cartes
function createCardParticles() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const particlesContainer = card.querySelector('.card-particles');
        const cardType = card.dataset.card;
        
        // Couleurs selon le type de carte
        const colors = {
            contacts: ['#00f0ff', '#0080ff'],
            entreprises: ['#ff00ff', '#ff0080'],
            taches: ['#00ff80', '#00ffff'],
            pipeline: ['#ffff00', '#ff8000']
        };
        
        // Créer des particules flottantes
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.borderRadius = '50%';
            particle.style.background = colors[cardType][Math.floor(Math.random() * 2)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.pointerEvents = 'none';
            
            particlesContainer.appendChild(particle);
            
            // Animation aléatoire
            gsap.to(particle, {
                x: 'random(-50, 50)',
                y: 'random(-50, 50)',
                duration: 'random(10, 20)',
                repeat: -1,
                yoyo: true,
                ease: "none",
                opacity: 'random(0.3, 0.8)'
            });
        }
    });
}

// Effet de parallaxe sur le logo
document.addEventListener('mousemove', (e) => {
    const logoLetters = document.querySelectorAll('.logo-letter');
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    logoLetters.forEach((letter, index) => {
        const depth = (index + 1) * 0.5;
        const moveX = (clientX - centerX) * depth / 100;
        const moveY = (clientY - centerY) * depth / 100;
        
        gsap.to(letter, {
            x: moveX,
            y: moveY,
            duration: 0.5,
            ease: "power2.out"
        });
    });
});

// Performance : limiter les animations en mode sobre
function optimizePerformance() {
    if (state.mode === 'sobre') {
        // Réduire le nombre de particules
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 10) particle.remove();
        });
        
        // Désactiver certaines animations
        gsap.globalTimeline.pause();
    } else {
        gsap.globalTimeline.resume();
    }
}