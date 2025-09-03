document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const visualizationCanvas = document.getElementById('visualization-canvas');
    const loadingOverlay = document.getElementById('loading-overlay');
    const visualizationType = document.getElementById('visualization-type');
    const timePeriod = document.getElementById('time-period');
    const detailLevel = document.getElementById('detail-level');
    const malayalamBtn = document.getElementById('malayalam-btn');
    const englishBtn = document.getElementById('english-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutText = document.getElementById('logout-text');
    const backText = document.getElementById('back-text');
    
    // Global variables
    let currentLanguage = 'malayalam';
    let scene, camera, renderer, controls;
    let terrain, crops, irrigation, soilHealth;
    let currentVisualization = 'terrain';
    let isLoading = true;
    
    // Initialize the application
    initLanguage();
    initThreeJS();
    setupEventListeners();
    displayUsername();
    
    // Setup event listeners
    function setupEventListeners() {
        // Language toggle
        malayalamBtn.addEventListener('click', () => setLanguage('malayalam'));
        englishBtn.addEventListener('click', () => setLanguage('english'));
        
        // Logout button
        logoutBtn.addEventListener('click', handleLogout);
        
        // Visualization controls
        visualizationType.addEventListener('change', changeVisualization);
        timePeriod.addEventListener('change', updateVisualization);
        detailLevel.addEventListener('input', updateDetailLevel);
        
        // Window resize
        window.addEventListener('resize', onWindowResize);
    }
    
    // Initialize language based on stored preference
    function initLanguage() {
        const storedLanguage = localStorage.getItem('language');
        if (storedLanguage) {
            setLanguage(storedLanguage);
        } else {
            setLanguage('malayalam'); // Default language
        }
    }
    
    // Initialize Three.js scene
    function initThreeJS() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f5f0);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, visualizationCanvas.clientWidth / visualizationCanvas.clientHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({
            canvas: visualizationCanvas,
            antialias: true
        });
        renderer.setSize(visualizationCanvas.clientWidth, visualizationCanvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Add controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI / 2;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Create initial visualization
        createTerrain();
        createCrops();
        createIrrigation();
        createSoilHealth();
        
        // Show initial visualization
        showVisualization('terrain');
        
        // Start animation loop
        animate();
        
        // Hide loading overlay after a short delay
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            isLoading = false;
        }, 1500);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    function onWindowResize() {
        camera.aspect = visualizationCanvas.clientWidth / visualizationCanvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(visualizationCanvas.clientWidth, visualizationCanvas.clientHeight);
    }
    
    // Create terrain visualization
    function createTerrain() {
        // Create terrain group
        terrain = new THREE.Group();
        scene.add(terrain);
        
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(20, 20, 64, 64);
        
        // Add terrain height variations
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Create natural-looking terrain with hills and valleys
            vertices[i + 1] = 0.5 * Math.sin(x / 2) * Math.cos(z / 2) + 
                              0.3 * Math.sin(x * 0.5) * Math.cos(z * 0.5) +
                              0.2 * Math.sin(x * 1.5) * Math.cos(z * 1.5);
        }
        
        // Update normals for proper lighting
        groundGeometry.computeVertexNormals();
        
        // Create material with color gradient based on height
        const groundMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: false,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Add color variations based on height
        const colors = [];
        for (let i = 0; i < vertices.length; i += 3) {
            const height = vertices[i + 1];
            
            // Color gradient from brown (low) to green (high)
            if (height < 0) {
                // Lower areas - darker brown
                colors.push(0.5, 0.35, 0.2); // Brown
            } else if (height < 0.3) {
                // Medium-low areas - light brown
                colors.push(0.6, 0.45, 0.3); // Light brown
            } else if (height < 0.6) {
                // Medium areas - light green
                colors.push(0.4, 0.6, 0.3); // Light green
            } else {
                // Higher areas - darker green
                colors.push(0.3, 0.5, 0.2); // Dark green
            }
        }
        
        // Add colors to geometry
        groundGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Create mesh and add to terrain group
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to horizontal
        ground.receiveShadow = true;
        terrain.add(ground);
        
        // Add water features
        const waterGeometry = new THREE.PlaneGeometry(4, 3);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a87e8,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.2
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(-5, -0.1, -5);
        terrain.add(water);
        
        // Add boundary markers
        const boundaryGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        const boundaryMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        
        // Create boundary markers at corners
        const boundaries = [
            { x: -10, z: -10 },
            { x: -10, z: 10 },
            { x: 10, z: -10 },
            { x: 10, z: 10 }
        ];
        
        boundaries.forEach(pos => {
            const boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
            boundary.position.set(pos.x, 0.25, pos.z);
            boundary.castShadow = true;
            boundary.receiveShadow = true;
            terrain.add(boundary);
        });
    }
    
    // Create crops visualization
    function createCrops() {
        // Create crops group
        crops = new THREE.Group();
        scene.add(crops);
        crops.visible = false;
        
        // Create different crop types
        createRiceCrops();
        createCoconutTrees();
        createBananaTrees();
    }
    
    // Create rice crop visualization
    function createRiceCrops() {
        // Rice paddy area
        const paddyGeometry = new THREE.PlaneGeometry(8, 8, 32, 32);
        const paddyMaterial = new THREE.MeshStandardMaterial({
            color: 0x7cae7a,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const paddy = new THREE.Mesh(paddyGeometry, paddyMaterial);
        paddy.rotation.x = -Math.PI / 2;
        paddy.position.set(-4, 0.05, -4);
        crops.add(paddy);
        
        // Add individual rice plants
        const ricePlantGeometry = new THREE.CylinderGeometry(0.05, 0, 0.5, 8);
        const ricePlantMaterial = new THREE.MeshStandardMaterial({ color: 0x90ee90 });
        
        // Create rice plants in a grid pattern
        for (let x = -7.5; x <= -0.5; x += 0.5) {
            for (let z = -7.5; z <= -0.5; z += 0.5) {
                // Add some randomness to position and scale
                const offsetX = (Math.random() - 0.5) * 0.2;
                const offsetZ = (Math.random() - 0.5) * 0.2;
                const scale = 0.8 + Math.random() * 0.4;
                
                const ricePlant = new THREE.Mesh(ricePlantGeometry, ricePlantMaterial);
                ricePlant.position.set(x + offsetX, 0.25, z + offsetZ);
                ricePlant.scale.set(scale, scale, scale);
                ricePlant.castShadow = true;
                crops.add(ricePlant);
            }
        }
    }
    
    // Create coconut trees visualization
    function createCoconutTrees() {
        // Create tree trunk geometry and material
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        
        // Create leaves geometry and material
        const leavesGeometry = new THREE.ConeGeometry(1.5, 2, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
        
        // Create coconut trees at specific positions
        const treePositions = [
            { x: 5, z: -5 },
            { x: 7, z: -7 },
            { x: 6, z: -3 },
            { x: 8, z: -5 }
        ];
        
        treePositions.forEach(pos => {
            // Create trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, 1.5, pos.z);
            trunk.castShadow = true;
            crops.add(trunk);
            
            // Create leaves
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(pos.x, 4, pos.z);
            leaves.castShadow = true;
            crops.add(leaves);
            
            // Add coconuts
            const coconutGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const coconutMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
            
            // Add 3-5 coconuts per tree
            const coconutCount = 3 + Math.floor(Math.random() * 3);
            for (let i = 0; i < coconutCount; i++) {
                const angle = (i / coconutCount) * Math.PI * 2;
                const radius = 0.8;
                
                const coconut = new THREE.Mesh(coconutGeometry, coconutMaterial);
                coconut.position.set(
                    pos.x + Math.cos(angle) * radius,
                    3.2,
                    pos.z + Math.sin(angle) * radius
                );
                coconut.castShadow = true;
                crops.add(coconut);
            }
        });
    }
    
    // Create banana trees visualization
    function createBananaTrees() {
        // Create tree trunk geometry and material
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        
        // Create leaf geometry and material
        const leafGeometry = new THREE.PlaneGeometry(1.5, 0.5);
        const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x90ee90,
            side: THREE.DoubleSide
        });
        
        // Create banana trees at specific positions
        const treePositions = [
            { x: 3, z: 3 },
            { x: 5, z: 5 },
            { x: 3, z: 7 },
            { x: 7, z: 3 }
        ];
        
        treePositions.forEach(pos => {
            // Create trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, 1, pos.z);
            trunk.castShadow = true;
            crops.add(trunk);
            
            // Create leaves (4-6 per tree)
            const leafCount = 4 + Math.floor(Math.random() * 3);
            for (let i = 0; i < leafCount; i++) {
                const angle = (i / leafCount) * Math.PI * 2;
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                
                // Position and rotate leaf
                leaf.position.set(
                    pos.x + Math.cos(angle) * 0.5,
                    1.5 + (i % 2) * 0.3,
                    pos.z + Math.sin(angle) * 0.5
                );
                
                // Rotate leaf to face outward
                leaf.rotation.y = angle;
                leaf.rotation.x = Math.PI / 4;
                
                leaf.castShadow = true;
                crops.add(leaf);
            }
            
            // Add banana bunch
            const bananaGeometry = new THREE.CylinderGeometry(0.15, 0.1, 0.5, 8);
            const bananaMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
            
            const banana = new THREE.Mesh(bananaGeometry, bananaMaterial);
            banana.rotation.x = Math.PI / 2;
            banana.position.set(pos.x, 1.8, pos.z);
            banana.castShadow = true;
            crops.add(banana);
        });
    }
    
    // Create irrigation visualization
    function createIrrigation() {
        // Create irrigation group
        irrigation = new THREE.Group();
        scene.add(irrigation);
        irrigation.visible = false;
        
        // Create water source (well)
        const wellGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
        const wellMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const well = new THREE.Mesh(wellGeometry, wellMaterial);
        well.position.set(0, 0.25, 0);
        irrigation.add(well);
        
        // Create water in well
        const waterGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a87e8,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.set(0, 0.3, 0);
        irrigation.add(water);
        
        // Create main pipes
        createPipe(0, 0, 8, 0, 0.15);
        createPipe(0, 0, 0, 8, 0.15);
        createPipe(0, 0, -8, 0, 0.15);
        createPipe(0, 0, 0, -8, 0.15);
        
        // Create secondary pipes
        for (let i = 2; i <= 8; i += 2) {
            // Horizontal secondary pipes
            createPipe(i, 0, 0, 6, 0.1);
            createPipe(-i, 0, 0, 6, 0.1);
            createPipe(i, 0, 0, -6, 0.1);
            createPipe(-i, 0, 0, -6, 0.1);
            
            // Vertical secondary pipes
            createPipe(0, 0, i, 6, 0.1);
            createPipe(0, 0, -i, 6, 0.1);
            createPipe(0, 0, i, -6, 0.1);
            createPipe(0, 0, -i, -6, 0.1);
        }
        
        // Create sprinklers
        for (let x = -8; x <= 8; x += 2) {
            for (let z = -8; z <= 8; z += 2) {
                // Skip the center where the well is
                if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
                
                createSprinkler(x, z);
            }
        }
        
        // Create drip lines in specific areas
        createDripLines(-6, -6, 4, 4); // Rice area
        createDripLines(6, 6, 4, 4);   // Banana area
    }
    
    // Helper function to create pipes
    function createPipe(x1, z1, x2, z2, radius) {
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        const pipeGeometry = new THREE.CylinderGeometry(radius, radius, length, 16);
        const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        
        const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        
        // Position pipe at midpoint
        pipe.position.set((x1 + x2) / 2, radius, (z1 + z2) / 2);
        
        // Rotate pipe to connect points
        pipe.rotation.z = Math.PI / 2;
        pipe.rotation.y = Math.atan2(x2 - x1, z2 - z1);
        
        pipe.castShadow = true;
        pipe.receiveShadow = true;
        irrigation.add(pipe);
    }
    
    // Helper function to create sprinklers
    function createSprinkler(x, z) {
        const baseGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.2, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(x, 0.1, z);
        irrigation.add(base);
        
        const headGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(x, 0.25, z);
        irrigation.add(head);
        
        // Add water particles for animation
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x4a87e8,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        
        const positions = [];
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.3 + Math.random() * 0.7;
            const height = 0.2 + Math.random() * 0.3;
            
            positions.push(
                x + Math.cos(angle) * radius,
                0.25 + height,
                z + Math.sin(angle) * radius
            );
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        irrigation.add(particles);
    }
    
    // Helper function to create drip lines
    function createDripLines(x, z, width, height) {
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        
        // Create grid of drip lines
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const posX = x + i;
                const posZ = z + j;
                
                const positions = [
                    posX, 0.05, posZ,
                    posX, 0.15, posZ
                ];
                
                lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                const line = new THREE.Line(lineGeometry.clone(), lineMaterial);
                irrigation.add(line);
                
                // Add water droplet
                const dropGeometry = new THREE.SphereGeometry(0.02, 8, 8);
                const dropMaterial = new THREE.MeshStandardMaterial({
                    color: 0x4a87e8,
                    transparent: true,
                    opacity: 0.8
                });
                
                const drop = new THREE.Mesh(dropGeometry, dropMaterial);
                drop.position.set(posX, 0.1, posZ);
                irrigation.add(drop);
            }
        }
    }
    
    // Create soil health visualization
    function createSoilHealth() {
        // Create soil health group
        soilHealth = new THREE.Group();
        scene.add(soilHealth);
        soilHealth.visible = false;
        
        // Create base soil plane
        const soilGeometry = new THREE.PlaneGeometry(20, 20, 64, 64);
        
        // Create soil health heatmap
        const vertices = soilGeometry.attributes.position.array;
        const colors = [];
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Calculate soil health based on position (simulated data)
            const distance = Math.sqrt(x * x + z * z);
            const health = Math.max(0, Math.min(1, 1 - (distance / 15)));
            
            // Add some variation
            const variation = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.2;
            const finalHealth = Math.max(0, Math.min(1, health + variation));
            
            // Color based on health (red to green)
            if (finalHealth < 0.3) {
                // Poor health - red
                colors.push(0.8, 0.2, 0.2);
            } else if (finalHealth < 0.6) {
                // Medium health - yellow
                colors.push(0.8, 0.8, 0.2);
            } else {
                // Good health - green
                colors.push(0.2, 0.8, 0.2);
            }
            
            // Add slight elevation based on health
            vertices[i + 1] = finalHealth * 0.2;
        }
        
        // Update geometry
        soilGeometry.computeVertexNormals();
        soilGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Create soil material
        const soilMaterial = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create soil mesh
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.rotation.x = -Math.PI / 2;
        soil.receiveShadow = true;
        soilHealth.add(soil);
        
        // Add soil sample markers
        const markerGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16);
        
        // Create sample points in a grid
        for (let x = -8; x <= 8; x += 4) {
            for (let z = -8; z <= 8; z += 4) {
                // Calculate health at this position
                const distance = Math.sqrt(x * x + z * z);
                const health = Math.max(0, Math.min(1, 1 - (distance / 15)));
                const variation = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.2;
                const finalHealth = Math.max(0, Math.min(1, health + variation));
                
                // Color based on health
                let markerColor;
                if (finalHealth < 0.3) {
                    markerColor = 0xff4444; // Red
                } else if (finalHealth < 0.6) {
                    markerColor = 0xffff44; // Yellow
                } else {
                    markerColor = 0x44ff44; // Green
                }
                
                const markerMaterial = new THREE.MeshStandardMaterial({ color: markerColor });
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(x, 0.15, z);
                marker.castShadow = true;
                soilHealth.add(marker);
                
                // Add value label (simulated)
                const healthValue = Math.floor(finalHealth * 100);
                
                // Create text sprite for health value
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 64;
                canvas.height = 32;
                
                context.fillStyle = 'white';
                context.font = '24px Arial';
                context.fillText(healthValue, 10, 24);
                
                const texture = new THREE.CanvasTexture(canvas);
                const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(spriteMaterial);
                sprite.position.set(x, 0.5, z);
                sprite.scale.set(0.5, 0.25, 1);
                soilHealth.add(sprite);
            }
        }
        
        // Add legend
        createSoilHealthLegend();
    }
    
    // Create soil health legend
    function createSoilHealthLegend() {
        // Create legend background
        const legendGeometry = new THREE.PlaneGeometry(4, 1);
        const legendMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const legend = new THREE.Mesh(legendGeometry, legendMaterial);
        legend.position.set(7, 1, -8);
        legend.rotation.y = Math.PI / 4;
        soilHealth.add(legend);
        
        // Create color gradient
        const gradientGeometry = new THREE.PlaneGeometry(3.6, 0.3);
        const gradientCanvas = document.createElement('canvas');
        const context = gradientCanvas.getContext('2d');
        gradientCanvas.width = 180;
        gradientCanvas.height = 15;
        
        const gradient = context.createLinearGradient(0, 0, 180, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'green');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 180, 15);
        
        const gradientTexture = new THREE.CanvasTexture(gradientCanvas);
        const gradientMaterial = new THREE.MeshBasicMaterial({
            map: gradientTexture,
            side: THREE.DoubleSide
        });
        
        const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial);
        gradientMesh.position.set(7, 1, -8.05);
        gradientMesh.rotation.y = Math.PI / 4;
        soilHealth.add(gradientMesh);
        
        // Add text labels
        const createLabel = (text, x) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 64;
            canvas.height = 32;
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.fillText(text, 0, 20);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.position.set(x, 0.8, -8.1);
            sprite.scale.set(0.5, 0.25, 1);
            soilHealth.add(sprite);
        };
        
        createLabel('0%', 5.5);
        createLabel('50%', 7);
        createLabel('100%', 8.5);
    }
    
    // Show specific visualization
    function showVisualization(type) {
        // Hide all visualizations
        terrain.visible = false;
        crops.visible = false;
        irrigation.visible = false;
        soilHealth.visible = false;
        
        // Show selected visualization
        switch (type) {
            case 'terrain':
                terrain.visible = true;
                break;
            case 'crops':
                crops.visible = true;
                break;
            case 'irrigation':
                irrigation.visible = true;
                break;
            case 'soil':
                soilHealth.visible = true;
                break;
        }
        
        currentVisualization = type;
    }
    
    // Change visualization type
    function changeVisualization() {
        const type = visualizationType.value;
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        isLoading = true;
        
        // Simulate loading time
        setTimeout(() => {
            showVisualization(type);
            loadingOverlay.style.display = 'none';
            isLoading = false;
        }, 800);
    }
    
    // Update visualization based on time period
    function updateVisualization() {
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        isLoading = true;
        
        // Simulate data update
        setTimeout(() => {
            // In a real application, this would load different data based on the time period
            loadingOverlay.style.display = 'none';
            isLoading = false;
        }, 800);
    }
    
    // Update detail level
    function updateDetailLevel() {
        const level = parseInt(detailLevel.value);
        
        // In a real application, this would adjust the level of detail in the visualization
        // For this demo, we'll just adjust the camera position
        camera.position.z = 15 - level * 1.5;
    }
    
    // Set language preference
    function setLanguage(language) {
        currentLanguage = language;
        localStorage.setItem('language', language);
        
        if (language === 'malayalam') {
            // Update body class for language-specific styling
            document.body.classList.remove('english');
            
            malayalamBtn.classList.add('active');
            englishBtn.classList.remove('active');
        } else {
            // Update body class for language-specific styling
            document.body.classList.add('english');
            
            englishBtn.classList.add('active');
            malayalamBtn.classList.remove('active');
        }
        
        // Update username display
        displayUsername();
    }
    
    // Display logged in username
    function displayUsername() {
        const username = localStorage.getItem('username') || sessionStorage.getItem('username');
        if (username) {
            const headerTitle = document.querySelector('header h1');
            headerTitle.innerHTML = `
                <span class="malayalam-text">കർഷക സഹായി - 3D കൃഷിയിടം കാഴ്ച - സ്വാഗതം, ${username}</span>
                <span class="english-text">Farmer Support System - 3D Farm Visualization - Welcome, ${username}</span>
            `;
        }
    }
    
    // Handle logout
    function handleLogout() {
        // Clear storage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('username');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
});