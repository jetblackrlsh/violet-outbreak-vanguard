import * as THREE from "three";

const canvas = document.querySelector("#game-canvas");
const startScreen = document.querySelector("#start-screen");
const resultScreen = document.querySelector("#result-screen");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");
const pauseButton = document.querySelector("#pause-button");
const healButton = document.querySelector("#heal-button");
const settings = document.querySelector("#settings");
const settingsToggle = document.querySelector("#settings-toggle");
const musicVolume = document.querySelector("#music-volume");
const sfxVolume = document.querySelector("#sfx-volume");
const touchFire = document.querySelector("#touch-fire");
const touchShield = document.querySelector("#touch-shield");
const touchDodgeLeft = document.querySelector("#touch-dodge-left");
const touchDodgeRight = document.querySelector("#touch-dodge-right");

const ui = {
  phase: document.querySelector("#phase-label"),
  objective: document.querySelector("#objective-label"),
  healthValue: document.querySelector("#health-value"),
  healthBar: document.querySelector("#health-bar"),
  shieldValue: document.querySelector("#shield-value"),
  shieldBar: document.querySelector("#shield-bar"),
  cooldownBar: document.querySelector("#cooldown-bar"),
  weaponLabel: document.querySelector("#weapon-label"),
  healLabel: document.querySelector("#heal-label"),
  healCost: document.querySelector("#heal-cost"),
  score: document.querySelector("#score-value"),
  resultKicker: document.querySelector("#result-kicker"),
  resultTitle: document.querySelector("#result-title"),
  resultCopy: document.querySelector("#result-copy"),
};

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x08030f, 0.023);

const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 220);
camera.position.set(0, 2.2, 8);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const loader = new THREE.TextureLoader();
const clock = new THREE.Clock();

function loadTexture(path) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

const [
  conceptTexture,
  portalTexture,
  groundTexture,
  buildingTexture,
  skylineTexture,
  enemyBruteTexture,
  enemyImpTexture,
  enemyRobotTexture,
  enemyCrawlerTexture,
  bossPortalWarlordTexture,
  bossVoidQueenTexture,
  bossSiegeTitanTexture,
  bossCyberNecromancerTexture,
  bossAbyssBeastTexture,
  bossVioletOverlordTexture,
  playerRocketTexture,
  enemyBoltTexture,
] = await Promise.all([
  loadTexture("assets/concept-backdrop.png"),
  loadTexture("assets/portal.png"),
  loadTexture("assets/ground-texture.png"),
  loadTexture("assets/building-texture.png"),
  loadTexture("assets/skyline-backdrop.png"),
  loadTexture("assets/enemy-brute.png"),
  loadTexture("assets/enemy-imp.png"),
  loadTexture("assets/enemy-robot.png"),
  loadTexture("assets/enemy-crawler.png"),
  loadTexture("assets/boss-portal-warlord.png"),
  loadTexture("assets/boss-void-queen.png"),
  loadTexture("assets/boss-siege-titan.png"),
  loadTexture("assets/boss-cyber-necromancer.png"),
  loadTexture("assets/boss-abyss-beast.png"),
  loadTexture("assets/boss-violet-overlord.png"),
  loadTexture("assets/player-rocket-fist.png"),
  loadTexture("assets/enemy-plasma-bolt.png"),
]);

const assets = {
  concept: conceptTexture,
  portal: portalTexture,
  ground: groundTexture,
  building: buildingTexture,
  skyline: skylineTexture,
  enemyBrute: enemyBruteTexture,
  enemyImp: enemyImpTexture,
  enemyRobot: enemyRobotTexture,
  enemyCrawler: enemyCrawlerTexture,
  bossPortalWarlord: bossPortalWarlordTexture,
  bossVoidQueen: bossVoidQueenTexture,
  bossSiegeTitan: bossSiegeTitanTexture,
  bossCyberNecromancer: bossCyberNecromancerTexture,
  bossAbyssBeast: bossAbyssBeastTexture,
  bossVioletOverlord: bossVioletOverlordTexture,
  playerRocket: playerRocketTexture,
  enemyBolt: enemyBoltTexture,
};

for (const texture of Object.values(assets)) {
  texture.colorSpace = THREE.SRGBColorSpace;
}

assets.ground.wrapS = THREE.RepeatWrapping;
assets.ground.wrapT = THREE.RepeatWrapping;
assets.ground.repeat.set(7, 8);
assets.building.wrapS = THREE.RepeatWrapping;
assets.building.wrapT = THREE.RepeatWrapping;

const MAX_WAVE = 6;
const musicAssets = {
  title: "assets/Survive the Breach - Title Music.mp3",
  battle: "assets/Violet Outbreak Vanguard - Battle Music.mp3",
  boss: "assets/Rocket Fist Rampage - Boss Music.mp3",
  victory: "assets/Vanguard Victory - You Win.mp3",
  defeat: "assets/Portal Breach Failure - Game Over.mp3",
};

const enemyProfiles = [
  {
    name: "Demon Brute",
    texture: "enemyBrute",
    minWave: 1,
    hp: 34,
    speed: 3.35,
    score: 135,
    scale: [6.8, 6.8],
    grounded: true,
    movement: "stomp",
    attack: "slam",
  },
  {
    name: "Winged Imp",
    texture: "enemyImp",
    minWave: 2,
    hp: 24,
    speed: 4.9,
    score: 120,
    scale: [6.0, 6.0],
    grounded: false,
    movement: "swoop",
    attack: "diveTwin",
  },
  {
    name: "Siege Robot",
    texture: "enemyRobot",
    minWave: 3,
    hp: 46,
    speed: 2.95,
    score: 165,
    scale: [6.3, 6.6],
    grounded: true,
    movement: "march",
    attack: "rocketBurst",
  },
  {
    name: "Portal Crawler",
    texture: "enemyCrawler",
    minWave: 4,
    hp: 30,
    speed: 4.2,
    score: 135,
    scale: [6.8, 6.1],
    grounded: true,
    movement: "skitter",
    attack: "skitterShot",
  },
];

const bossProfiles = [
  {
    name: "Portal Warlord",
    texture: "bossPortalWarlord",
    hp: 360,
    scale: [9.4, 9.7],
    grounded: false,
    speed: 2.2,
    movement: "riftDrift",
    bossAttacks: ["riftFan", "gravityOrb"],
    attackDelay: 1.42,
  },
  {
    name: "Void Queen",
    texture: "bossVoidQueen",
    hp: 440,
    scale: [9.7, 10.1],
    grounded: false,
    speed: 2.55,
    movement: "queenDive",
    bossAttacks: ["wingLance", "spiralStorm"],
    attackDelay: 1.26,
  },
  {
    name: "Siege Titan",
    texture: "bossSiegeTitan",
    hp: 535,
    scale: [10.2, 10.8],
    grounded: true,
    speed: 1.95,
    movement: "titanMarch",
    bossAttacks: ["cannonBurst", "railShot"],
    attackDelay: 1.5,
  },
  {
    name: "Cyber Necromancer",
    texture: "bossCyberNecromancer",
    hp: 640,
    scale: [10.0, 10.7],
    grounded: false,
    speed: 2.35,
    movement: "necromancerFloat",
    bossAttacks: ["skullSwarm", "chainVolley"],
    attackDelay: 1.2,
  },
  {
    name: "Abyss Beast",
    texture: "bossAbyssBeast",
    hp: 760,
    scale: [11.0, 10.2],
    grounded: true,
    speed: 2.75,
    movement: "beastCharge",
    bossAttacks: ["acidArc", "shockwave"],
    attackDelay: 1.34,
  },
  {
    name: "Violet Overlord",
    texture: "bossVioletOverlord",
    hp: 920,
    scale: [11.4, 11.4],
    grounded: false,
    speed: 2.5,
    movement: "overlordPhase",
    bossAttacks: ["voidCross", "novaBurst"],
    attackDelay: 1.1,
  },
];

const game = {
  status: "menu",
  paused: false,
  wave: 1,
  phase: "wave",
  phaseKills: 0,
  targetKills: 12,
  waveSpawned: 0,
  health: 100,
  shield: 100,
  shieldHeld: false,
  fireCooldown: 0,
  healCooldown: 0,
  healCost: 900,
  playerX: 0,
  targetPlayerX: 0,
  dodgeCooldown: 0,
  spawnTimer: 0,
  score: 0,
  time: 0,
  bossSpawned: false,
  damageFlash: 0,
};

const runtime = {
  enemies: [],
  projectiles: [],
  enemyBolts: [],
  particles: [],
};

function createMaskedMaterial(texture, uv, glowColor = 0xffffff, intensity = 0.2) {
  const map = texture.clone();
  map.needsUpdate = true;
  map.repeat.set(uv[2], uv[3]);
  map.offset.set(uv[0], uv[1]);
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      glow: { value: new THREE.Color(glowColor) },
      glowIntensity: { value: intensity },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec3 glow;
      uniform float glowIntensity;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(map, vUv);
        float brightness = max(max(tex.r, tex.g), tex.b);
        if (brightness < 0.014) discard;
        float alpha = smoothstep(0.014, 0.042, brightness);
        tex.rgb = tex.rgb * 1.58 + glow * glowIntensity * smoothstep(0.08, 1.0, brightness);
        gl_FragColor = vec4(tex.rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

function createHealthBar(width) {
  const group = new THREE.Group();
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x160a20, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false }),
  );
  const fill = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.12),
    new THREE.MeshBasicMaterial({ color: 0x74ff3c, transparent: true, opacity: 1, depthWrite: false, depthTest: false }),
  );
  fill.position.z = 0.012;
  group.add(back, fill);
  group.renderOrder = 20;
  back.renderOrder = 20;
  fill.renderOrder = 21;
  group.userData.fill = fill;
  group.userData.width = width;
  return group;
}

function makeArena() {
  scene.background = new THREE.Color(0x05030d);

  const ambient = new THREE.AmbientLight(0x7c60ff, 1.1);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0x74ff3c, 1.8);
  key.position.set(-6, 12, 8);
  scene.add(key);

  const portalLight = new THREE.PointLight(0xb535ff, 70, 110, 1.35);
  portalLight.position.set(0, 8, -55);
  scene.add(portalLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 140, 34, 34),
    new THREE.MeshStandardMaterial({
      color: 0x9a8fae,
      map: assets.ground,
      emissiveMap: assets.ground,
      metalness: 0.28,
      roughness: 0.58,
      emissive: 0x1b1030,
      emissiveIntensity: 0.45,
      wireframe: false,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -38;
  scene.add(floor);

  const grid = new THREE.GridHelper(120, 36, 0x74ff3c, 0x352467);
  grid.position.y = 0.012;
  grid.position.z = -38;
  scene.add(grid);

  const portalMaterial = createMaskedMaterial(assets.portal, [0, 0, 1, 1], 0xb535ff, 0.45);
  portalMaterial.blending = THREE.AdditiveBlending;
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), portalMaterial);
  portal.position.set(0, 10.5, -58);
  portal.userData.spin = 0;
  scene.add(portal);
  runtime.portal = portal;

  const skyline = new THREE.Mesh(
    new THREE.PlaneGeometry(132, 74.25),
    new THREE.MeshBasicMaterial({ map: assets.skyline, transparent: true, opacity: 0.78, depthWrite: false, fog: false }),
  );
  skyline.position.set(0, 22, -96);
  scene.add(skyline);

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(108, 60.75),
    new THREE.MeshBasicMaterial({ map: assets.concept, transparent: true, opacity: 0.1, depthWrite: false, fog: false }),
  );
  backdrop.position.set(0, 17, -80);
  scene.add(backdrop);

  const buildingMaterial = new THREE.MeshBasicMaterial({
    color: 0xb5add0,
    map: assets.building,
    fog: true,
  });

  for (let i = 0; i < 46; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const height = 4 + Math.random() * 14;
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(3 + Math.random() * 8, height, 3 + Math.random() * 8),
      buildingMaterial.clone(),
    );
    block.material.color.multiplyScalar(i % 4 === 0 ? 1.1 : 0.86);
    block.position.set(side * (24 + Math.random() * 30), height / 2, -5 - Math.random() * 78);
    scene.add(block);
  }

  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x74ff3c,
    transparent: true,
    opacity: 0,
    wireframe: true,
    depthTest: false,
  });
  const shield = new THREE.Mesh(new THREE.SphereGeometry(3.15, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), shieldMat);
  shield.position.set(-1.55, -0.92, -4);
  shield.rotation.set(0.2, -0.6, 0);
  camera.add(shield);
  runtime.shieldMesh = shield;
}

function spawnEnemy(isBoss = false) {
  const difficulty = waveDifficulty(game.wave);
  const pool = availableEnemyProfiles(game.wave);
  const profile = isBoss ? bossProfiles[game.wave - 1] : pool[Math.floor(Math.random() * pool.length)];
  const hp = Math.round(profile.hp * (isBoss ? 1 + (game.wave - 1) * 0.3 : difficulty));
  const scale = [profile.scale[0] * (isBoss ? 1.2 : 1), profile.scale[1] * (isBoss ? 1.2 : 1)];
  const material = createMaskedMaterial(
    assets[profile.texture],
    [0, 0, 1, 1],
    isBoss ? 0xb535ff : 0x74ff3c,
    isBoss ? 0.34 : profile.grounded ? 0.18 : 0.24,
  );
  const mesh = new THREE.Group();
  const sprite = new THREE.Mesh(new THREE.PlaneGeometry(scale[0], scale[1]), material);
  const healthBar = createHealthBar(scale[0] * 0.68);
  healthBar.position.set(0, scale[1] * 0.55, 0.05);
  mesh.add(sprite, healthBar);
  const lane = isBoss ? 0 : (Math.random() - 0.5) * 24;
  const baseY = profile.grounded ? scale[1] / 2 : isBoss ? 8.3 + Math.random() * 1.2 : 5.0 + Math.random() * 1.2;
  mesh.position.set(lane, baseY, -54 + Math.random() * 5);
  scene.add(mesh);

  runtime.enemies.push({
    mesh,
    sprite,
    healthBar,
    profile,
    hp,
    maxHp: hp,
    boss: isBoss,
    baseY,
    scale,
    speed: (profile.speed || 4.4) * (isBoss ? 0.45 + (game.wave - 1) * 0.04 : 1.34 + (game.wave - 1) * 0.07),
    attackTimer: isBoss ? 1.65 : 2.2 + Math.random() * 1.35,
    strafe: Math.random() * Math.PI * 2,
    bossAttackIndex: 0,
    radius: isBoss ? Math.max(scale[0], scale[1]) * 0.48 : Math.max(scale[0], scale[1]) * 0.42,
  });
}

function availableEnemyProfiles(wave) {
  return enemyProfiles.filter((profile) => wave >= profile.minWave);
}

function spawnPlayerProjectile() {
  if (game.status !== "playing" || game.paused || game.fireCooldown > 0) return;
  const target = findAutoTarget();
  const direction = target ? directionToTarget(camera.position, target) : getAimDirection();
  const material = createMaskedMaterial(assets.playerRocket, [0, 0, 1, 1], 0x74ff3c, 0.35);
  material.blending = THREE.AdditiveBlending;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), material);
  mesh.position.copy(camera.position).add(new THREE.Vector3(0.45, -0.25, -1.2));
  scene.add(mesh);
  runtime.projectiles.push({ mesh, velocity: direction.multiplyScalar(68), life: 1.45, damage: 28 + game.wave * 3, target });
  game.fireCooldown = Math.max(0.22, 0.43 - game.wave * 0.018);
  audio.hit("fire");
}

function findAutoTarget() {
  let best = null;
  let bestScore = -Infinity;
  for (const enemy of runtime.enemies) {
    const distance = camera.position.distanceTo(enemy.mesh.position);
    const closeness = 110 - distance;
    const centerBias = 20 - Math.abs(enemy.mesh.position.x - camera.position.x);
    const threat = enemy.mesh.position.z + 60;
    const score = closeness * 0.55 + centerBias * 0.35 + threat * 0.45 + (enemy.boss ? 75 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = enemy;
    }
  }
  return best;
}

function directionToTarget(origin, enemy) {
  return enemy.mesh.position
    .clone()
    .add(new THREE.Vector3(0, enemy.boss ? 0.3 : 0.15, 0))
    .sub(origin)
    .normalize();
}

function spawnEnemyBolt(enemy, options = {}) {
  const material = createMaskedMaterial(assets.enemyBolt, [0, 0, 1, 1], 0xb535ff, 0.3);
  material.blending = THREE.AdditiveBlending;
  const size = (enemy.boss ? 1.45 : 1.08) * (options.sizeScale || 1);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
  mesh.position.copy(enemy.mesh.position).add(new THREE.Vector3(options.offsetX || 0, options.offsetY || 0.35, 0.8));
  scene.add(mesh);
  const target = camera.position.clone().add(new THREE.Vector3(options.aimOffsetX || 0, -0.2, 0));
  const speed = (enemy.boss ? 15 + game.wave : 12 + game.wave * 0.7) * (options.speedScale || 1);
  const velocity = target.sub(mesh.position).normalize().multiplyScalar(speed);
  runtime.enemyBolts.push({
    mesh,
    velocity,
    life: 3.1,
    damage: (enemy.boss ? 8 + game.wave * 1.5 : 5 + Math.round(game.wave * 0.7)) * (options.damageScale || 1),
  });
}

function burst(position, color = 0x74ff3c, count = 10) {
  for (let i = 0; i < count; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + Math.random() * 0.065, 8, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }),
    );
    mesh.position.copy(position);
    scene.add(mesh);
    runtime.particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 8, (Math.random() - 0.5) * 10),
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
    });
  }
}

function getAimDirection() {
  raycaster.setFromCamera(pointer, camera);
  return raycaster.ray.direction.clone().normalize();
}

function resetGame() {
  clearRuntime();
  clock.getDelta();
  game.status = "playing";
  game.paused = false;
  game.wave = 1;
  game.phase = "wave";
  game.phaseKills = 0;
  game.targetKills = waveTargetKills(1);
  game.waveSpawned = 0;
  game.health = 100;
  game.shield = 100;
  game.shieldHeld = false;
  game.fireCooldown = 0;
  game.healCooldown = 0;
  game.playerX = 0;
  game.targetPlayerX = 0;
  game.dodgeCooldown = 0;
  camera.position.x = 0;
  camera.rotation.z = 0;
  game.spawnTimer = 0.75;
  game.score = 0;
  game.time = 0;
  game.bossSpawned = false;
  game.damageFlash = 0;
  document.body.classList.remove("danger-pulse");
  resultScreen.classList.add("hidden");
  startScreen.classList.add("hidden");
  pauseButton.textContent = "II";
  runtime.shieldMesh.material.opacity = 0;
  if (runtime.portal) runtime.portal.scale.setScalar(1);
  audio.start();
  audio.setWave(1, false);
  updateHud();
}

function clearRuntime() {
  for (const collection of [runtime.enemies, runtime.projectiles, runtime.enemyBolts, runtime.particles]) {
    for (const item of collection) {
      disposeSceneObject(item.mesh);
    }
    collection.length = 0;
  }
}

function disposeSceneObject(object) {
  if (!object) return;
  scene.remove(object);
  object.traverse?.((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((material) => {
        material.uniforms?.map?.value?.dispose?.();
        material.dispose?.();
      });
    } else {
      child.material?.uniforms?.map?.value?.dispose?.();
      child.material?.dispose?.();
    }
  });
}

function waveTargetKills(wave) {
  return [12, 15, 17, 19, 21, 24][wave - 1] || 24;
}

function waveDifficulty(wave) {
  return 1.08 + (wave - 1) * 0.24;
}

function spawnIntervalForWave(wave) {
  return Math.max(0.62, 1.55 - wave * 0.12);
}

function maxLiveEnemiesForWave(wave) {
  return 4 + Math.floor(wave * 1.05);
}

function startBossPhase() {
  game.phase = "boss";
  game.phaseKills = 0;
  game.bossSpawned = true;
  game.spawnTimer = 1.1;
  spawnEnemy(true);
  audio.setWave(game.wave, true);
  ui.objective.textContent = `Boss: ${bossProfiles[game.wave - 1].name}`;
}

function nextWaveOrWin() {
  if (game.wave >= MAX_WAVE) {
    finish(true);
    return;
  }
  game.wave += 1;
  game.phase = "wave";
  game.phaseKills = 0;
  game.targetKills = waveTargetKills(game.wave);
  game.waveSpawned = 0;
  game.bossSpawned = false;
  game.spawnTimer = Math.max(0.55, spawnIntervalForWave(game.wave) * 0.72);
  audio.setWave(game.wave, false);
  burst(new THREE.Vector3(0, 8, -45), 0x74ff3c, 28);
}

function finish(victory) {
  game.status = victory ? "victory" : "defeat";
  audio.playResult(victory);
  clearRuntime();
  ui.resultKicker.textContent = victory ? "Portal sealed" : "Vanguard down";
  ui.resultTitle.textContent = victory ? "Victory" : "Defeat";
  ui.resultCopy.textContent = victory
    ? `Final score ${game.score}. The violet breach collapsed before the city fell.`
    : `Final score ${game.score}. The portal overran the line.`;
  resultScreen.classList.remove("hidden");
}

function update(dt) {
  if (game.status !== "playing" || game.paused) return;
  game.time += dt;
  game.fireCooldown = Math.max(0, game.fireCooldown - dt);
  game.healCooldown = Math.max(0, game.healCooldown - dt);
  game.dodgeCooldown = Math.max(0, game.dodgeCooldown - dt);
  game.playerX = THREE.MathUtils.damp(game.playerX, game.targetPlayerX, 8, dt);
  camera.position.x = game.playerX;
  camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, (game.targetPlayerX - game.playerX) * -0.035, 7, dt);

  const shieldActive = game.shieldHeld && game.shield > 0;
  if (shieldActive) {
    game.shield = Math.max(0, game.shield - 28 * dt);
  } else {
    game.shield = Math.min(100, game.shield + (17 + game.wave * 1.8) * dt);
  }
  runtime.shieldMesh.material.opacity = THREE.MathUtils.lerp(runtime.shieldMesh.material.opacity, shieldActive ? 0.35 : 0, 0.16);
  runtime.shieldMesh.rotation.z += dt * (shieldActive ? 1.8 : 0.35);

  if (runtime.portal) {
    runtime.portal.rotation.z += dt * (0.35 + game.wave * 0.06);
    runtime.portal.scale.setScalar(1 + Math.sin(game.time * 2.7) * 0.035);
  }

  updateSpawning(dt);
  updateEnemies(dt);
  updateProjectiles(dt);
  updateEnemyBolts(dt, shieldActive);
  updateParticles(dt);
  updateHud();
}

function updateSpawning(dt) {
  if (game.phase === "boss") {
    if (!runtime.enemies.some((enemy) => enemy.boss) && game.bossSpawned) nextWaveOrWin();
    return;
  }

  game.spawnTimer -= dt;
  const spawnInterval = spawnIntervalForWave(game.wave);
  const maxLive = maxLiveEnemiesForWave(game.wave);
  if (game.spawnTimer <= 0 && runtime.enemies.length < maxLive && game.waveSpawned < game.targetKills) {
    spawnEnemy(false);
    game.waveSpawned += 1;
    game.spawnTimer = spawnInterval * (0.65 + Math.random() * 0.7);
  }

  if (game.phaseKills >= game.targetKills && runtime.enemies.length === 0) {
    startBossPhase();
  }
}

function updateEnemyMotion(enemy, dt) {
  const { mesh, profile } = enemy;
  enemy.strafe += dt * (enemy.boss ? 0.7 : 1.2);
  let lateralSpeed = enemy.boss ? Math.sin(enemy.strafe) * 1.2 : 0;
  let forwardScale = 1;
  let y = enemy.baseY;

  if (profile.movement === "stomp") {
    lateralSpeed = Math.sin(enemy.strafe * 0.75) * 0.8;
    y = enemy.baseY + Math.abs(Math.sin(game.time * 4 + enemy.strafe)) * 0.16;
    forwardScale = 0.92;
  } else if (profile.movement === "swoop") {
    lateralSpeed = Math.sin(enemy.strafe * 1.65) * 4.2;
    y = enemy.baseY + Math.sin(game.time * 2.7 + enemy.strafe) * 1.1;
    forwardScale = 1.06;
  } else if (profile.movement === "march") {
    lateralSpeed = Math.sin(enemy.strafe * 0.7) * 0.55;
    forwardScale = Math.sin(game.time * 1.6 + enemy.strafe) > 0.78 ? 0.38 : 0.96;
    y = enemy.baseY + Math.abs(Math.sin(game.time * 3.2 + enemy.strafe)) * 0.08;
  } else if (profile.movement === "skitter") {
    lateralSpeed = Math.sin(enemy.strafe * 3.3) * 4.8;
    y = enemy.baseY + Math.abs(Math.sin(game.time * 9 + enemy.strafe)) * 0.08;
    forwardScale = 1.12;
  } else if (profile.movement === "riftDrift") {
    lateralSpeed = Math.sin(enemy.strafe * 1.1) * 2.1 + Math.sin(game.time * 0.7) * 0.7;
    y = enemy.baseY + Math.sin(game.time * 1.6 + enemy.strafe) * 0.7;
    forwardScale = 0.58 + Math.max(0, Math.sin(game.time * 0.9)) * 0.28;
  } else if (profile.movement === "queenDive") {
    lateralSpeed = Math.sin(enemy.strafe * 1.8) * 5.0;
    y = enemy.baseY + Math.sin(game.time * 2.5 + enemy.strafe) * 1.5;
    forwardScale = 0.66 + Math.max(0, Math.sin(game.time * 1.3 + enemy.strafe)) * 0.42;
  } else if (profile.movement === "titanMarch") {
    lateralSpeed = Math.sin(enemy.strafe * 0.42) * 0.36;
    forwardScale = Math.sin(game.time * 1.15 + enemy.strafe) > 0.62 ? 0.26 : 0.72;
    y = enemy.baseY + Math.abs(Math.sin(game.time * 2.2 + enemy.strafe)) * 0.1;
  } else if (profile.movement === "necromancerFloat") {
    lateralSpeed = Math.sin(enemy.strafe * 0.95) * 3.2 + Math.sin(game.time * 2.1) * 0.55;
    y = enemy.baseY + Math.sin(game.time * 1.35 + enemy.strafe) * 1.05;
    forwardScale = 0.45 + Math.abs(Math.sin(game.time * 0.8 + enemy.strafe)) * 0.22;
  } else if (profile.movement === "beastCharge") {
    lateralSpeed = Math.sin(enemy.strafe * 1.35) * 1.35;
    forwardScale = Math.sin(game.time * 0.95 + enemy.strafe) > 0.35 ? 1.05 : 0.36;
    y = enemy.baseY + Math.abs(Math.sin(game.time * 4.6 + enemy.strafe)) * 0.12;
  } else if (profile.movement === "overlordPhase") {
    lateralSpeed = Math.sin(enemy.strafe * 1.45) * 3.8 + Math.sin(game.time * 3.2) * 0.8;
    y = enemy.baseY + Math.sin(game.time * 2.05 + enemy.strafe) * 1.35;
    forwardScale = 0.5 + Math.max(0, Math.sin(game.time * 1.7)) * 0.3;
  }

  mesh.position.z += enemy.speed * forwardScale * dt;
  mesh.position.x += lateralSpeed * dt;
  mesh.position.y = y;
  mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -25, 25);
  mesh.lookAt(camera.position.x, mesh.position.y, camera.position.z);
  mesh.scale.setScalar(1 + Math.sin(game.time * 7 + enemy.strafe) * 0.025);
}

function fireEnemyAttack(enemy) {
  const attack = enemy.profile.attack;
  if (enemy.boss) {
    const pattern = enemy.profile.bossAttacks[enemy.bossAttackIndex % enemy.profile.bossAttacks.length];
    enemy.bossAttackIndex += 1;
    fireBossAttack(enemy, pattern);
  } else if (attack === "diveTwin") {
    spawnEnemyBolt(enemy, { offsetX: -0.8, offsetY: 0.85, aimOffsetX: -1.15, speedScale: 1.42, damageScale: 0.62, sizeScale: 0.78 });
    spawnEnemyBolt(enemy, { offsetX: 0.8, offsetY: 0.85, aimOffsetX: 1.15, speedScale: 1.42, damageScale: 0.62, sizeScale: 0.78 });
  } else if (attack === "rocketBurst") {
    spawnEnemyBolt(enemy, { aimOffsetX: -2.4, speedScale: 0.88, damageScale: 0.82, sizeScale: 1.2 });
    spawnEnemyBolt(enemy, { aimOffsetX: 0, speedScale: 1.05, damageScale: 0.86, sizeScale: 1.05 });
    spawnEnemyBolt(enemy, { aimOffsetX: 2.4, speedScale: 0.88, damageScale: 0.82, sizeScale: 1.2 });
  } else if (attack === "slam") {
    spawnEnemyBolt(enemy, { offsetY: -0.35, speedScale: 0.72, damageScale: 1.45, sizeScale: 1.55 });
    spawnEnemyBolt(enemy, { offsetX: -0.9, offsetY: -0.55, aimOffsetX: -2.8, speedScale: 0.92, damageScale: 0.52, sizeScale: 0.8 });
    spawnEnemyBolt(enemy, { offsetX: 0.9, offsetY: -0.55, aimOffsetX: 2.8, speedScale: 0.92, damageScale: 0.52, sizeScale: 0.8 });
  } else if (attack === "skitterShot") {
    spawnEnemyBolt(enemy, { offsetX: -0.7, offsetY: -0.2, aimOffsetX: -3.4, speedScale: 1.32, damageScale: 0.48, sizeScale: 0.72 });
    spawnEnemyBolt(enemy, { offsetX: 0.7, offsetY: -0.2, aimOffsetX: 3.4, speedScale: 1.32, damageScale: 0.48, sizeScale: 0.72 });
    spawnEnemyBolt(enemy, { offsetY: -0.1, aimOffsetX: 0, speedScale: 1.52, damageScale: 0.46, sizeScale: 0.64 });
  }
}

function fireBossAttack(enemy, pattern) {
  const fan = (offsets, options = {}) => {
    for (const offset of offsets) {
      spawnEnemyBolt(enemy, {
        aimOffsetX: offset,
        offsetX: offset * 0.18,
        ...options,
      });
    }
  };

  if (pattern === "riftFan") {
    fan([-4.8, -2.4, 0, 2.4, 4.8], { speedScale: 0.95, sizeScale: 1.08, damageScale: 0.62 });
  } else if (pattern === "gravityOrb") {
    spawnEnemyBolt(enemy, { offsetY: 0.9, speedScale: 0.62, sizeScale: 2.15, damageScale: 1.55 });
  } else if (pattern === "wingLance") {
    spawnEnemyBolt(enemy, { offsetX: -1.25, aimOffsetX: -1.7, speedScale: 1.62, sizeScale: 0.92, damageScale: 0.82 });
    spawnEnemyBolt(enemy, { offsetX: 1.25, aimOffsetX: 1.7, speedScale: 1.62, sizeScale: 0.92, damageScale: 0.82 });
  } else if (pattern === "spiralStorm") {
    fan([-3.2, -1.4, 1.4, 3.2], { speedScale: 1.18, sizeScale: 0.95, damageScale: 0.58, offsetY: 0.8 });
  } else if (pattern === "cannonBurst") {
    fan([-2.6, 0, 2.6], { speedScale: 0.9, sizeScale: 1.6, damageScale: 0.98, offsetY: 0.25 });
  } else if (pattern === "railShot") {
    spawnEnemyBolt(enemy, { offsetY: 0.45, speedScale: 1.85, sizeScale: 0.78, damageScale: 1.45 });
  } else if (pattern === "skullSwarm") {
    fan([-3.4, -1.1, 1.1, 3.4], { speedScale: 1.34, sizeScale: 0.82, damageScale: 0.52, offsetY: 0.95 });
  } else if (pattern === "chainVolley") {
    fan([-2.1, 0, 2.1], { speedScale: 1.08, sizeScale: 1.18, damageScale: 0.84, offsetY: 0.4 });
  } else if (pattern === "acidArc") {
    fan([-2.8, 0, 2.8], { speedScale: 0.72, sizeScale: 1.75, damageScale: 0.9, offsetY: 0.15 });
  } else if (pattern === "shockwave") {
    fan([-5.6, -2.8, 0, 2.8, 5.6], { speedScale: 1.02, sizeScale: 1.05, damageScale: 0.56, offsetY: 0.1 });
  } else if (pattern === "voidCross") {
    spawnEnemyBolt(enemy, { offsetX: -1.45, aimOffsetX: 2.6, speedScale: 1.3, sizeScale: 1.2, damageScale: 0.82 });
    spawnEnemyBolt(enemy, { offsetX: 1.45, aimOffsetX: -2.6, speedScale: 1.3, sizeScale: 1.2, damageScale: 0.82 });
    spawnEnemyBolt(enemy, { offsetY: 1.1, speedScale: 1.05, sizeScale: 1.35, damageScale: 0.95 });
  } else if (pattern === "novaBurst") {
    fan([-6, -4, -2, 0, 2, 4, 6], { speedScale: 1.12, sizeScale: 1.0, damageScale: 0.5, offsetY: 0.9 });
  }
}

function nextAttackDelay(enemy) {
  const ramp = 1 + (game.wave - 1) * 0.11;
  const attack = enemy.profile.attack;
  const base = enemy.boss ? enemy.profile.attackDelay : attack === "slam" ? 2.75 : attack === "rocketBurst" ? 2.85 : attack === "diveTwin" ? 1.8 : 1.35;
  return base / ramp;
}

function updateEnemies(dt) {
  for (let i = runtime.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = runtime.enemies[i];
    const { mesh } = enemy;
    updateEnemyMotion(enemy, dt);

    enemy.attackTimer -= dt * (0.9 + (game.wave - 1) * 0.08);
    if (enemy.attackTimer <= 0) {
      fireEnemyAttack(enemy);
      enemy.attackTimer = nextAttackDelay(enemy);
      audio.hit("enemy");
    }

    const healthScale = Math.max(0.02, enemy.hp / enemy.maxHp);
    enemy.healthBar.userData.fill.scale.x = healthScale;
    enemy.healthBar.userData.fill.position.x = -(enemy.healthBar.userData.width * (1 - healthScale)) / 2;

    if (mesh.position.z > 4.5) {
      takeDamage(enemy.boss ? 18 + game.wave : 8 + Math.round(game.wave * 0.75));
      if (game.status !== "playing") return;
      game.phaseKills = Math.min(game.targetKills, game.phaseKills + 1);
      burst(mesh.position, 0xff4568, enemy.boss ? 24 : 12);
      removeEnemy(i);
    }
  }
}

function updateProjectiles(dt) {
  for (let i = runtime.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = runtime.projectiles[i];
    projectile.life -= dt;
    if (projectile.target && runtime.enemies.includes(projectile.target)) {
      const speed = projectile.velocity.length();
      const desired = directionToTarget(projectile.mesh.position, projectile.target).multiplyScalar(speed);
      projectile.velocity.lerp(desired, Math.min(1, dt * 8));
    } else {
      projectile.target = findAutoTarget();
    }
    projectile.mesh.position.addScaledVector(projectile.velocity, dt);
    projectile.mesh.lookAt(camera.position);
    projectile.mesh.rotation.z += dt * 14;

    let hitIndex = -1;
    for (let j = runtime.enemies.length - 1; j >= 0; j -= 1) {
      const enemy = runtime.enemies[j];
      if (projectile.mesh.position.distanceTo(enemy.mesh.position) < enemy.radius) {
        hitIndex = j;
        break;
      }
    }

    if (hitIndex >= 0) {
      const enemy = runtime.enemies[hitIndex];
      enemy.hp -= projectile.damage;
      burst(projectile.mesh.position, 0x74ff3c, 12);
      audio.hit("impact");
      removeProjectile(i);
      if (enemy.hp <= 0) {
        defeatEnemy(hitIndex);
      }
    } else if (projectile.life <= 0 || projectile.mesh.position.z < -90) {
      removeProjectile(i);
    }
  }
}

function updateEnemyBolts(dt, shieldActive) {
  for (let i = runtime.enemyBolts.length - 1; i >= 0; i -= 1) {
    const bolt = runtime.enemyBolts[i];
    bolt.life -= dt;
    bolt.mesh.position.addScaledVector(bolt.velocity, dt);
    bolt.mesh.lookAt(camera.position);
    const dist = bolt.mesh.position.distanceTo(camera.position);
    if (dist < 3.3) {
      if (shieldActive) {
        game.score += 15;
        game.shield = Math.max(0, game.shield - bolt.damage * 0.95);
        burst(bolt.mesh.position, 0x74ff3c, 14);
        audio.hit("block");
      } else {
        takeDamage(bolt.damage);
        if (game.status !== "playing") return;
        burst(bolt.mesh.position, 0xff4568, 10);
      }
      removeEnemyBolt(i);
    } else if (bolt.life <= 0) {
      removeEnemyBolt(i);
    }
  }
}

function updateParticles(dt) {
  for (let i = runtime.particles.length - 1; i >= 0; i -= 1) {
    const particle = runtime.particles[i];
    particle.life -= dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.velocity.multiplyScalar(0.94);
    particle.mesh.material.opacity = Math.max(0, particle.life / particle.maxLife);
    if (particle.life <= 0) {
      disposeSceneObject(particle.mesh);
      runtime.particles.splice(i, 1);
    }
  }
}

function defeatEnemy(index) {
  const enemy = runtime.enemies[index];
  const gain = enemy.boss ? 850 + game.wave * 200 : enemy.profile.score + game.wave * 18;
  game.score += gain;
  game.phaseKills += 1;
  burst(enemy.mesh.position, enemy.boss ? 0xb535ff : 0x74ff3c, enemy.boss ? 36 : 18);
  removeEnemy(index);
}

function takeDamage(amount) {
  game.health = Math.max(0, game.health - amount);
  game.damageFlash = 0.25;
  document.body.classList.remove("danger-pulse");
  requestAnimationFrame(() => document.body.classList.add("danger-pulse"));
  audio.hit("hurt");
  if (game.health <= 0) finish(false);
}

function tryHeal() {
  if (game.status !== "playing" || game.paused) return;
  if (game.health >= 100 || game.score < game.healCost || game.healCooldown > 0) {
    audio.hit("enemy");
    return;
  }
  game.score -= game.healCost;
  game.health = Math.min(100, game.health + 28);
  game.healCooldown = 1.2;
  burst(camera.position.clone().add(new THREE.Vector3(0, -0.25, -2.2)), 0x74ff3c, 20);
  audio.hit("block");
  updateHud();
}

function sideStep(direction) {
  if (game.status !== "playing" || game.paused || game.dodgeCooldown > 0) return;
  game.targetPlayerX = THREE.MathUtils.clamp(game.targetPlayerX + direction * 4.25, -8.5, 8.5);
  game.dodgeCooldown = 0.24;
  burst(camera.position.clone().add(new THREE.Vector3(direction * 0.9, -0.45, -2.4)), 0x49ffc6, 8);
  audio.hit("block");
}

function removeEnemy(index) {
  const [enemy] = runtime.enemies.splice(index, 1);
  if (!enemy) return;
  disposeSceneObject(enemy.mesh);
}

function removeProjectile(index) {
  const [projectile] = runtime.projectiles.splice(index, 1);
  if (!projectile) return;
  disposeSceneObject(projectile.mesh);
}

function removeEnemyBolt(index) {
  const [bolt] = runtime.enemyBolts.splice(index, 1);
  if (!bolt) return;
  disposeSceneObject(bolt.mesh);
}

function updateHud() {
  const phaseTitle = game.phase === "boss" ? `Boss ${game.wave}` : `Wave ${game.wave}`;
  ui.phase.textContent = phaseTitle;
  ui.objective.textContent =
    game.phase === "boss"
      ? ui.objective.textContent
      : `Enemies ${Math.min(game.phaseKills, game.targetKills)} / ${game.targetKills}`;
  ui.healthValue.textContent = Math.ceil(game.health);
  ui.shieldValue.textContent = Math.ceil(game.shield);
  ui.healthBar.style.width = `${game.health}%`;
  ui.shieldBar.style.width = `${game.shield}%`;
  ui.cooldownBar.style.width = `${Math.round((1 - Math.min(1, game.fireCooldown / 0.43)) * 100)}%`;
  ui.weaponLabel.textContent =
    game.fireCooldown > 0
      ? "Rocket fist charging"
      : runtime.enemies.length > 0
        ? "Rocket fist auto-lock"
        : "Rocket fist ready";
  const canHeal = game.status === "playing" && game.health < 100 && game.score >= game.healCost && game.healCooldown <= 0;
  healButton.disabled = !canHeal;
  ui.healLabel.textContent = game.health >= 100 ? "Health full" : game.healCooldown > 0 ? "Heal charging" : "Heal";
  ui.healCost.textContent = canHeal ? `-${game.healCost}` : game.healCost.toString();
  ui.score.textContent = game.score.toLocaleString();
}

function resize() {
  const { innerWidth, innerHeight } = window;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
}

function render() {
  try {
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    renderer.render(scene, camera);
  } catch (error) {
    console.error(error);
  } finally {
    requestAnimationFrame(render);
  }
}

function setPointerFromEvent(event) {
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  const x = touch ? touch.clientX : event.clientX;
  const y = touch ? touch.clientY : event.clientY;
  if (typeof x !== "number" || typeof y !== "number") return;
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
  document.documentElement.style.setProperty("--aim-x", `${x}px`);
  document.documentElement.style.setProperty("--aim-y", `${y}px`);
}

function togglePause() {
  if (game.status !== "playing") return;
  game.paused = !game.paused;
  pauseButton.textContent = game.paused ? ">" : "II";
  audio.setPaused(game.paused);
}

const audio = {
  ctx: null,
  master: null,
  music: null,
  sfx: null,
  tracks: {},
  currentMusic: null,
  currentWave: 1,
  isBoss: false,
  started: false,

  start() {
    if (!this.ctx) this.create();
    this.ctx.resume();
    this.started = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.45);
    this.playMusic("battle", { loop: true, restart: true, rate: this.waveRate(game.wave) });
  },

  create() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.music = this.ctx.createGain();
    this.sfx = this.ctx.createGain();
    this.master.gain.value = 0;
    this.music.gain.value = this.musicLevel();
    this.sfx.gain.value = Number(sfxVolume.value);
    this.music.connect(this.master);
    this.sfx.connect(this.master);
    this.master.connect(this.ctx.destination);

    for (const [name, src] of Object.entries(musicAssets)) {
      const element = new Audio(src);
      element.preload = "auto";
      element.crossOrigin = "anonymous";
      element.loop = name === "title" || name === "battle" || name === "boss";
      const source = this.ctx.createMediaElementSource(element);
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(this.music);
      this.tracks[name] = { element, gain };
    }
  },

  setWave(wave, boss) {
    this.currentWave = wave;
    this.isBoss = boss;
    if (!this.ctx) return;
    this.playMusic(boss ? "boss" : "battle", {
      loop: true,
      restart: this.currentMusic !== (boss ? "boss" : "battle"),
      rate: boss ? 1 : this.waveRate(wave),
    });
  },

  playTitle() {
    if (game.status !== "menu") return;
    if (!this.ctx) this.create();
    this.ctx.resume();
    this.started = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0.82, this.ctx.currentTime + 0.35);
    this.playMusic("title", { loop: true, restart: false, rate: 1 });
  },

  playResult(victory) {
    if (!this.ctx) return;
    this.ctx.resume();
    this.playMusic(victory ? "victory" : "defeat", { loop: false, restart: true, rate: 1 });
  },

  playMusic(name, options = {}) {
    if (!this.ctx || !this.tracks[name]) return;
    const { loop = true, restart = false, rate = 1 } = options;
    const now = this.ctx.currentTime;
    this.currentMusic = name;

    for (const [trackName, track] of Object.entries(this.tracks)) {
      const active = trackName === name;
      track.gain.gain.cancelScheduledValues(now);
      track.gain.gain.linearRampToValueAtTime(active ? 1 : 0, now + (active ? 0.45 : 0.65));
      if (!active) {
        window.setTimeout(() => {
          if (this.currentMusic !== trackName) track.element.pause();
        }, 720);
      }
    }

    const track = this.tracks[name];
    track.element.loop = loop;
    track.element.playbackRate = rate;
    if (restart) track.element.currentTime = 0;
    track.element.play().catch(() => {});
  },

  waveRate(wave) {
    return 0.98 + (wave - 1) * 0.018;
  },

  setPaused(paused) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.music.gain.cancelScheduledValues(now);
    this.music.gain.linearRampToValueAtTime(paused ? 0.05 : this.musicLevel(), now + 0.18);
  },

  musicLevel() {
    return Math.min(1.25, Number(musicVolume.value) * 1.12);
  },

  note(freq, length, type, volume, time, destination) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600 + this.currentWave * 240, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + length + 0.03);
  },

  noise(length, volume, time, destination) {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    source.start(time);
  },

  hit(kind) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const table = {
      fire: [210, 0.09, "sawtooth", 0.16],
      impact: [96, 0.08, "square", 0.18],
      block: [360, 0.12, "triangle", 0.22],
      hurt: [54, 0.18, "sawtooth", 0.2],
      enemy: [140, 0.07, "square", 0.08],
    };
    const [freq, length, type, volume] = table[kind] || table.impact;
    this.note(freq, length, type, volume, now, this.sfx);
  },
};

musicVolume.addEventListener("input", () => {
  if (audio.music) audio.music.gain.value = audio.musicLevel();
});

sfxVolume.addEventListener("input", () => {
  if (audio.sfx) audio.sfx.gain.value = Number(sfxVolume.value);
});

window.addEventListener("resize", resize);
window.addEventListener("mousemove", setPointerFromEvent);
window.addEventListener("touchmove", setPointerFromEvent, { passive: true });
window.addEventListener("pointerdown", () => audio.playTitle(), { passive: true });

window.addEventListener("mousedown", (event) => {
  setPointerFromEvent(event);
  if (event.button === 2) {
    game.shieldHeld = true;
  } else {
    spawnPlayerProjectile();
  }
});

window.addEventListener("mouseup", (event) => {
  if (event.button === 2) game.shieldHeld = false;
});

window.addEventListener("contextmenu", (event) => event.preventDefault());

window.addEventListener("touchstart", (event) => {
  setPointerFromEvent(event);
  if (game.status === "playing" && !event.target.closest("button, input")) spawnPlayerProjectile();
}, { passive: true });

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyA" || event.code === "ArrowLeft") {
    event.preventDefault();
    sideStep(-1);
  }
  if (event.code === "KeyD" || event.code === "ArrowRight") {
    event.preventDefault();
    sideStep(1);
  }
  if (event.code === "Space") {
    event.preventDefault();
    spawnPlayerProjectile();
  }
  if (event.code === "KeyQ") {
    event.preventDefault();
    game.shieldHeld = true;
  }
  if (event.code === "KeyE") {
    event.preventDefault();
    tryHeal();
  }
  if (event.code === "KeyP") togglePause();
});

window.addEventListener("keyup", (event) => {
  if (event.code === "KeyQ") game.shieldHeld = false;
});

startButton.addEventListener("click", resetGame);
restartButton.addEventListener("click", () => window.location.reload());
pauseButton.addEventListener("click", togglePause);
healButton.addEventListener("click", tryHeal);
settingsToggle.addEventListener("click", () => settings.classList.toggle("open"));
touchFire.addEventListener("click", spawnPlayerProjectile);
touchDodgeLeft.addEventListener("click", () => sideStep(-1));
touchDodgeRight.addEventListener("click", () => sideStep(1));
touchShield.addEventListener("pointerdown", () => {
  game.shieldHeld = true;
});
touchShield.addEventListener("pointerup", () => {
  game.shieldHeld = false;
});
touchShield.addEventListener("pointercancel", () => {
  game.shieldHeld = false;
});

resize();
makeArena();
updateHud();
render();
