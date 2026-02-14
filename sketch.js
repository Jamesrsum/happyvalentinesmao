// ============================================
// GLOBAL VARIABLES
// ============================================
let currentGame = 0; // 0 = dialogue, 1 = Luvdisc, 2 = Garden, 3 = Cake

// Dialogue system
let nurseImg;
let dialogueActive = false;
let dialogueIndex = 0;
let currentDialogueSet = [];
let dialogueSets = {
    intro: [
        "Hey there, Mao! It's been a while. How are you doing? I hope 16's been treating you well!",
        "I'd love to continue catching up, but the entire town is busy preparing for Valentine's Day!",
        "Are you busy right now? No? Why don't you help us prepare for the occasion?"
    ],
    game1_intro: [
        "James told the Luvdiscs to go get the chocolates. A weird decision given that they're...well...fish.",
        "Anyways, I've been told they have the chocolates but have no idea where to take them.",
        "Why don't you help them out by collecting chocolates from Luvdiscs that have them? We need 8 boxes!"
    ],
    game1_complete: [
        "Great job! I'm sure these Luvdiscs luv you :D"
    ],
    game2_intro: [
        "What sorta Valentine's Day would it be without some roses? Roselia is helping out with this one.",
        "She seems to need some help watering her plants why don't you help her out!"
    ],
    game2_mid: [
        "Aww these are so pretty.",
        "What's that, Roselia? It's Valentine's Day so you want to only use the red roses? That's fair.",
        "Mao, why don't you help her get rid of the blue roses?"
    ],
    game2_complete: [
        "Yay thanks! We have one more thing to do..."
    ],
    game3_intro: [
        "Alcremie wants us to help her design a cake!",
        "We have icing and strawberries. Design away!"
    ]
};

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
const GRID_SIZE = 3; // Changed to 3x3
const BLUE_ROSE_COUNT = 4; // Changed to 4
let wateringPlant = null;
let wateringProgress = 0;
const WATERING_TIME = 35; // Changed to 35
let game2Phase = 'watering'; // 'watering' or 'collecting'

// Game 3: Cake variables
let cakeImg, icingImg, strawberryImg;
let cakeCanvas;
let decorationMode = 'icing';
let strawberries = [];
let prevMouseX, prevMouseY;
const CAKE_WIDTH = 1440; // 2x bigger (600) then 20% wider
const CAKE_HEIGHT = 1000; // 2x bigger
const BASE_ICING_THICKNESS = 18;
let icingThickness = BASE_ICING_THICKNESS;
let icingSliderValue = 1.0; // Multiplier for icing thickness

// ============================================
// PRELOAD
// ============================================
function preload() {
    // Dialogue
    nurseImg = loadImage('images/nurse.png');
    
    // Game 1 images
    luvdiscImg = loadImage('images/luvdisc.png');
    luvdiscChocImg = loadImage('images/luvdisc_choc.png');
    chocoBoxImg = loadImage('images/choco_box.png');
    
    // Game 3 images
    cakeImg = loadImage('images/cake.png');
    icingImg = loadImage('images/icing.png');
    strawberryImg = loadImage('images/strawberry.png');
}

// ============================================
// SETUP
// ============================================
function setup() {
    createCanvas(windowWidth, windowHeight - 50);
    imageMode(CENTER);
    
    // Start with intro dialogue
    startDialogue('intro');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 50);
}

// ============================================
// DRAW
// ============================================
function draw() {
    if (dialogueActive) {
        drawDialogue();
    } else if (currentGame === 1) {
        drawGame1();
    } else if (currentGame === 2) {
        drawGame2();
    } else if (currentGame === 3) {
        drawGame3();
    } else {
        // Pink blank screen
        background(255, 192, 203);
    }
}

// ============================================
// DIALOGUE SYSTEM
// ============================================

function startDialogue(setName) {
    currentDialogueSet = dialogueSets[setName];
    dialogueIndex = 0;
    dialogueActive = true;
}

function drawDialogue() {
    // Pink background
    background(255, 192, 203);
    
    // Draw Nurse Joy sprite (bottom left)
    push();
    imageMode(CORNER);
    let nurseSize = min(width, height) * 0.4;
    image(nurseImg, 20, height - nurseSize - 20, nurseSize, nurseSize);
    pop();
    
    // Draw dialogue box (bottom, full width)
    push();
    fill(255);
    stroke(0);
    strokeWeight(4);
    let boxHeight = 150;
    rect(0, height - boxHeight, width, boxHeight);
    
    // Draw text
    fill(0);
    noStroke();
    textSize(24);
    textAlign(LEFT, TOP);
    textFont('Arial');
    
    // Word wrap
    let margin = 30;
    let textWidth = width - margin * 2;
    let words = currentDialogueSet[dialogueIndex].split(' ');
    let line = '';
    let y = height - boxHeight + margin;
    
    for (let word of words) {
        let testLine = line + word + ' ';
        if (textWidth < textWidth && textWidth(testLine) > textWidth - margin * 2) {
            text(line, margin, y);
            line = word + ' ';
            y += 30;
        } else {
            line = testLine;
        }
    }
    text(line, margin, y);
    
    // Click prompt
    fill(100);
    textSize(16);
    textAlign(RIGHT, BOTTOM);
    text("Click to continue...", width - margin, height - margin);
    
    pop();
}

function advanceDialogue() {
    dialogueIndex++;
    
    if (dialogueIndex >= currentDialogueSet.length) {
        // Dialogue set complete
        dialogueActive = false;
        handleDialogueComplete();
    }
}

function handleDialogueComplete() {
    // Determine what happens after dialogue ends
    if (currentDialogueSet === dialogueSets.intro) {
        startDialogue('game1_intro');
    } else if (currentDialogueSet === dialogueSets.game1_intro) {
        currentGame = 1;
        initGame1();
    } else if (currentDialogueSet === dialogueSets.game1_complete) {
        currentGame = 2;
        game2Phase = 'watering';
        initGame2();
        startDialogue('game2_intro');
    } else if (currentDialogueSet === dialogueSets.game2_intro) {
        // Just hide dialogue, user can water
    } else if (currentDialogueSet === dialogueSets.game2_mid) {
        // Just hide dialogue, user can collect blue roses
    } else if (currentDialogueSet === dialogueSets.game2_complete) {
        currentGame = 3;
        initGame3();
        startDialogue('game3_intro');
    } else if (currentDialogueSet === dialogueSets.game3_intro) {
        // Just hide dialogue, user can decorate
    }
}

// ============================================
// MOUSE EVENTS
// ============================================
function mousePressed() {
    if (dialogueActive) {
        advanceDialogue();
        return;
    }
    
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
        // Trigger dialogue
        startDialogue('game1_complete');
    }
}

function mousePressed1() {
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
    
    let spacing = min(width, height) / 5;
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
    
    let allBloomed = plants.every(p => p.stage === 3);
    
    // Check if we need to trigger mid-game dialogue
    if (allBloomed && game2Phase === 'watering') {
        game2Phase = 'collecting';
        startDialogue('game2_mid');
        return;
    }
    
    if (mouseIsPressed && game2Phase === 'watering') {
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
    
    let allBlueCollected = plants.filter(p => p.isBlue).every(p => p.faded && p.alpha <= 0);
    
    if (allBloomed && game2Phase === 'collecting' && !allBlueCollected) {
        cursor(ARROW);
    } else if (!allBloomed) {
        noCursor();
        let cursorImg = mouseIsPressed ? waterPotPouringImg : waterPotImg;
        image(cursorImg, mouseX, mouseY, 60, 60);
    }
    
    if (allBloomed && allBlueCollected) {
        startDialogue('game2_complete');
    }
}

function mousePressed2() {
    let allBloomed = plants.every(p => p.stage === 3);
    
    if (allBloomed && game2Phase === 'collecting') {
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
    cakeCanvas = createGraphics(CAKE_WIDTH, CAKE_HEIGHT);
    cakeCanvas.clear();
    
    decorationMode = 'icing';
    strawberries = [];
    prevMouseX = -1;
    prevMouseY = -1;
    icingSliderValue = 1.0;
    icingThickness = BASE_ICING_THICKNESS;
}

function drawGame3() {
    background(255, 240, 245);
    
    push();
    let cakeX = width / 2;
    let cakeY = height / 2 - 30;
    
    imageMode(CENTER);
    image(cakeImg, cakeX, cakeY, CAKE_WIDTH, CAKE_HEIGHT);
    
    imageMode(CORNER);
    image(cakeCanvas, cakeX - CAKE_WIDTH/2, cakeY - CAKE_HEIGHT/2);
    
    // Strawberries 1.8x bigger (was 120, now 216)
    imageMode(CENTER);
    for (let strawberry of strawberries) {
        image(strawberryImg, strawberry.x, strawberry.y, 216, 216);
    }
    
    pop();
    
    drawUI();
    
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
    let icingButtonX = width - 240;
    let strawberryButtonX = width - 170;
    let resetButtonX = width - 100;
    let doneButtonX = width - 30;
    
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
    
    // Reset button
    fill(255);
    stroke(200);
    rect(resetButtonX - 25, buttonY - 25, 50, 50, 5);
    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text("RESET", resetButtonX, buttonY);
    
    // Done button
    fill(100, 200, 100);
    stroke(50, 150, 50);
    strokeWeight(3);
    rect(doneButtonX - 25, buttonY - 25, 50, 50, 5);
    fill(255);
    noStroke();
    textSize(14);
    text("DONE", doneButtonX, buttonY);
    
    // Icing thickness slider (only show in icing mode)
    if (decorationMode === 'icing') {
        fill(255);
        stroke(200);
        strokeWeight(2);
        let sliderX = 50;
        let sliderY = height - 70;
        let sliderW = 150;
        
        // Slider background
        rect(sliderX, sliderY - 3, sliderW, 6, 3);
        
        // Slider handle
        fill(255, 105, 180);
        stroke(255, 50, 150);
        let handleX = sliderX + icingSliderValue * sliderW;
        ellipse(handleX, sliderY, 20, 20);
        
        // Label
        fill(0);
        noStroke();
        textSize(14);
        textAlign(LEFT, BOTTOM);
        text("Icing Thickness", sliderX, sliderY - 15);
    }
    
    pop();
}

function mousePressed3() {
    let buttonY = height - 70;
    let icingButtonX = width - 240;
    let strawberryButtonX = width - 170;
    let resetButtonX = width - 100;
    let doneButtonX = width - 30;
    
    // Check icing slider
    if (decorationMode === 'icing') {
        let sliderX = 50;
        let sliderY = height - 70;
        let sliderW = 150;
        
        if (mouseY > sliderY - 15 && mouseY < sliderY + 15 &&
            mouseX > sliderX && mouseX < sliderX + sliderW) {
            updateIcingSlider();
            return;
        }
    }
    
    // Check button clicks
    if (dist(mouseX, mouseY, icingButtonX, buttonY) < 25) {
        decorationMode = 'icing';
        return;
    }
    
    if (dist(mouseX, mouseY, strawberryButtonX, buttonY) < 25) {
        decorationMode = 'strawberry';
        return;
    }
    
    if (dist(mouseX, mouseY, resetButtonX, buttonY) < 25) {
        resetCake();
        return;
    }
    
    if (dist(mouseX, mouseY, doneButtonX, buttonY) < 25) {
        alert("Beautiful cake, Mao! Happy Valentine's Day! 💖");
        return;
    }
    
    // Strawberry placement
    if (decorationMode === 'strawberry' && isMouseOnCake()) {
        strawberries.push({x: mouseX, y: mouseY});
    }
    
    if (decorationMode === 'icing') {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
    }
}

function mouseDragged3() {
    // Update slider if dragging it
    if (decorationMode === 'icing') {
        let sliderX = 50;
        let sliderY = height - 70;
        let sliderW = 150;
        
        if (mouseY > sliderY - 30 && mouseY < sliderY + 30 &&
            mouseX > sliderX - 10 && mouseX < sliderX + sliderW + 10) {
            updateIcingSlider();
        }
    }
    
    if (decorationMode === 'icing' && isMouseOnCake()) {
        let cakeX = width / 2;
        let cakeY = height / 2 - 30;
        
        let canvasX = mouseX - (cakeX - CAKE_WIDTH/2);
        let canvasY = mouseY - (cakeY - CAKE_HEIGHT/2);
        let prevCanvasX = prevMouseX - (cakeX - CAKE_WIDTH/2);
        let prevCanvasY = prevMouseY - (cakeY - CAKE_HEIGHT/2);
        
        if (prevMouseX !== -1 && prevMouseY !== -1) {
            cakeCanvas.stroke(255);
            cakeCanvas.strokeWeight(icingThickness);
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

function updateIcingSlider() {
    let sliderX = 50;
    let sliderW = 150;
    icingSliderValue = constrain((mouseX - sliderX) / sliderW, 0, 1);
    // Map to 0.5x to 3x thickness
    icingThickness = BASE_ICING_THICKNESS * (0.5 + icingSliderValue * 2.5);
}

function resetCake() {
    cakeCanvas.clear();
    strawberries = [];
}

function isMouseOnCake() {
    let cakeX = width / 2;
    let cakeY = height / 2 - 30;
    
    return mouseX > cakeX - CAKE_WIDTH/2 && 
           mouseX < cakeX + CAKE_WIDTH/2 && 
           mouseY > cakeY - CAKE_HEIGHT/2 && 
           mouseY < cakeY + CAKE_HEIGHT/2;
}