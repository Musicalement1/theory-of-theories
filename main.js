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
let mouse = { x: 0, y: 0 };
const damageNumbers = [];
const criticalHitPurcentage = 0.6
const kbmult = 2
const healthCap = 250
const velocityDamageConst = 10
let camera = { x: 100, y: 100, zoom: 1 };
var entities = []
const hotbarItems = 10

const keys = {}
window.addEventListener("keydown", e => {
  if (e.key == "'") {e.preventDefault()}
    keys[e.key] = true;
})  
  window.addEventListener("keyup", e => {
    keys[e.key] = false;
})

document.addEventListener('mousemove', function(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

document.addEventListener('mousedown', function(event) {
  if (event.button === 0) player.input.lmb = true;
  if (event.button === 2) player.input.rmb = true;
});

document.addEventListener('mouseup', function(event) {
  if (event.button === 0) player.input.lmb = false;
  if (event.button === 2) player.input.rmb = false;
});


// UTILITIES //

function makeDamageNumber(amount, x, y, entity) {
  const isCritical = amount > entity.maxHealth * criticalHitPurcentage;
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

function updatePlayerFacing(player, mouseX, mouseY) {
    const playerX = player.x;
    const playerY = player.y;
    const deltaX = mouseX - playerX;
    const deltaY = mouseY - playerY;
    const angle = Math.atan2(deltaY, deltaX);
    player.facing = angle;
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
  function drawHealthBarForEntities(x, y, health, maxHealth, radius) {
    const barWidth = radius * 2;          // largeur proportionnelle à la taille du monstre
    const barHeight = 6;
    const ratio = Math.max(0, Math.min(1, health / maxHealth));

    ctx.fillStyle = 'black';
    ctx.fillRect(x - barWidth/2, y + radius + 12, barWidth, barHeight); // en-dessous du cercle
    ctx.fillStyle = 'limegreen';
    ctx.fillRect(x - barWidth/2, y + radius + 12, barWidth * ratio, barHeight);
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
        this.facingType = ""
        this.facing = 0
        this.isPlayer = false
        this.showHealthBar = true
        this.alpha = 1
        this.collidesWithTeam = true
        this.handItem = 0
        entities.push(this)
    }
    draw() {
        const screen = worldToScreen(this.x, this.y);
        const radius = this.radius * camera.zoom;
        ctx.save();
        if (this.showHealthBar && !this.isPlayer) {
          drawHealthBarForEntities(screen.x, screen.y, this.health, this.maxHealth, this.radius)
        }
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color
        if (this.alpha !=1) {
          ctx.globalAlpha = this.alpha
        }
        else if (this.isPlayer) {
          ctx.globalAlpha = player.health/player.maxHealth
        } else {
          ctx.globalAlpha = this.health + (this.maxHealth/2) /this.maxHealth//less opacity shift
        }
        ctx.fill();
        ctx.strokeStyle = this.strokeColor;
        ctx.stroke();
        ctx.restore();
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
    makeDamageNumber(amount, worldToScreen(this.x, this.y).x, worldToScreen(this.x, this.y).y, this);
  }
  regen() { if (this.regeneration != 0 && !this.isDead()) { if (this.regeneration + this.health >= this.maxHealth) this.health = this.maxHealth; else this.health += this.regeneration; } }
  isDead() {
      return this.health <= 0;
  }
  updateFacing() {
    switch (this.facingType) {
      case "withMotion":
        if (Math.abs(this.vx) != 0 || Math.abs(this.vy) != 0) {
          this.facing = Math.atan2(this.vy, this.vx);
      }
      break;
      case "player":
        updatePlayerFacing(player, screenToWorld(mouse.x, mouse.y).x, screenToWorld(mouse.x, mouse.y).y)
      break;
      default:
    }
  }
}

//PLAYER

player = new Entity(0, 0)
player.color = "#0069FF"
player.team = 1
player.fov = 1
player.facingType = "player"
player.isPlayer = true
player.showHealthBar = true

//

function handleCollision(e1, e2) {
  if (e1.isDead() || e2.isDead()) return;
  if (e1.team == e2.team && (e1.collidesWithTeam == false || e2.collidesWithTeam == false)) return;
  const dx = e2.x - e1.x, dy = e2.y - e1.y; var dist = Math.sqrt(dx*dx + dy*dy); if (dist == 0) dist = 1;
  const minDist = e1.radius + e2.radius;
  if (dist < minDist) {
      const overlap = minDist - dist; const nx = dx / dist, ny = dy / dist;
      const totalMass = e1.mass + e2.mass;
      e1.x -= nx * overlap * (e2.mass / totalMass); e1.y -= ny * overlap * (e2.mass / totalMass);
      e2.x += nx * overlap * (e1.mass / totalMass); e2.y += ny * overlap * (e1.mass / totalMass);
      const relVx = e2.vx - e1.vx, relVy = e2.vy - e1.vy; const relDot = relVx * nx + relVy * ny;
      if (relDot < 0) {
          const bounce = (e1.bounciness + e2.bounciness) / 2//Math.min(e1.bounciness, e2.bounciness);//Math.min()?
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
        const damageMultiplier = Math.max(Math.min(relativeVelocity / velocityDamageConst, 1.5), 0.5);
        // Apply damage with velocity scaling
        e1.takeDamage(Math.round(e2.damage * damageMultiplier));
        e2.takeDamage(Math.round(e1.damage * damageMultiplier));
    }
    
      
  }
}
function shoot(entity) {
      if (!entity.isDead()) {
        // test //
        const newEntity = new Entity(entity.x + (Math.cos(entity.facing) * entity.radius), entity.y + (Math.sin(entity.facing) * entity.radius));
        newEntity.facing = entity.facing
        newEntity.team = 1
        newEntity.collidesWithTeam = false
        newEntity.vx = (Math.cos(newEntity.facing) * 5)// + (player.vx * 0.4);
        newEntity.vy = (Math.sin(newEntity.facing) * 5)// + (player.vy * 0.4);
        newEntity.friction = 0.995
        newEntity.regeneration = -0.5
        newEntity.radius = 10
        newEntity.damage = 1
        newEntity.showHealthBar = false
        newEntity.mass = 2
        entities.push(newEntity);
        // //
    }
}
function handleMouseInput(player) {
    if (player.input.lmb) {
      shoot(player)
  }
}

function drawLoadout(handItem) {
  const numItems = hotbarItems;
  const barHeight = canvas.height * 0.05;
  const itemSize = (canvas.width * 0.4) / numItems;
  const spacing = (canvas.width * 0.05) / (numItems - 1);

  for (let i = 0; i < numItems; i++) {
      const x = (canvas.width - (itemSize * numItems + spacing * (numItems - 1))) / 2 + i * (itemSize + spacing);
      const y = (canvas.height - barHeight) / 50;

      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(x, y, itemSize, itemSize);

      if (i === handItem) {
          ctx.strokeStyle = '#FF4500';
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, itemSize, itemSize);
      }
  }
}


function tranformKeyIntoInt(key) {
  switch (key) {// à faire aussi pour qwerty
    case "&":
      return 1
    case "é":
      return 2
    case '"':
      return 3
    case "'":
      return 4
    case "(":
      return 5
    case "§":
      return 6
    case "è":
      return 7
    case "!":
      return 8
    case "ç":
      return 9
    case "à":
      return 0
    default:
      return 0
  }
}
function transformIntIntoKey(int) {
  switch (int) {
    case 1:
      return "&";
    case 2:
      return "é";
    case 3:
      return "\"";
    case 4:
      return "'";
    case 5:
      return "(";
    case 6:
      return "§";
    case 7:
      return "è";
    case 8:
      return "!";
    case 9:
      return "ç";
    case 0:
      return "à";
    default:
      return 0;
  }
}


function draw() {
    const spacing = drawGrid();//also calls drawGrid() so ye, spacing can be used for later things
    entities.forEach(entity => {
        entity.draw()
    })
    updateDamageNumbers()
    if (player.isDead()) {
      drawText("Game Over", window.innerWidth / 2, window.innerHeight / 2, "red", "72px 'Arial Black'");
    }
    if (player.showHealthBar == true) {
      drawText(Math.round(player.health/* * 100*/)/* / 100*/, (Math.min(player.maxHealth, healthCap) / 2) + 10, 40, "white")
      drawHealthBar(player.health, player.maxHealth, ctx, 10, 50, Math.min(player.maxHealth, healthCap)/* plus tu as de vie max plus la barre est grande */, 10)
    }
    drawLoadout(player.handItem)
}


function gameLoop() {
    //if (player.input.lmb)
    if (keys['ArrowUp']) {player.input.up = true} else {player.input.up = false};
    if (keys['ArrowDown']) {player.input.down = true} else {player.input.down = false};
    if (keys['ArrowLeft']) {player.input.left = true} else {player.input.left = false};
    if (keys['ArrowRight']) {player.input.right = true} else {player.input.right = false};
    for (i = 0; i<hotbarItems; i++) {
        index = transformIntIntoKey(i)
        if (keys[index]) {
          player.input[i] = true
          if (i == 0) {
            player.handItem = hotbarItems-1
          } else {
          player.handItem = i-1
          }
        } else {
          player.input[i] = false
        }
    }


    camera.x = player.x
    camera.y = player.y
    camera.zoom = 1/player.fov

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    handleMouseInput(player);
    entities.forEach(entity => {
      entity.applyInput(); 
      entity.applyFriction(); 
      entity.updatePosition();
      entity.regen();
      entity.updateFacing();
    })
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) handleCollision(entities[i], entities[j]);
  }
  //remove dead

  for (let i = entities.length - 1; i >= 0; i--) {
    if (entities[i].isDead()) {
      entities.splice(i, 1);
    }
  }



  requestAnimationFrame(gameLoop);//loop loop loop loop loop
}
gameLoop()




// lets test things shall we lmao?

function test() {
//test entities
  test1 = new Entity(100, 100)
  test1.vx = -50
  test1.vy = -50
  test1.damage = 75
  test1.color = "#810372"
  test1.health = 90
  test1.regeneration = -0.1

  test2 = new Entity(-100, -100)
  test2.radius = 100
  test2.mass = 100
  test2.color = "#654321"
  test2.damage = 2
  test2.maxHealth = 1500
  test2.health = 1500
  test2.regeneration = 0.5
  test2.bounciness = 0.7

  test3 = new Entity(100, -100)
  test3.radius = 10
  test3.mass = 0.1
  test3.damage = 0
}

test() //remove this when finish testing



