// ============================================
// GLOBAL VARIABLES
// ============================================
let currentGame = 1; // 1 = Luvdisc, 2 = Garden

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
const GRID_SIZE = 3;
const BLUE_ROSE_COUNT = 4;
let wateringPlant = null;
let wateringProgress = 0;
const WATERING_TIME = 45; // frames to water (1.5 seconds at 60fps)

// ============================================
// PRELOAD
// ============================================
function preload() {
    // Game 1 images
    luvdiscImg = loadImage('images/luvdisc.png');
    luvdiscChocImg = loadImage('images/luvdisc_choc.png');
    chocoBoxImg = loadImage('images/choco_box.png');
    
    // Game 2 images
    potImg = loadImage('images/pot.png');
    sproutImg = loadImage('images/sprout.png');
    growingRedImg = loadImage('images/growing_red.png');
    growingBlueImg = loadImage('images/growing_blue.png');
    bloomRedImg = loadImage('images/bloom_red.png');
    bloomBlueImg = loadImage('images/bloom_blue.png');
    waterPotImg = loadImage('images/water_pot.png');
    waterPotPouringImg = loadImage('images/water_pot_pouring.png');
}

// ============================================
// SETUP
// ============================================
function setup() {
    createCanvas(800, 600);
    imageMode(CENTER);
    initGame1();
}

// ============================================
// DRAW
// ============================================
function draw() {
    if (currentGame === 1) {
        drawGame1();
    } else if (currentGame === 2) {
        drawGame2();
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
    }
}

function mouseReleased() {
    if (currentGame === 2) {
        mouseReleased2();
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
    // Background
    background(135, 206, 235);
    
    // Spawn new luvdiscs
    frameCounter++;
    if (frameCounter >= SPAWN_INTERVAL) {
        spawnLuvdisc();
        frameCounter = 0;
    }
    
    // Update and display luvdiscs
    for (let i = luvdiscs.length - 1; i >= 0; i--) {
        luvdiscs[i].update();
        luvdiscs[i].display();
        
        if (luvdiscs[i].isOffScreen()) {
            luvdiscs.splice(i, 1);
        }
    }
    
    // Display chocolate counter
    displayCounter();
    
    // Check if game is complete
    if (chocolatesCollected >= TOTAL_CHOCOLATES) {
        displayGame1Complete();
    }
}

function mousePressed1() {
    // Check if "Next Game" button was clicked
    if (chocolatesCollected >= TOTAL_CHOCOLATES) {
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > height/2 + 40 && mouseY < height/2 + 90) {
            currentGame = 2;
            initGame2();
            return;
        }
    }
    
    // Check if any chocolate luvdisc was clicked
    for (let luvdisc of luvdiscs) {
        if (luvdisc.hasChocolate && luvdisc.isClicked(mouseX, mouseY)) {
            luvdisc.hasChocolate = false;
            chocolatesCollected++;
            break;
        }
    }
}

function spawnLuvdisc() {
    let hasChocolate = random() < 1.0 && chocolatesCollected < TOTAL_CHOCOLATES;
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
    
    // Next Game button
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
    plants = [];
    
    // Calculate grid spacing
    let startX = (width - (GRID_SIZE - 1) * 100) / 2;
    let startY = (height - (GRID_SIZE - 1) * 100) / 2;
    
    // Create array of indices for blue roses
    let blueIndices = [];
    while (blueIndices.length < BLUE_ROSE_COUNT) {
        let idx = floor(random(GRID_SIZE * GRID_SIZE));
        if (!blueIndices.includes(idx)) {
            blueIndices.push(idx);
        }
    }
    
    // Create plants in grid
    let idx = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            let x = startX + col * 100;
            let y = startY + row * 100;
            let isBlue = blueIndices.includes(idx);
            plants.push(new Plant(x, y, isBlue));
            idx++;
        }
    }
    
    wateringPlant = null;
    wateringProgress = 0;
}

function drawGame2() {
    // Background
    background(245, 222, 179); // Wheat color
    
    // Draw plants
    for (let plant of plants) {
        plant.display();
    }
    
    // Handle watering
    if (mouseIsPressed) {
        // Check if hovering over a plant
        let hoveredPlant = null;
        for (let plant of plants) {
            if (plant.isHovered(mouseX, mouseY) && plant.stage < 3) {
                hoveredPlant = plant;
                break;
            }
        }
        
        if (hoveredPlant) {
            if (wateringPlant === hoveredPlant) {
                // Continue watering same plant
                wateringProgress++;
                if (wateringProgress >= WATERING_TIME) {
                    hoveredPlant.grow();
                    wateringProgress = 0;
                }
            } else {
                // Started watering new plant
                wateringPlant = hoveredPlant;
                wateringProgress = 0;
            }
            
            // Draw progress bar
            drawWateringProgress(hoveredPlant.x, hoveredPlant.y);
        } else {
            wateringPlant = null;
            wateringProgress = 0;
        }
    } else {
        wateringPlant = null;
        wateringProgress = 0;
    }
    
    // Draw custom cursor (watering can)
    noCursor();
    let cursorImg = mouseIsPressed ? waterPotPouringImg : waterPotImg;
    image(cursorImg, mouseX, mouseY, 60, 60);
    
    // Check if all bloomed
    let allBloomed = plants.every(p => p.stage === 3);
    if (allBloomed) {
        cursor(ARROW); // Show normal cursor for clicking
    }
}

function mousePressed2() {
    // Check if clicking on bloomed blue roses
    let allBloomed = plants.every(p => p.stage === 3);
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
    
    // Background bar
    fill(200);
    noStroke();
    rect(x - barWidth/2, y - 60, barWidth, barHeight, 5);
    
    // Progress bar
    fill(100, 150, 255);
    let progress = wateringProgress / WATERING_TIME;
    rect(x - barWidth/2, y - 60, barWidth * progress, barHeight, 5);
    
    pop();
}

class Plant {
    constructor(x, y, isBlue) {
        this.x = x;
        this.y = y;
        this.isBlue = isBlue;
        this.stage = 0; // 0=pot, 1=sprout, 2=growing, 3=bloom
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
        
        // Handle fading
        if (this.faded && this.alpha > 0) {
            this.alpha -= 5;
        }
        
        tint(255, this.alpha);
        
        // Draw appropriate sprite based on stage
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