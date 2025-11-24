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
//////////////////
const kbmult = 5
let camera = { x: 100, y: 100, zoom: 1 };
var entities = []

const keys = {}
window.addEventListener("keydown", e => {
    keys[e.key] = true;
})  
  window.addEventListener("keyup", e => {
    keys[e.key] = false;
})

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
        this.damage = 10
        this.regeneration = 0.1,
        this.friction = 0.8
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
}

player = new Entity(50, 50)

new Entity(100, 100)

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
      /*if (e1.team !== e2.team) {
          e1.takeDamage(e2.damage); e2.takeDamage(e1.damage);
          damageEvents.push({ id: e1.id, amount: e2.damage, x: e1.x, y: e1.y });
          damageEvents.push({ id: e2.id, amount: e1.damage, x: e2.x, y: e2.y });
      }*/
      
  }
}

function draw() {

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
    })
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) handleCollision(entities[i], entities[j]);
  }


    requestAnimationFrame(gameLoop);
}
gameLoop()

