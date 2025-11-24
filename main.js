// CANVAS STUFF //
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
window.addEventListener("resize", resizeCanvas);

// CONSTANTS //
const damageNumbers = [];
const criticalHitPurcentage = 0.6
const kbmult = 2
const healthCap = 250
const velocityDamageConst = 10
let camera = { x: 100, y: 100, zoom: 1 };
var entities = []
var showHealthBar = true

const keys = {}
window.addEventListener("keydown", e => {
    keys[e.key] = true;
})  
  window.addEventListener("keyup", e => {
    keys[e.key] = false;
})


// UTILITIES //

function makeDamageNumber(amount, x, y) {
  const isCritical = amount > player.maxHealth * criticalHitPurcentage;
  const color = isCritical ? "red" : "orange";

  const velocity = {
    x: (Math.random() - 0.5) * 1.5, // Léger mouvement gauche/droite
    y: -(Math.random() * 1.5 + 1),  // Toujours vers le haut
  };

  damageNumbers.push({
    x,
    y,
    vx: velocity.x,
    vy: velocity.y,
    alpha: 1,
    color,
    amount,
    gravity: 0.05,
    fadeRate: 0.02,
    font: "20px Arial"
  });
}

function updateDamageNumbers() {

  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dmg = damageNumbers[i];

    // Mise à jour de la position
    dmg.x += dmg.vx;
    dmg.y += dmg.vy;
    dmg.vy += dmg.gravity;

    // Diminution de l'alpha
    dmg.alpha -= dmg.fadeRate;

    // Dessin
    ctx.save();
    ctx.globalAlpha = Math.max(dmg.alpha, 0);
    ctx.fillStyle = dmg.color;
    ctx.font = dmg.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(dmg.amount, dmg.x, dmg.y);
    ctx.restore();

    // Suppression si invisible
    if (dmg.alpha <= 0) {
      damageNumbers.splice(i, 1);
    }
  }
}

function drawText(texte, x, y, couleur, police = "20px Arial", alpha = 1) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = couleur;
  ctx.font = police;
  ctx.fillText(texte, x, y);
  ctx.restore();
}
function screenToWorld(x, y) {
    return {
      x: (x - canvas.width / 2) / camera.zoom + camera.x,
      y: (y - canvas.height / 2) / camera.zoom + camera.y
    };
  }
  
  function worldToScreen(x, y) {
    return {
      x: (x - camera.x) * camera.zoom + canvas.width / 2,
      y: (y - camera.y) * camera.zoom + canvas.height / 2
    };
  }

  function drawGrid() {
    const baseSpacing = 100;
    let spacing = baseSpacing;
  
    const minScreenSpacing = 40;
    const maxScreenSpacing = 150;
  
    let screenSpacing = spacing * camera.zoom;
    while (screenSpacing < minScreenSpacing) {
      spacing *= 2;
      screenSpacing = spacing * camera.zoom;
    }
    while (screenSpacing > maxScreenSpacing) {
      spacing /= 2;
      screenSpacing = spacing * camera.zoom;
    }
  
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
  
    const topLeft = screenToWorld(0, 0);
    const bottomRight = screenToWorld(canvas.width, canvas.height);
  
    const startX = Math.floor(topLeft.x / spacing) * spacing;
    const endX = Math.ceil(bottomRight.x / spacing) * spacing;
    const startY = Math.floor(topLeft.y / spacing) * spacing;
    const endY = Math.ceil(bottomRight.y / spacing) * spacing;
  
    for (let x = startX; x <= endX; x += spacing) {
      const screenX = worldToScreen(x, 0).x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();
    }
  
    for (let y = startY; y <= endY; y += spacing) {
      const screenY = worldToScreen(0, y).y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
    }
  
    return spacing;
  }
  function blendColorsHealth(healthRatio) {
    // Interpolation entre rouge et vert
    const r = Math.floor(255 * (1 - healthRatio));
    const g = Math.floor(255 * healthRatio);
    return `rgb(${r}, ${g}, 0)`;
  }
  function drawHealthBar(health, maxHealth, ctx, x, y, width, height) {
    const ratio = Math.max(0, Math.min(1, health / maxHealth));
    const color = blendColorsHealth(ratio);
  
    // Fond de la barre
    ctx.fillStyle = '#444';
    ctx.fillRect(x, y, width, height);
  
    // Remplissage de la barre de vie
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width * ratio, height);
  
    // Contour
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x, y, width, height);
  }

 // ENTITY //

 
class Entity {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.vx = 0
        this.vy = 0
        this.radius = 20
        this.fov = 1
        this.speed = 5
        this.acceleration = 1
        this.type = "entity"
        this.mass = 1
        this.bounciness = 0.7
        this.label = ""
        this.health = 100
        this.maxHealth = 100
        this.damage = 20
        this.regeneration = 0.1,
        this.friction = 0.85
        this.input = {}
        this.color = "#ffffff"
        this.strokeColor = "#222"
        this.team = -100//-100 is entity team
        entities.push(this)
    }
    draw() {
        const screen = worldToScreen(this.x, this.y);
        const radius = this.radius * camera.zoom;

        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
    }
    applyInput() {
      if (this.input.up) this.vy -= this.acceleration;
      if (this.input.down) this.vy += this.acceleration;
      if (this.input.left) this.vx -= this.acceleration;
      if (this.input.right) this.vx += this.acceleration;
      this.vx = Math.max(-this.speed, Math.min(this.speed, this.vx));
      this.vy = Math.max(-this.speed, Math.min(this.speed, this.vy));
  }
  applyFriction() { this.vx *= this.friction; this.vy *= this.friction; }
  updatePosition() { this.x += this.vx; this.y += this.vy; }
  takeDamage(amount) { 
    this.health -= amount; 
    if (this.health < 0) this.health = 0; 
    makeDamageNumber(amount, worldToScreen(this.x, this.y).x, worldToScreen(this.x, this.y).y);
  }
  regen() { if (this.regeneration != 0 && !this.isDead()) { if (this.regeneration + this.health >= this.maxHealth) this.health = this.maxHealth; else this.health += this.regeneration; } }
  isDead() {
      return this.health <= 0;
  }
}

//PLAYER

player = new Entity(0, 0)
player.color = "#0069FF"
player.team = 1
player.fov = 1

function handleCollision(e1, e2) {
  //if (e1.isDead() || e2.isDead()) return;
  const dx = e2.x - e1.x, dy = e2.y - e1.y; var dist = Math.sqrt(dx*dx + dy*dy); if (dist == 0) dist = 1;
  const minDist = e1.radius + e2.radius;
  if (dist < minDist) {
      const overlap = minDist - dist; const nx = dx / dist, ny = dy / dist;
      const totalMass = e1.mass + e2.mass;
      e1.x -= nx * overlap * (e2.mass / totalMass); e1.y -= ny * overlap * (e2.mass / totalMass);
      e2.x += nx * overlap * (e1.mass / totalMass); e2.y += ny * overlap * (e1.mass / totalMass);
      const relVx = e2.vx - e1.vx, relVy = e2.vy - e1.vy; const relDot = relVx * nx + relVy * ny;
      if (relDot < 0) {
          const bounce = Math.min(e1.bounciness, e2.bounciness);
          const impulse = (2 * relDot) / totalMass;
          e1.vx += impulse * e2.mass * nx * bounce * kbmult;
          e1.vy += impulse * e2.mass * ny * bounce * kbmult;
          e2.vx -= impulse * e1.mass * nx * bounce * kbmult;
          e2.vy -= impulse * e1.mass * ny * bounce * kbmult;
      }
      if (e1.team !== e2.team) {
        //Calculate the relative velocity between e1 and e2
        const relVx = e2.vx - e1.vx;
        const relVy = e2.vy - e1.vy;
        
        //Calculate the magnitude of the relative velocity
        const relativeVelocity = Math.sqrt(relVx * relVx + relVy * relVy);
      
        const damageMultiplier = relativeVelocity / velocityDamageConst;
    
        // Apply damage with velocity scaling
        e1.takeDamage(Math.round(e2.damage * damageMultiplier));
        e2.takeDamage(Math.round(e1.damage * damageMultiplier));
    }
    
      
  }
}

function draw() {
    if (player.isDead()) {
      drawText("Game Over", window.innerWidth / 2, window.innerHeight / 2, "red", "72px 'Arial Black'");
    }
    const spacing = drawGrid();//also calls drawGrid() so ye, spacing can be used for later things
    updateDamageNumbers()
    if (showHealthBar == true) {
      drawText(Math.round(player.health/* * 100*/)/* / 100*/, (Math.min(player.maxHealth, healthCap) / 2) + 10, 40, "white")
      drawHealthBar(player.health, player.maxHealth, ctx, 10, 50, Math.min(player.maxHealth, healthCap)/* plus tu as de vie max plus la barre est grande */, 10)
    }
    entities.forEach(entity => {
        entity.draw()
    })
}
function gameLoop() {
    if (keys['ArrowUp']) {player.input.up = true} else {player.input.up = false};
    if (keys['ArrowDown']) {player.input.down = true} else {player.input.down = false};
    if (keys['ArrowLeft']) {player.input.left = true} else {player.input.left = false};
    if (keys['ArrowRight']) {player.input.right = true} else {player.input.right = false};
    camera.x = player.x
    camera.y = player.y
    camera.zoom = 1/player.fov

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();

    entities.forEach(entity => {
      entity.applyInput(); 
      entity.applyFriction(); 
      entity.updatePosition();
      entity.regen();
    })
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) handleCollision(entities[i], entities[j]);
  }


    requestAnimationFrame(gameLoop);
}
gameLoop()




// lets test things shall we lmao?

function test() {
//test entities
  test1 = new Entity(100, 100)
  test1.vx = -50
  test1.vy = -50
  test1.damage = 75

  test2 = new Entity(-100, -100)
  test2.radius = 100
  test2.mass = 100
  test2.color = "#654321"
  test2.damage = 1

  test3 = new Entity(100, -100)
  test3.radius = 10
  test3.mass = 0.1
  test3.damage = 0
}

test() //remove this when finish testing



