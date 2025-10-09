const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");

const size = 25; // tamaño de cada bloque
const speed = 100; // velocidad (menor = más rápido)

const techLogos = [
  { src: "./logos/html-5.png", label: "HTML", color: "#e44d26" },
  { src: "./logos/css.png", label: "CSS", color: "#264de4" },
  { src: "./logos/js.png", label: "JS", color: "#f0db4f" },
  { src: "./logos/nodejs.png", label: "Node", color: "#61dafb" },
];

let images = [];
let snake = [{ x: 5, y: 5 }]; // empieza con 1 bloque
let direction = { x: 1, y: 0 };
let targets = [];
let growth = 0;
let visited = new Map(); // memoria de posiciones visitadas
let interval;

//  Cargar imágenes y esperar a que terminen
function loadImages(callback) {
  let loaded = 0;
  techLogos.forEach((tech) => {
    const img = new Image();
    img.src = tech.src;
    img.onload = () => {
      loaded++;
      if (loaded === techLogos.length) callback();
    };
    images.push({ ...tech, img });
  });
}

//  Inicializar logos
function initTargets() {
  const totalTargets = 30; // cantidad de logos simultáneos
  targets = [];

  for (let i = 0; i < totalTargets; i++) {
    const tech = images[Math.floor(Math.random() * images.length)];
    targets.push({
      x: Math.floor(Math.random() * (canvas.width / size)),
      y: Math.floor(Math.random() * (canvas.height / size)),
      logo: tech,
    });
  }
}

//  Dibujar
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Serpiente con efecto neón
  ctx.shadowBlur = 20;
  ctx.shadowColor = snake.color || "#0ff";
  ctx.fillStyle = snake.color || "#0ff";
  snake.forEach((s) => {
    ctx.fillRect(s.x * size, s.y * size, size - 3, size - 3);
  });

  // Dibujar logos
  targets.forEach((t) => {
    ctx.shadowBlur = 0;
    ctx.drawImage(t.logo.img, t.x * size, t.y * size, size, size);
  });
}

//  Movimiento automático con memoria
function move() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Wrap-around
  if (head.x < 0) head.x = canvas.width / size - 1;
  if (head.y < 0) head.y = canvas.height / size - 1;
  if (head.x >= canvas.width / size) head.x = 0;
  if (head.y >= canvas.height / size) head.y = 0;

  // Registrar visita
  const key = `${head.x},${head.y}`;
  visited.set(key, (visited.get(key) || 0) + 1);

  // Si se visitó demasiadas veces, buscar otra dirección
  if (visited.get(key) > 3) {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    let safeDirs = dirs.filter((d) => {
      const nextKey = `${head.x + d.x},${head.y + d.y}`;
      return (visited.get(nextKey) || 0) < 3;
    });

    if (safeDirs.length > 0) {
      direction = safeDirs[Math.floor(Math.random() * safeDirs.length)];
      head.x = snake[0].x + direction.x;
      head.y = snake[0].y + direction.y;
    }
  }

  // Wrap-around nuevamente tras cambio
  if (head.x < 0) head.x = canvas.width / size - 1;
  if (head.y < 0) head.y = canvas.height / size - 1;
  if (head.x >= canvas.width / size) head.x = 0;
  if (head.y >= canvas.height / size) head.y = 0;

  // Añadir cabeza
  snake.unshift(head);

  // Comer logo
  for (let i = 0; i < targets.length; i++) {
    if (targets[i].x === head.x && targets[i].y === head.y) {
      snake.color = targets[i].logo.color;
      targets.splice(i, 1);
      growth += 1;
      break;
    }
  }

  // Reducir cuerpo
  if (growth > 0) growth--;
  else snake.pop();

  // Cambio de dirección aleatorio suave
  if (Math.random() < 0.02) {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    let newDir;
    do {
      newDir = dirs[Math.floor(Math.random() * dirs.length)];
    } while (newDir.x === -direction.x && newDir.y === -direction.y);
    direction = newDir;
  }

  // Reponer logos si quedan pocos
  if (targets.length < 10) initTargets();

  // 🧹 Limpiar memoria vieja (para evitar sobrecarga)
  if (visited.size > 2000) {
    visited = new Map([...visited.entries()].slice(-1000));
  }

  draw();
}

//  Iniciar
loadImages(() => {
  initTargets();
  draw();
  interval = setInterval(move, speed);
});
