// ============================================
// GLOBAL VARIABLES
// ============================================
let currentGame = 1; // 1 = Luvdisc, 2 = Garden, 3 = Cake

// Game 1: Luvdisc variables
let luvdiscImg, luvdiscChocImg, chocoBoxImg;
let luvdiscs = [];
let chocolatesCollected = 0;
const TOTAL_CHOCOLATES = 8;
const SPAWN_INTERVAL = 60;
let frameCounter = 0;

// Game 2: Garden variables
let potImg, sproutImg;
let growingRedImg, growingBlueImg;
let bloomRedImg, bloomBlueImg;
let waterPotImg, waterPotPouringImg;
let plants = [];
const GRID_SIZE = 5;
const BLUE_ROSE_COUNT = 8;
let wateringPlant = null;
let wateringProgress = 0;
const WATERING_TIME = 90;

// Game 3: Cake variables
let cakeImg, icingImg, strawberryImg;
let cakeCanvas; // Graphics buffer for drawing
let decorationMode = 'icing'; // 'icing' or 'strawberry'
let strawberries = [];
let prevMouseX, prevMouseY;
const CAKE_WIDTH = 600;
const CAKE_HEIGHT = 500;
const ICING_THICKNESS = 18; // 20% thicker than before (was 15)

// ============================================
// PRELOAD
// ============================================
function preload() {
    // Game 1 images
    luvdiscImg = loadImage('images/luvdisc.png');
    luvdiscChocImg = loadImage('images/luvdisc_choc.png');
    chocoBoxImg = loadImage('images/choco_box.png');
    
    // Game 3 images (loading these upfront since they're small)
    cakeImg = loadImage('images/cake.png');
    icingImg = loadImage('images/icing.png');
    strawberryImg = loadImage('images/strawberry.png');
}

// ============================================
// SETUP
// ============================================
function setup() {
    // Make canvas fill most of the window, leaving some space at top
    createCanvas(windowWidth, windowHeight - 50);
    imageMode(CENTER);
    initGame1();
}

// Resize canvas when window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 50);
}

// ============================================
// DRAW
// ============================================
function draw() {
    if (currentGame === 1) {
        drawGame1();
    } else if (currentGame === 2) {
        drawGame2();
    } else if (currentGame === 3) {
        drawGame3();
    }
}

// ============================================
// MOUSE EVENTS
// ============================================
function mousePressed() {
    if (currentGame === 1) {
        mousePressed1();
    } else if (currentGame === 2) {
        mousePressed2();
    } else if (currentGame === 3) {
        mousePressed3();
    }
}

function mouseReleased() {
    if (currentGame === 2) {
        mouseReleased2();
    } else if (currentGame === 3) {
        mouseReleased3();
    }
}

function mouseDragged() {
    if (currentGame === 3) {
        mouseDragged3();
    }
}

// ============================================
// GAME 1: LUVDISC CATCHING
// ============================================

function initGame1() {
    luvdiscs = [];
    chocolatesCollected = 0;
    frameCounter = 0;
}

function drawGame1() {
    background(135, 206, 235);
    
    frameCounter++;
    if (frameCounter >= SPAWN_INTERVAL) {
        spawnLuvdisc();
        frameCounter = 0;
    }
    
    for (let i = luvdiscs.length - 1; i >= 0; i--) {
        luvdiscs[i].update();
        luvdiscs[i].display();
        
        if (luvdiscs[i].isOffScreen()) {
            luvdiscs.splice(i, 1);
        }
    }
    
    displayCounter();
    
    if (chocolatesCollected >= TOTAL_CHOCOLATES) {
        displayGame1Complete();
    }
}

function mousePressed1() {
    if (chocolatesCollected >= TOTAL_CHOCOLATES) {
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > height/2 + 40 && mouseY < height/2 + 90) {
            currentGame = 2;
            initGame2();
            return;
        }
    }
    
    for (let luvdisc of luvdiscs) {
        if (luvdisc.hasChocolate && luvdisc.isClicked(mouseX, mouseY)) {
            luvdisc.hasChocolate = false;
            chocolatesCollected++;
            break;
        }
    }
}

function spawnLuvdisc() {
    let hasChocolate = random() < 0.2 && chocolatesCollected < TOTAL_CHOCOLATES;
    luvdiscs.push(new Luvdisc(hasChocolate));
}

function displayCounter() {
    push();
    fill(255, 255, 255, 200);
    stroke(255, 105, 180);
    strokeWeight(3);
    rect(width - 150, height - 60, 140, 50, 10);
    
    fill(255, 105, 180);
    noStroke();
    textSize(28);
    textAlign(LEFT, CENTER);
    textFont('Comic Sans MS');
    text(`${chocolatesCollected}/${TOTAL_CHOCOLATES}`, width - 140, height - 35);
    
    image(chocoBoxImg, width - 40, height - 35, 30, 30);
    pop();
}

function displayGame1Complete() {
    push();
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("All chocolates collected! 💖", width/2, height/2 - 40);
    
    fill(255, 105, 180);
    stroke(255);
    strokeWeight(3);
    rect(width/2 - 100, height/2 + 40, 200, 50, 10);
    
    fill(255);
    noStroke();
    textSize(24);
    text("Next Game →", width/2, height/2 + 65);
    pop();
}

class Luvdisc {
    constructor(hasChocolate) {
        this.hasChocolate = hasChocolate;
        this.swimPhase = random(TWO_PI);
        this.swimSpeed = 0.15;
        
        let edge = floor(random(4));
        if (edge === 0) {
            this.x = random(width);
            this.y = -50;
            this.angle = random(PI/4, 3*PI/4);
        } else if (edge === 1) {
            this.x = width + 50;
            this.y = random(height);
            this.angle = random(3*PI/4, 5*PI/4);
        } else if (edge === 2) {
            this.x = random(width);
            this.y = height + 50;
            this.angle = random(5*PI/4, 7*PI/4);
        } else {
            this.x = -50;
            this.y = random(height);
            this.angle = random(-PI/4, PI/4);
        }
        
        this.speed = random(1.5, 3);
        this.size = random(40, 60);
    }
    
    update() {
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;
        this.swimPhase += this.swimSpeed;
    }
    
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        
        let squish = 1 + sin(this.swimPhase) * 0.05;
        scale(1, squish);
        
        let img = this.hasChocolate ? luvdiscChocImg : luvdiscImg;
        image(img, 0, 0, this.size, this.size);
        
        pop();
    }
    
    isClicked(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        return d < this.size / 2;
    }
    
    isOffScreen() {
        return this.x < -100 || this.x > width + 100 || 
               this.y < -100 || this.y > height + 100;
    }
}

// ============================================
// GAME 2: GARDEN
// ============================================

function initGame2() {
    // Load images if not already loaded
    if (!potImg) {
        potImg = loadImage('images/pot.png');
        sproutImg = loadImage('images/sprout.png');
        growingRedImg = loadImage('images/growing_red.png');
        growingBlueImg = loadImage('images/growing_blue.png');
        bloomRedImg = loadImage('images/bloom_red.png');
        bloomBlueImg = loadImage('images/bloom_blue.png');
        waterPotImg = loadImage('images/water_pot.png');
        waterPotPouringImg = loadImage('images/water_pot_pouring.png');
    }
    
    plants = [];
    
    // Dynamic spacing based on window size
    let spacing = min(width, height) / 7;
    let startX = (width - (GRID_SIZE - 1) * spacing) / 2;
    let startY = (height - (GRID_SIZE - 1) * spacing) / 2;
    
    let blueIndices = [];
    while (blueIndices.length < BLUE_ROSE_COUNT) {
        let idx = floor(random(GRID_SIZE * GRID_SIZE));
        if (!blueIndices.includes(idx)) {
            blueIndices.push(idx);
        }
    }
    
    let idx = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            let x = startX + col * spacing;
            let y = startY + row * spacing;
            let isBlue = blueIndices.includes(idx);
            plants.push(new Plant(x, y, isBlue));
            idx++;
        }
    }
    
    wateringPlant = null;
    wateringProgress = 0;
}

function drawGame2() {
    background(245, 222, 179);
    
    for (let plant of plants) {
        plant.display();
    }
    
    if (mouseIsPressed) {
        let hoveredPlant = null;
        for (let plant of plants) {
            if (plant.isHovered(mouseX, mouseY) && plant.stage < 3) {
                hoveredPlant = plant;
                break;
            }
        }
        
        if (hoveredPlant) {
            if (wateringPlant === hoveredPlant) {
                wateringProgress++;
                if (wateringProgress >= WATERING_TIME) {
                    hoveredPlant.grow();
                    wateringProgress = 0;
                }
            } else {
                wateringPlant = hoveredPlant;
                wateringProgress = 0;
            }
            
            drawWateringProgress(hoveredPlant.x, hoveredPlant.y);
        } else {
            wateringPlant = null;
            wateringProgress = 0;
        }
    } else {
        wateringPlant = null;
        wateringProgress = 0;
    }
    
    // Check if all bloomed and all blue roses collected
    let allBloomed = plants.every(p => p.stage === 3);
    let allBlueCollected = plants.filter(p => p.isBlue).every(p => p.faded && p.alpha <= 0);
    
    if (allBloomed && !allBlueCollected) {
        cursor(ARROW);
    } else {
        noCursor();
        let cursorImg = mouseIsPressed ? waterPotPouringImg : waterPotImg;
        image(cursorImg, mouseX, mouseY, 60, 60);
    }
    
    if (allBloomed && allBlueCollected) {
        displayGame2Complete();
    }
}

function mousePressed2() {
    // Check for next game button
    let allBloomed = plants.every(p => p.stage === 3);
    let allBlueCollected = plants.filter(p => p.isBlue).every(p => p.faded && p.alpha <= 0);
    
    if (allBloomed && allBlueCollected) {
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > height/2 + 40 && mouseY < height/2 + 90) {
            currentGame = 3;
            initGame3();
            return;
        }
    }
    
    // Check if clicking on bloomed blue roses
    if (allBloomed) {
        for (let plant of plants) {
            if (plant.isBlue && !plant.faded && plant.isHovered(mouseX, mouseY)) {
                plant.startFade();
            }
        }
    }
}

function mouseReleased2() {
    wateringPlant = null;
    wateringProgress = 0;
}

function drawWateringProgress(x, y) {
    push();
    let barWidth = 80;
    let barHeight = 10;
    
    fill(200);
    noStroke();
    rect(x - barWidth/2, y - 60, barWidth, barHeight, 5);
    
    fill(100, 150, 255);
    let progress = wateringProgress / WATERING_TIME;
    rect(x - barWidth/2, y - 60, barWidth * progress, barHeight, 5);
    
    pop();
}

function displayGame2Complete() {
    push();
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("You've collected the red roses! 🌹", width/2, height/2 - 40);
    
    fill(255, 105, 180);
    stroke(255);
    strokeWeight(3);
    rect(width/2 - 100, height/2 + 40, 200, 50, 10);
    
    fill(255);
    noStroke();
    textSize(24);
    text("Next Game →", width/2, height/2 + 65);
    pop();
}

class Plant {
    constructor(x, y, isBlue) {
        this.x = x;
        this.y = y;
        this.isBlue = isBlue;
        this.stage = 0;
        this.size = 80;
        this.faded = false;
        this.alpha = 255;
    }
    
    grow() {
        if (this.stage < 3) {
            this.stage++;
        }
    }
    
    startFade() {
        this.faded = true;
    }
    
    display() {
        push();
        
        if (this.faded && this.alpha > 0) {
            this.alpha -= 5;
        }
        
        tint(255, this.alpha);
        
        let img;
        if (this.stage === 0) {
            img = potImg;
        } else if (this.stage === 1) {
            img = sproutImg;
        } else if (this.stage === 2) {
            img = this.isBlue ? growingBlueImg : growingRedImg;
        } else if (this.stage === 3) {
            img = this.isBlue ? bloomBlueImg : bloomRedImg;
        }
        
        image(img, this.x, this.y, this.size, this.size);
        
        pop();
    }
    
    isHovered(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        return d < this.size / 2;
    }
}

// ============================================
// GAME 3: CAKE DECORATING
// ============================================

function initGame3() {
    // Create graphics buffer for cake decorations (wider than tall)
    cakeCanvas = createGraphics(CAKE_WIDTH, CAKE_HEIGHT);
    cakeCanvas.clear();
    
    decorationMode = 'icing';
    strawberries = [];
    prevMouseX = -1;
    prevMouseY = -1;
}

function drawGame3() {
    background(255, 240, 245); // Light pink
    
    push();
    // Center the cake
    let cakeX = width / 2;
    let cakeY = height / 2;
    
    // Draw cake base (wider aspect ratio)
    imageMode(CENTER);
    image(cakeImg, cakeX, cakeY, CAKE_WIDTH, CAKE_HEIGHT);
    
    // Draw decorations on top
    imageMode(CORNER);
    image(cakeCanvas, cakeX - CAKE_WIDTH/2, cakeY - CAKE_HEIGHT/2);
    
    // Draw strawberries (4x bigger than before - was 30, now 120)
    imageMode(CENTER);
    for (let strawberry of strawberries) {
        image(strawberryImg, strawberry.x, strawberry.y, 120, 120);
    }
    
    pop();
    
    // Draw UI buttons
    drawUI();
    
    // Custom cursor for icing mode
    if (decorationMode === 'icing' && isMouseOnCake()) {
        noCursor();
        image(icingImg, mouseX, mouseY, 40, 40);
    } else {
        cursor(ARROW);
    }
}

function drawUI() {
    push();
    
    let buttonY = height - 70;
    let icingButtonX = width - 140;
    let strawberryButtonX = width - 70;
    
    // Icing button
    if (decorationMode === 'icing') {
        fill(255, 105, 180);
        stroke(255, 50, 150);
    } else {
        fill(255);
        stroke(200);
    }
    strokeWeight(3);
    rect(icingButtonX - 25, buttonY - 25, 50, 50, 5);
    image(icingImg, icingButtonX, buttonY, 35, 35);
    
    // Strawberry button
    if (decorationMode === 'strawberry') {
        fill(255, 105, 180);
        stroke(255, 50, 150);
    } else {
        fill(255);
        stroke(200);
    }
    rect(strawberryButtonX - 25, buttonY - 25, 50, 50, 5);
    image(strawberryImg, strawberryButtonX, buttonY, 35, 35);
    
    pop();
}

function mousePressed3() {
    let buttonY = height - 70;
    let icingButtonX = width - 140;
    let strawberryButtonX = width - 70;
    
    // Check button clicks
    if (dist(mouseX, mouseY, icingButtonX, buttonY) < 25) {
        decorationMode = 'icing';
        return;
    }
    
    if (dist(mouseX, mouseY, strawberryButtonX, buttonY) < 25) {
        decorationMode = 'strawberry';
        return;
    }
    
    // Strawberry placement
    if (decorationMode === 'strawberry' && isMouseOnCake()) {
        strawberries.push({x: mouseX, y: mouseY});
    }
    
    // Set previous position for icing
    if (decorationMode === 'icing') {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
    }
}

function mouseDragged3() {
    if (decorationMode === 'icing' && isMouseOnCake()) {
        // Convert screen coordinates to canvas coordinates
        let cakeX = width / 2;
        let cakeY = height / 2;
        
        let canvasX = mouseX - (cakeX - CAKE_WIDTH/2);
        let canvasY = mouseY - (cakeY - CAKE_HEIGHT/2);
        let prevCanvasX = prevMouseX - (cakeX - CAKE_WIDTH/2);
        let prevCanvasY = prevMouseY - (cakeY - CAKE_HEIGHT/2);
        
        if (prevMouseX !== -1 && prevMouseY !== -1) {
            cakeCanvas.stroke(255);
            cakeCanvas.strokeWeight(ICING_THICKNESS);
            cakeCanvas.strokeCap(ROUND);
            cakeCanvas.line(prevCanvasX, prevCanvasY, canvasX, canvasY);
        }
        
        prevMouseX = mouseX;
        prevMouseY = mouseY;
    }
}

function mouseReleased3() {
    prevMouseX = -1;
    prevMouseY = -1;
}

function isMouseOnCake() {
    let cakeX = width / 2;
    let cakeY = height / 2;
    
    // Check if mouse is within the rectangular cake bounds
    return mouseX > cakeX - CAKE_WIDTH/2 && 
           mouseX < cakeX + CAKE_WIDTH/2 && 
           mouseY > cakeY - CAKE_HEIGHT/2 && 
           mouseY < cakeY + CAKE_HEIGHT/2;
}