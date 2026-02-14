let luvdiscImg, luvdiscChocImg, chocoBoxImg;
let luvdiscs = [];
let chocolatesCollected = 0;
const TOTAL_CHOCOLATES = 8;
const SPAWN_INTERVAL = 60; // frames between spawns
let frameCounter = 0;

function preload() {
    luvdiscImg = loadImage('images/luvdisc.png', 
        () => console.log('✓ Luvdisc loaded'),
        () => console.log('✗ Luvdisc FAILED')
    );
    luvdiscChocImg = loadImage('images/luvdisc_choc.png',
        () => console.log('✓ Luvdisc choc loaded'),
        () => console.log('✗ Luvdisc choc FAILED')
    );
    chocoBoxImg = loadImage('images/choco_box.png',
        () => console.log('✓ Choco box loaded'),
        () => console.log('✗ Choco box FAILED')
    );
}

function setup() {
    createCanvas(800, 600);
    imageMode(CENTER);
}

function draw() {
    // Background
    background(135, 206, 235); // Sky blue water
    
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
        
        // Remove if off screen
        if (luvdiscs[i].isOffScreen()) {
            luvdiscs.splice(i, 1);
        }
    }
    
    // Display chocolate counter
    displayCounter();
    
    // Check if game is complete
    if (chocolatesCollected >= TOTAL_CHOCOLATES) {
        displayWinMessage();
    }
}

function mousePressed() {
    // Check if any chocolate luvdisc was clicked
    for (let luvdisc of luvdiscs) {
        if (luvdisc.hasChocolate && luvdisc.isClicked(mouseX, mouseY)) {
            luvdisc.hasChocolate = false;
            chocolatesCollected++;
            break; // Only one at a time
        }
    }
}

function spawnLuvdisc() {
    // Randomly decide if this one has chocolate (20% chance)
    let hasChocolate = random() < 0.2 && chocolatesCollected < TOTAL_CHOCOLATES;
    luvdiscs.push(new Luvdisc(hasChocolate));
}

function displayCounter() {
    push();
    
    // Counter background
    fill(255, 255, 255, 200);
    stroke(255, 105, 180);
    strokeWeight(3);
    rect(width - 150, height - 60, 140, 50, 10);
    
    // Counter text
    fill(255, 105, 180);
    noStroke();
    textSize(28);
    textAlign(LEFT, CENTER);
    textFont('Comic Sans MS');
    text(`${chocolatesCollected}/${TOTAL_CHOCOLATES}`, width - 140, height - 35);
    
    // Chocolate box icon
    image(chocoBoxImg, width - 40, height - 35, 30, 30);
    
    pop();
}

function displayWinMessage() {
    push();
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("All chocolates collected! 💖", width/2, height/2);
    textSize(24);
    text("Click to restart", width/2, height/2 + 50);
    pop();
    
    if (mouseIsPressed) {
        chocolatesCollected = 0;
        luvdiscs = [];
    }
}

class Luvdisc {
    constructor(hasChocolate) {
        this.hasChocolate = hasChocolate;
        this.swimPhase = random(TWO_PI);
        this.swimSpeed = 0.15;
        
        // Random spawn position (from edges)
        let edge = floor(random(4));
        if (edge === 0) { // Top
            this.x = random(width);
            this.y = -50;
            this.angle = random(PI/4, 3*PI/4); // Swim downward-ish
        } else if (edge === 1) { // Right
            this.x = width + 50;
            this.y = random(height);
            this.angle = random(3*PI/4, 5*PI/4); // Swim leftward-ish
        } else if (edge === 2) { // Bottom
            this.x = random(width);
            this.y = height + 50;
            this.angle = random(5*PI/4, 7*PI/4); // Swim upward-ish
        } else { // Left
            this.x = -50;
            this.y = random(height);
            this.angle = random(-PI/4, PI/4); // Swim rightward-ish
        }
        
        this.speed = random(1.5, 3);
        this.size = random(40, 60);
    }
    
    update() {
        // Move in straight line
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;
        
        // Update swim animation
        this.swimPhase += this.swimSpeed;
    }
    
    display() {
        push();
        translate(this.x, this.y);
        
        // Rotate to face direction of movement
        rotate(this.angle);
        
        // Swimming animation (slight vertical squish)
        let squish = 1 + sin(this.swimPhase) * 0.05;
        scale(1, squish);
        
        // Draw appropriate sprite
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