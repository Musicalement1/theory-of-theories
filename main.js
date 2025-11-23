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
        this.radius = 10
        this.fov = 1
        this.speed = 1
        entities.push(this)
    }
    draw() {
        const screen = worldToScreen(this.x, this.y);
        const radius = this.radius * camera.zoom;

        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "white"
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.stroke();
    }
}

player = new Entity(50, 50)

new Entity(100, 100)


function draw() {

    entities.forEach(entity => {
        entity.draw()
    })
}
function gameLoop() {
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;
    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    camera.x = player.x
    camera.y = player.y
    camera.zoom = 1/player.fov

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop()

