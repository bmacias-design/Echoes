const WAVE_AUDIO_PATH = "./audio/Echoes.mp3";

let waveSong; let waveAmplitude; let waveFFT; let spectrumData = []; // Almacena el espectro en tiempo real para el efecto osciloscopio

let waveLevel = 0; let prevLevel = 0; let currentTime = 0;

// Variables de interacción y reproducción 
let pressX = 0; let isDragging = false; let targetRate = 1.0; let currentRate = 1.0;

// Sistema de ondas (ripples) 
let ripples = []; const MAX_RIPPLES = 15; let totalRipplesSpawned = 0;

// Sistema de ráfagas de viento solar 
let windGusts = [];

// Tiempo dinámico reactivo e inercia fluida constante
let reactiveTime = 0;
let flowTime = 0;

// Sistema de rotación acumulativa para la espiral 
let spiralRotationAngle = 0; let currentRotationSpeed = 0.004; let targetRotationSpeed = 0.004;

// Fuerza elástica de derretimiento interactivo localizado 
let localMeltStrength = 0;

// Coordenadas suavizadas del cursor (Efecto viscosidad/gelatina) 
let smoothMouseX = 0; let smoothMouseY = 0;

// Intensidad gravitatoria para la Fase 2 (Partículas en movimiento) 
let gravityInfluence = 0.0;

// Rejilla de hilos de densidad independiente por fase 
let yStepInicio = 14; let yStepGroove = 15; let yStepRenacimiento = 10; let xStep = 18;

// --- VARIABLES GLOBALES DE SELECCIÓN DE HILOS --- 
let grabbedRowIdx = -1; let grabbedLayerIdx = -1;

// Variables de reactividad fluida (Alta Sensibilidad y respuesta inmediata) 
let smoothWaveHeight = 1.0; let smoothWaveFreq = 0.015; let smoothTrebleShiver = 0.0; 
let currentBassScale = 1.0; let currentLowMidScale = 1.0; let currentMidScale = 1.0; 
let currentHighMidScale = 1.0; let currentTrebleScale = 1.0; let prevPingEnergy = 0; let lastPingFrame = 0;

// Intensidad del oleaje instrumental suavizado 
let smoothInstrumentIntensity = 0;

// Paletas de color fijas 
let colDropCyan, colDropRed, colOceanGreen, colOceanPurple;

// Colores del Prisma de Pink Floyd y de la Hélice 3D 
let colPF1, colPF2, colPF3, colPF4, colPF5, colPF6; let colHelixBlue, colHelixCopper;

// --- ESTRUCTURAS PARA LA FASE 4: LUCES PRISMÁTICAS EN LA OSCURIDAD --- 
let lightRays = [];
let initializedLightRays = false;

// --- VARIABLES DE INTERACCIÓN FASE 4 (PELOTITA GRAB) ---
let phase4SphereX = 0;
let phase4SphereY = 0;
let phase4SphereZ = 0;
let phase4SphereGrabbed = false;

// --- VARIABLES DE PERSISTENCIA Y CONTROL INTERACTIVO FASE 3 ---
let rodHeights = [];
let phase3HeightMultiplier = 1.0; // Multiplicador de escala manipulable por arrastre

// --- VARIABLES DE EFECTOS DE CONTROL FASE 2 ---
let phase2FocalPulse = 1.0;

function preload() { 
  waveSong = loadSound(WAVE_AUDIO_PATH); 
}

function setup() { 
  createCanvas(windowWidth, windowHeight);

  // Inyección de CSS definitiva para eliminar el contorno blanco de forma forzada
  let styleOverride = document.createElement('style'); 
  styleOverride.innerHTML = `* { margin: 0 !important; padding: 0 !important; box-sizing: border-box !important; outline: none !important; } html, body { width: 100% !important; height: 100% !important; background-color: #000000 !important; overflow: hidden !important; } canvas { display: block !important; border: none !important; outline: none !important; }`; 
  document.head.appendChild(styleOverride);

  waveAmplitude = new p5.Amplitude(); 
  waveFFT = new p5.FFT();

  if (waveSong) { 
    waveAmplitude.setInput(waveSong); 
    waveFFT.setInput(waveSong); 
  }

  smoothMouseX = width / 2; 
  smoothMouseY = height / 2;

  colDropCyan = color(45, 100, 180);
  colDropRed = color(185, 25, 40);
  colOceanGreen = color(20, 145, 85);
  colOceanPurple = color(120, 35, 165);

  // --- COLORES PRIMARIOS DEL PRISMA DE PINK FLOYD --- 
  colPF1 = color(255, 10, 50); // Rojo 
  colPF2 = color(255, 100, 10); // Naranja 
  colPF3 = color(240, 210, 20); // Amarillo 
  colPF4 = color(10, 230, 80); // Verde 
  colPF5 = color(10, 140, 255); // Azul 
  colPF6 = color(150, 20, 240); // Violeta

  // --- COLORES DE LA HÉLICE DE VIDRIO 3D DE TU CAPTURA --- 
  colHelixBlue = color(15, 45, 175);
  colHelixCopper = color(225, 115, 35);

  // --- DEFINICIÓN DE PALETAS SALVAJES Y ÁSPERAS FASE 2 ---
  themesPhase2 = [
    { sun: color(255, 215, 0), waveA: color(0, 243, 255), waveB: color(255, 17, 0) },     // 0. Cian / Rojo (Original)
    { sun: color(255, 0, 150), waveA: color(10, 255, 80), waveB: color(150, 0, 255) },    // 1. Verde Neón / Violeta Ácido
    { sun: color(255, 110, 0), waveA: color(255, 0, 110), waveB: color(0, 180, 255) },    // 2. Rosa Eléctrico / Azul Cyber
    { sun: color(0, 255, 180), waveA: color(0, 110, 255), waveB: color(255, 10, 80) },    // 3. Azul Eléctrico / Escarlata
    { sun: color(240, 255, 10), waveA: color(255, 0, 180), waveB: color(20, 30, 120) },   // 4. Fucsia Neón / Índigo Industrial (Áspero)
    { sun: color(255, 20, 20), waveA: color(210, 255, 0), waveB: color(30, 30, 70) }      // 5. Amarillo Ácido / Sombra de Fondo
  ];

  // Inicialización de colores dinámicos
  currentSunCol = themesPhase2[0].sun;
  currentColA = themesPhase2[0].waveA;
  currentColB = themesPhase2[0].waveB;

  targetSunCol = themesPhase2[0].sun;
  targetColA = themesPhase2[0].waveA;
  targetColB = themesPhase2[0].waveB;
}

function draw() { 
  background(0);

  // Ajuste suave de velocidad 
  currentRate = lerp(currentRate, targetRate, 0.05);
  if (waveSong && waveSong.isLoaded() && waveSong.isPlaying()) {
    waveSong.rate(currentRate); 
  }

  // Amortiguación del movimiento del cursor para efecto viscoso (Gelatina)
  smoothMouseX = lerp(smoothMouseX, mouseX, 0.13); 
  smoothMouseY = lerp(smoothMouseY, mouseY, 0.13);

  // --- COMPROBACIONES DE CARGA --- 
  if (!waveSong) return; 
  if (!waveSong.isLoaded()) { 
    fill(255); 
    noStroke(); 
    textAlign(CENTER, CENTER);
    textSize(20); 
    text("Sintetizando fluidos...", width / 2, height / 2); 
    return; 
  }

  // --- MENU DE INICIO SIMPLIFICADO ---
  if (waveSong.isLoaded() && !waveSong.isPlaying()) { 
    textAlign(CENTER, CENTER); 
    textFont('Courier New');
    
    // "Echoes" en letras grandes en el medio
    textSize(64); 
    fill(255, 230);
    text("Echoes", width / 2, height / 2 - 20);
    
    // Instrucción pequeña y muy tenue debajo
    textSize(14); 
    fill(255, 90);
    text("(Click para iniciar la experiencia)", width / 2, height / 2 + 40);
    return; 
  }

  // --- OBTENER TIEMPOS ACTUAL Y ESPECTRO --- 
  if (waveSong.isPlaying()) {
    currentTime = waveSong.currentTime(); 
    // Respuesta de amplitud para cambios dinámicos inmediatos 
    waveLevel = lerp(waveLevel, waveAmplitude.getLevel(), 0.28); 
    spectrumData = waveFFT.analyze();

    // El motor de tiempo reactivo acumula volumen para avanzar la animación física
    reactiveTime += waveLevel * 0.22 * currentRate; 

    // Incremento constante para un oleaje líquido sin saltos bruscos
    flowTime += (0.015 + waveLevel * 0.11) * currentRate;

    // --- MANEJO DEL CONTROL MULTIPLICADOR DE LA FASE 3 ---
    let inPhase3 = (currentTime >= 300 && currentTime < 600);
    if (inPhase3 && mouseIsPressed) {
      // Arrastre vertical: cambia el tamaño de las ondas con el cursor
      let dy = mouseY - pmouseY;
      phase3HeightMultiplier -= dy * 0.007;
      phase3HeightMultiplier = constrain(phase3HeightMultiplier, 0.12, 2.8);

      // Entrada alternativa por si usas las flechas del teclado en su lugar
      if (keyIsPressed) {
        if (keyCode === UP_ARROW) phase3HeightMultiplier += 0.03;
        if (keyCode === DOWN_ARROW) phase3HeightMultiplier -= 0.03;
      }
    } else {
      // Retorno elástico suave al valor predeterminado cuando no hay interacción
      phase3HeightMultiplier = lerp(phase3HeightMultiplier, 1.0, 0.08);
    }

    // --- CONTROL DEL EFECTO FOCAL PALPITANTE EN FASE 2 ---
    let inPhase2 = (currentTime >= 60 && currentTime < 300);
    if (inPhase2 && mouseIsPressed) {
      // Latido cardíaco asimétrico e intenso (Thump-Thump)
      let heartbeat = sin(frameCount * 0.22) * 0.65 + sin(frameCount * 0.44) * 0.35;
      phase2FocalPulse = lerp(phase2FocalPulse, 1.0 + heartbeat * 0.25 * gravityInfluence, 0.2);
    } else {
      phase2FocalPulse = lerp(phase2FocalPulse, 1.0, 0.12);
    }

    // --- MANEJO DE LA GRAVEDAD DE LA PELOTITA EN FASE 4 (Rango Ampliado) ---
    let inPhase4 = (currentTime >= 600 && currentTime < 840);
    if (inPhase4 && phase4SphereGrabbed) {
      let cx = width / 2;
      let cy = height / 2;
      let fovAngle = 135; // FOV consistente
      let fovRad = radians(fovAngle);
      let focalDist = (width / 2) / tan(fovRad / 2);
      
      let spZ = 650 + phase4SphereZ;
      // Proyección inversa del cursor 2D a coordenadas locales de espacio 3D
      let targetX = ((mouseX - cx) * spZ) / focalDist;
      let targetY = ((mouseY - cy) * spZ) / focalDist;
      
      // Contención física ampliada para mover con gran rango libre por el cubo
      phase4SphereX = lerp(phase4SphereX, constrain(targetX, -240, 240), 0.22);
      phase4SphereY = lerp(phase4SphereY, constrain(targetY, -240, 240), 0.22);
      phase4SphereZ = lerp(phase4SphereZ, constrain(targetX * 0.25, -150, 150), 0.12);
    } else {
      // Gravedad central: regresa suavemente al centro muerto al soltarse
      phase4SphereX = lerp(phase4SphereX, 0, 0.05);
      phase4SphereY = lerp(phase4SphereY, 0, 0.05);
      phase4SphereZ = lerp(phase4SphereZ, 0, 0.05);
    }

    // --- VELOCIDAD DE ROTACIÓN DINÁMICA POR FRECUENCIA (Fase 3 activa de 300s a 600s) ---
    let baseSpeed = 0.004;
    if (currentTime >= 240 && currentTime < 600) {
      // En la Fase 3, el giro reacciona dinámicamente a la potencia rítmica del audio
      targetRotationSpeed = map(waveLevel, 0.0, 0.35, 0.006, 0.045, true) * currentRate;
    } else if (currentTime >= 240 && mouseIsPressed) {
      targetRotationSpeed = 0.038; 
    } else {
      targetRotationSpeed = baseSpeed; 
    }
    currentRotationSpeed = lerp(currentRotationSpeed, targetRotationSpeed, 0.05);
    spiralRotationAngle += currentRotationSpeed * currentRate;

    // --- CARGA DE DERRETIMIENTO INTERACTIVO BAJO EL MOUSE (FASE 3) ---
    if (currentTime >= 240 && mouseIsPressed) {
      localMeltStrength = lerp(localMeltStrength, 1.0, 0.05); 
    } else {
      localMeltStrength = lerp(localMeltStrength, 0.0, 0.1);  
    }

    // --- MANEJO DEL EFECTO GRAVITATORIO INTERACTIVO Y DISTORSIÓN EN FASE 2 ---
    if (inPhase2 && mouseIsPressed) {
      gravityInfluence = lerp(gravityInfluence, 1.0, 0.05);
      targetRate = map(noise(frameCount * 0.035), 0, 1, 0.55, 1.45);
    } else {
      gravityInfluence = lerp(gravityInfluence, 0.0, 0.08);
      if (!isDragging) {
        targetRate = 1.0;
      }
    }

    // Análisis espectral de las bandas de audio
    let bassEnergy = waveFFT.getEnergy("bass");
    let lowMidEnergy = waveFFT.getEnergy("lowMid");
    let midEnergy = waveFFT.getEnergy("mid");
    let highMidEnergy = waveFFT.getEnergy("highMid");
    let trebleEnergy = waveFFT.getEnergy("treble");

    // Rango dinámico y velocidad de cambio de escala aumentado para una respuesta ágil
    currentBassScale = lerp(currentBassScale, map(bassEnergy, 50, 220, 0.5, 1.8, true), 0.28);
    currentLowMidScale = lerp(currentLowMidScale, map(lowMidEnergy, 40, 190, 0.5, 1.7, true), 0.28);
    currentMidScale = lerp(currentMidScale, map(midEnergy, 50, 180, 0.5, 1.7, true), 0.28);
    currentHighMidScale = lerp(currentHighMidScale, map(highMidEnergy, 30, 160, 0.5, 1.6, true), 0.28);
    currentTrebleScale = lerp(currentTrebleScale, map(trebleEnergy, 20, 150, 0.5, 1.5, true), 0.28);

    // Control de altura de hilos reactiva (Graves) - Respuesta elástica
    let targetHeight = map(bassEnergy, 40, 210, 0.5, 2.4, true);
    smoothWaveHeight = lerp(smoothWaveHeight, targetHeight, 0.28);

    // Control de micro-vibraciones / temblores (Agudos)
    let targetShiver = map(trebleEnergy, 15, 130, 0.0, 10.0, true);
    smoothTrebleShiver = lerp(smoothTrebleShiver, targetShiver, 0.22);

    // Control de ancho de onda reactiva (Agudos)
    let targetFreq = map(trebleEnergy, 15, 130, 0.012, 0.024, true);
    smoothWaveFreq = lerp(smoothWaveFreq, targetFreq, 0.22);

    // Detección automática del "Ping" (Fase 1)
    let pingEnergy = waveFFT.getEnergy(1500, 3200);
    let pingDelta = pingEnergy - prevPingEnergy;
    prevPingEnergy = pingEnergy;

    if (pingDelta > 18 && frameCount - lastPingFrame > 40) {
      if (currentTime < 60) {
        spawnRipple(); 
      }
      lastPingFrame = frameCount;
    }

    let bassNorm = map(bassEnergy, 90, 190, 0, 1, true);
    let midNorm = map(midEnergy, 70, 170, 0, 1, true);
    let targetIntensity = max(bassNorm, midNorm);
    smoothInstrumentIntensity = lerp(smoothInstrumentIntensity, targetIntensity, 0.08);

    // Detector de velocidad del mouse para viento solar
    let mouseVel = dist(mouseX, mouseY, pmouseX, pmouseY);
    if (mouseVel > 15 && currentTime >= 60 && currentTime < 420) {
      let dx = mouseX - pmouseX;
      let dy = mouseY - pmouseY;
      windGusts.push({
        x: pmouseX,
        y: pmouseY,
        vx: dx * 0.8,
        vy: dy * 0.8,
        radius: 10,
        life: 1.0
      });
    }

    // --- ACCIÓN DE DEJAR PRESIONADO ---
    if (mouseIsPressed && frameCount % 22 === 0 && currentTime >= 60 && currentTime < 240) {
      spawnRipple(mouseX, mouseY, true); 
    }

  } else { 
    currentTime = 0; 
  }

  // Actualización de física de ráfagas de viento solar 
  for (let i = windGusts.length - 1; i >= 0; i--) { 
    let g = windGusts[i]; 
    g.radius += 8 * currentRate;
    g.life -= 0.038 * currentRate; 
    if (g.life <= 0) { 
      windGusts.splice(i, 1); 
    } 
  }

  // Actualización de física de gotas de lluvia y radios de ondas 
  let maxR = Math.max(width, height) * 1.5; 
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];

    if (!r.hitGround) {
      r.dropletY += r.dropletSpeed * currentRate;
      r.dropletSpeed += 2.8 * currentRate; 
      
      if (r.dropletY >= r.y) {
        r.hitGround = true;
        r.radius = 0; 
      }
    } else {
      r.radius += r.speed * currentRate;
      if (r.radius > maxR) {
        ripples.splice(i, 1);
      }
    }
  }

  // --- RENDERS TRANSICIONALES --- 
  let weights = calculatePhaseWeights(currentTime);

  if (weights[0] > 0) drawSectionInicio(weights[0]); 
  if (weights[1] > 0) drawSectionGroove(weights[1]); 
  if (weights[2] > 0) drawSectionFunk(weights[2]); // Llama a la Fase 3 rediseñada
  if (weights[3] > 0) drawSectionVacio(weights[3]); // Llama a la Fase 4 rediseñada con auroras prismáticas y caja 3D
  if (weights[4] > 0) drawSectionRenacimiento(weights[4]);

  // --- CODA FINAL: DEGRADADO OSCURO DE DISOLUCIÓN (FIN DE LA CANCIÓN) ---
  if (currentTime > 1340) {
    let fadeAmount = map(currentTime, 1340, 1411, 0, 255, true);
    push();
    noStroke();
    let darkGrad = drawingContext.createRadialGradient(width/2, height/2, 10, width/2, height/2, max(width, height) * 0.7);
    darkGrad.addColorStop(0, "rgba(0, 0, 0, " + (fadeAmount / 255 * 0.85) + ")");
    darkGrad.addColorStop(0.5, "rgba(0, 0, 0, " + (fadeAmount / 255 * 0.95) + ")");
    darkGrad.addColorStop(1.0, "rgba(0, 0, 0, " + (fadeAmount / 255) + ")");
    
    drawingContext.fillStyle = darkGrad;
    rect(0, 0, width, height);
    pop();
  }

  drawHUD(currentTime); 
}

// ========================================== // FUNCIÓN AUXILIAR: GENERADOR PSEUDOALEATORIO ESTABLE // ========================================== 
function hashValue(seed) { 
  let x = Math.sin(seed) * 10000; 
  return x - Math.floor(x); 
}

// ========================================== // FUNCIÓN AUXILIAR: CÁLCULO DE PESOS (FUSIÓN GRADUAL) // ========================================== 
function calculatePhaseWeights(t) { 
  let w = [0, 0, 0, 0, 0];

  if (t < 60) { 
    w[0] = 1.0; 
  } else if (t < 120) { 
    let pct = (t - 60) / 60.0; 
    w[0] = 1.0 - pct; 
    w[1] = pct; 
  } else if (t < 240) { 
    w[1] = 1.0; 
  } else if (t < 300) { 
    let pct = (t - 240) / 60.0; 
    w[1] = 1.0 - pct; 
    w[2] = pct; 
  } else if (t < 600) { 
    w[2] = 1.0; 
  } else if (t < 660) { 
    let pct = (t - 600) / 60.0; 
    w[2] = 1.0 - pct; 
    w[3] = pct; 
  } else if (t < 840) { 
    w[3] = 1.0; 
  } else if (t < 900) { 
    let pct = (t - 840) / 60.0; 
    w[3] = 1.0 - pct; 
    w[4] = pct; 
  } else { 
    w[4] = 1.0; 
  } 
  return w; 
}

// ========================================== // FUNCIÓN AUXILIAR: PINCEL DE GRAVEDAD // ========================================== 
function applyGravityBrush(gx, gy) { 
  let outX = gx; 
  let outY = gy;

  let dMouse = dist(gx, gy, mouseX, mouseY); 
  let mouseVel = dist(mouseX, mouseY, pmouseX, pmouseY);

  if (dMouse < 220) { 
    let pullStrength = cos(map(dMouse, 0, 220, 0, HALF_PI)); 
    let slowFactor = map(mouseVel, 0, 14, 1.0, 0, true);

    let pullY = (mouseY - gy) * pullStrength * 0.3 * slowFactor;
    let pullX = (mouseX - gx) * pullStrength * 0.15 * slowFactor; 

    outY += pullY;
    outX += pullX;
  }

  return { x: outX, y: outY }; 
}

// ========================================== // FUNCIÓN AUXILIAR: ROTACIÓN DE COORDENADAS LOCALES A GLOBALES // ==========================================
function projectToGlobal(lx, ly, cx, cy, cosT, sinT) { 
  return { 
    x: cx + lx * cosT - ly * sinT, 
    y: cy + lx * sinT + ly * cosT 
  }; 
}

// ========================================== // FASE 1: EL INICIO - CÍRCULOS CONCÉNTRICOS 3D // ========================================== 
function drawSectionInicio(weight) { 
  noFill();

  let pingVol = waveFFT ? waveFFT.getEnergy(1500, 3200) : 0;

  let maxAgeFactor = 0; 
  for (let r of ripples) { 
    if (r.hitGround) { 
      let age = map(r.radius, 0, width * 0.8, 1.0, 0, true); 
      if (age > maxAgeFactor) maxAgeFactor = age; 
    } 
  }

  let darkAbisalBlue1 = color(10, 25, 65); 
  let darkAbisalBlue2 = color(5, 15, 45);
  let ultraBright1 = color(220, 245, 255); 
  let ultraBright2 = color(150, 210, 255);

  let colWater1 = lerpColor(darkAbisalBlue1, ultraBright1, maxAgeFactor); 
  let colWater2 = lerpColor(darkAbisalBlue2, ultraBright2, maxAgeFactor);

  let maxRadius = max(width, height) * 1.15; 
  let stepR = 10; 
  let cx = width / 2;
  let cy = height / 2;

  for (let r = 10; r < maxRadius; r += stepR) { 
    let ringIdx = floor(r / stepR);

    let blendedColor = (ringIdx % 2 === 0) ? colWater1 : colWater2;
    stroke(red(blendedColor), green(blendedColor), blue(blendedColor), 180 * weight);

    let weightBase = (ringIdx % 2 === 0) ? 1.6 : 1.1;
    let dynamicWeight = weightBase * (1.0 + pingVol / 120.0);
    strokeWeight(dynamicWeight);

    beginShape();
    for (let a = 0; a <= TWO_PI + 0.1; a += 0.08) {
      let xBase = cx + r * cos(a);
      let yBase = cy + r * sin(a) * 0.45; 
      
      let res = calculateInicioWaveAt(xBase, yBase);
      vertex(xBase, yBase + res.displacementY);
    }
    endShape();
  }

  for (let r of ripples) { 
    if (!r.hitGround) { 
      stroke(240, 250, 255, 180 * weight); 
      strokeWeight(3.0); 
      line(r.x, r.dropletY - 25, r.x, r.dropletY);

      fill(255, 255, 255, 255 * weight); 
      noStroke();
      ellipse(r.x, r.dropletY, 7, 12);
    }
  } 
}

function calculateInicioWaveAt(x, y) { 
  let totalDisplacementY = 0; 
  let maxAlpha = 0;

  for (let r of ripples) { 
    if (r.hitGround) { 
      let dx = x - r.x; 
      let dy = (y - r.y) / 0.45; 
      let dEllipse = sqrt(dx * dx + dy * dy);

      let baseScale = r.sizeScale || 1.0;
      let wavefrontWidth = (r.wavefrontWidth || 180) * baseScale;
      let distFromWavefront = abs(dEllipse - r.radius);
      
      if (distFromWavefront < wavefrontWidth) {
        let envelope = exp(-sq(distFromWavefront / (r.wavefrontWidth * 0.5)));
        
        let directionSign = r.counterCurrent ? 1 : -1;
        let waveValue = sin(dEllipse * 0.02 + directionSign * r.radius * 0.05);
        let ageFactor = map(r.radius, 0, width * 0.8, 1.0, 0, true);
        
        let rippleAmp = envelope * waveValue * 30 * ageFactor * baseScale; 
        totalDisplacementY += rippleAmp;
        
        maxAlpha = max(maxAlpha, envelope * ageFactor * 240);
      }
    }
  }

  return { displacementY: totalDisplacementY, alpha: maxAlpha }; 
}

// ========================================== // FASE 3: MÁSTIL DE FRECUENCIAS CILÍNDRICO 3D (REACTIVO CON ARO INTEGRADO) // ========================================== 
function drawSectionFunk(weight) {
  let centerX = width / 2;
  let centerY = height / 2;

  // Cámara de perspectiva de 135 FOV amplificado para consistencia visual
  let fovAngle = 135;
  let fovRad = radians(fovAngle);
  let focalDist = (width / 2) / tan(fovRad / 2);

  let numRods = 80;

  // Inicialización de alturas
  if (rodHeights.length === 0) {
    for (let i = 0; i < numRods; i++) {
      rodHeights.push(150);
    }
  }

  // --- CÁLCULO DE TRANSICIÓN CROMÁTICA Y REACTIVIDAD INCREMENTADA EN EL MEDIO DE LA FASE (450s) ---
  let midPhase3Progress = map(currentTime, 430, 470, 0.0, 1.0, true); // Transición suave centrada en 450s
  
  // Modulamos la inercia elástica (más rápida y nerviosa ante golpes)
  let lerpFactor = lerp(0.38, 0.68, midPhase3Progress);
  let minH = lerp(45, 20, midPhase3Progress);
  let maxH = lerp(410, 520, midPhase3Progress);

  // Mapeamos los colores mutantes a contracorriente
  let rodBaseCol = color(230, 25, 140);
  let rodTargetCol = color(255, 110, 0); // Columnas cambian a Naranja Eléctrico
  let currentRodCol = lerpColor(rodBaseCol, rodTargetCol, midPhase3Progress);

  let innerBaseCol = color(0, 255, 255);
  let innerTargetCol = color(190, 0, 255); // Aro áurico cambia a Violeta Profundo
  let currentInnerCol = lerpColor(innerBaseCol, innerTargetCol, midPhase3Progress);

  // 1. Obtener y suavizar las frecuencias del espectro FFT para cada mástil
  let spectrum = waveFFT.analyze();
  for (let i = 0; i < numRods; i++) {
    // Mapeamos los mástiles a los rangos más activos de graves y medios
    let specIdx = floor(map(i, 0, numRods, 4, spectrum.length * 0.25));
    let amp = spectrum[specIdx] || 0;

    // Reactividad diferenciada: hilos pares bailan con el Bass (bajo/batería) y los impares con el Mid (órgano/guitarras)
    let audioScale = (i % 2 === 0) ? (0.3 + currentBassScale * 0.7) : (0.3 + currentMidScale * 0.7);

    // Mayor dinamismo ampliando el rango de mapeo y picos de escala
    let targetH = map(amp, 5, 200, minH, maxH, true) * audioScale * phase3HeightMultiplier;
    
    // Filtro de interpolación lerp aumentado de forma dinámica para una respuesta muy pero muy movida
    rodHeights[i] = lerp(rodHeights[i], targetH, lerpFactor); 
  }

  // 2. Calcular coordenadas tridimensionales de las columnas cilíndricas
  let rodsData = [];
  for (let i = 0; i < numRods; i++) {
    let baseAngle = map(i, 0, numRods, 0, TWO_PI);
    let angle = baseAngle + spiralRotationAngle;

    // Radio del cilindro con pequeñas ondulaciones orgánicas de fondo
    let r = 380 + sin(baseAngle * 4 + flowTime * 2.0) * 40; 
    let rx = r * cos(angle);
    let rz = r * sin(angle) + 720; // Profundidad desplazada en el eje Z para coincidir con la fase 2

    rodsData.push({
      index: i,
      rx: rx,
      rz: rz,
      h: rodHeights[i]
    });
  }

  // 3. Ordenar mástiles de atrás hacia adelante (Z-Sorting / Painter's Algorithm) para oclusión 3D real
  rodsData.sort((a, b) => b.rz - a.rz);

  // 4. Renderizado ordenado
  for (let data of rodsData) {
    let rx = data.rx;
    let rz = data.rz;
    let i = data.index;
    let h = data.h;

    // Desvanecimiento de opacidad según profundidad
    let alpha = map(rz, 1100, 300, 75, 255, true) * weight;

    // Alturas de base (piso virtual) y punta en el eje Y
    let yBottom = 260;
    let yTop = 260 - h;

    // Proyecciones a 2D bajo el mismo foco que la Fase 2
    let pxBottom = centerX + (rx * focalDist) / rz;
    let pyBottom = centerY + (yBottom * focalDist) / rz;

    // Espesor del mástil en base a la cercanía (Z)
    let pxTop = centerX + (rx * focalDist) / rz;
    let pyTop = centerY + (yTop * focalDist) / rz;
    let rodWeight = map(rz, 300, 1100, 9.5, 2.2, true);

    // --- A. DIBUJAR COLUMNA VERTICAL DE SOPORTE (Pink/Magenta mutante) ---
    stroke(red(currentRodCol), green(currentRodCol), blue(currentRodCol), alpha);
    strokeWeight(rodWeight);
    line(pxBottom, pyBottom, pxTop, pyTop);

    // --- B. DIBUJAR ESFERAS METÁLICAS INTERMEDIAS DESLIZANTES ---
    // Esfera Roja Metálica al 35% de la altura
    let fracRed = 0.35 + sin(flowTime * 2.4 + i * 0.22) * 0.12;
    let yRed = lerp(yBottom, yTop, fracRed);
    let pyRed = centerY + (yRed * focalDist) / rz;
    drawMetallicSphere(pxBottom, pyRed, rodWeight * 1.8, color(255, 15, 35), alpha);

    // Esfera Dorada Metálica al 70% de la altura
    let fracGold = 0.70 + cos(flowTime * 1.8 - i * 0.16) * 0.15;
    let yGold = lerp(yBottom, yTop, fracGold);
    let pyGold = centerY + (yGold * focalDist) / rz;
    drawMetallicSphere(pxBottom, pyGold, rodWeight * 1.6, color(225, 175, 15), alpha);

    // --- C. DIBUJAR ESFERAS LUMINOSAS EN LAS PUNTAS ---
    drawGlowingSphere(pxTop, pyTop, rodWeight * 2.2, color(180, 255, 5), alpha);

    // --- D. CÍRCULO ÁURICO INTERNO CONTRACORRIENTE, MOUSE RECTIVO Y MUTANTE (OPTIMIZADO EN PROFUNDIDAD) ---
    let baseAngle = map(i, 0, numRods, 0, TWO_PI);
    // Giro inverso a contracorriente restando el ángulo de giro acumulado
    let angle_in = baseAngle - spiralRotationAngle;

    // Radio menor de círculo interno áurico reactivo al Bass (bajo/batería)
    let r_in = (150 + sin(baseAngle * 4.0 - flowTime * 2.0) * 20) * (0.8 + currentBassScale * 0.35);
    let rx_in = r_in * cos(angle_in);
    let rz_in = r_in * sin(angle_in) + 720;

    // Altura vertical del anillo interno reactivo al rango de medios (melodía)
    // Sincronizado para desplazarse en contracorriente física hacia abajo cuando arrastras verticalmente el mouse
    let y_in = 260 + (phase3HeightMultiplier - 1.0) * 180 - (100 + currentMidScale * 125);

    let px_in = centerX + (rx_in * focalDist) / rz_in;
    let py_in = centerY + (y_in * focalDist) / rz_in;

    let dSize_in = map(rz_in, 300, 1100, 8, 2.5, true);
    let alpha_in = map(rz_in, 1100, 300, 60, 240, true) * weight;

    // Brillo áurico con color mutante cian/violeta de alta fidelidad
    noStroke();
    fill(red(currentInnerCol), green(currentInnerCol), blue(currentInnerCol), alpha_in * 0.35); // Halo exterior suave
    ellipse(px_in, py_in, dSize_in * 2.2);

    fill(red(currentInnerCol) + 30, green(currentInnerCol) + 30, blue(currentInnerCol) + 30, alpha_in); // Núcleo brillante
    ellipse(px_in, py_in, dSize_in * 1.0);

    fill(255, alpha_in); // Brillo especular
    ellipse(px_in - dSize_in * 0.2, py_in - dSize_in * 0.2, dSize_in * 0.4);
  }
}

// Pintor de esferas metálicas con sombreado y brillos especulares vectoriales de alta velocidad
function drawMetallicSphere(x, y, size, col, alpha) {
  push();
  noStroke();
  // Sombra base de la esfera
  fill(red(col) * 0.4, green(col) * 0.4, blue(col) * 0.4, alpha);
  ellipse(x, y, size);

  // Cuerpo de la esfera
  fill(red(col), green(col), blue(col), alpha);
  ellipse(x, y, size * 0.95);

  // Brillo de luz especular (efecto de volumen 3D)
  fill(255, alpha);
  ellipse(x - size * 0.22, y - size * 0.22, size * 0.32);
  pop();
}

// Pintor de esferas luminiscentes/neón con halo de resplandor
function drawGlowingSphere(x, y, size, col, alpha) {
  push();
  noStroke();
  // Halo exterior traslúcido
  fill(red(col), green(col), blue(col), alpha * 0.28);
  ellipse(x, y, size * 1.5);

  // Núcleo de color sólido
  fill(red(col), green(col), blue(col), alpha);
  ellipse(x, y, size);

  // Centro blanco brillante de incandescencia
  fill(255, alpha);
  ellipse(x, y, size * 0.45);
  pop();
}

// ========================================== // REDISEÑO FASE 2: POV DILATADO VECTORIAL RETROWAVE GRID // ========================================== 
function drawSectionGroove(weight) {
  let centerX = width / 2;
  let centerY = height / 2; // Línea de horizonte central

  // Configuración de proyección física real de 135 Grados de FOV modulada por el latido
  let fovAngle = 135;
  let fovRad = radians(fovAngle);
  let focalDist = (width / 2) / tan(fovRad / 2);
  let dynamicFocalDist = focalDist * phase2FocalPulse; // Aplicamos el latido focal palpitante

  // Interpolación de colores interactivos al hacer clic en el Sol
  currentSunCol = lerpColor(currentSunCol, targetSunCol, 0.06);
  currentColA = lerpColor(currentColA, targetColA, 0.06);
  currentColB = lerpColor(currentColB, targetColB, 0.06);

  noFill();

  // --- 1. SOL RETRO EN EL HORIZONTE (Fondo infinito) ---
  drawHorizonSun(centerX, centerY, weight);

  // Control del movimiento hacia adelante continuo del escenario
  let speed = 5.5 * currentRate;
  let zOffset = (frameCount * speed) % 80;

  // --- 2. DIBUJAR LÍNEAS HORIZONTALES (GRID DE PROFUNDIDAD EN PERSPECTIVA) ---
  let zStep = 80;
  for (let z = 1200 - zOffset; z >= 130; z -= zStep) {
    let alpha = map(z, 1200, 400, 0, 230, true) * weight;
    strokeWeight(map(z, 1200, 130, 0.75, 2.55));

    // REJILLA DE TIERRA (GROUND)
    stroke(red(currentColA), green(currentColA), blue(currentColA), alpha);
    beginShape();
    for (let x = -2000; x <= 2000; x += 80) {
      let yHeight = calculateRetrowaveHeight(x, z);
      let px = centerX + (x * dynamicFocalDist) / z;
      let py = centerY + ((180 - yHeight) * dynamicFocalDist) / z;
      vertex(px, py);
    }
    endShape();

    // REJILLA DE CIELO (SKY)
    stroke(red(currentColB), green(currentColB), blue(currentColB), alpha * 0.7);
    beginShape();
    for (let x = -2000; x <= 2000; x += 80) {
      let yHeight = calculateRetrowaveHeight(x, z);
      let px = centerX + (x * dynamicFocalDist) / z;
      let py = centerY + ((-180 + yHeight * 0.6) * dynamicFocalDist) / z;
      vertex(px, py);
    }
    endShape();
  }

  // --- 3. DIBUJAR LÍNEAS LONGITUDINALES ---
  for (let x = -2000; x <= 2000; x += 250) {
    let alpha = 130 * weight;

    // LÍNEAS RADIALES DE TIERRA
    stroke(red(currentColB), green(currentColB), blue(currentColB), alpha);
    beginShape();
    for (let z = 1200 - zOffset; z >= 130; z -= 40) {
      strokeWeight(map(z, 1200, 130, 0.75, 2.2));
      let yHeight = calculateRetrowaveHeight(x, z);
      let px = centerX + (x * dynamicFocalDist) / z;
      let py = centerY + ((180 - yHeight) * dynamicFocalDist) / z;
      vertex(px, py);
    }
    endShape();

    // LÍNEAS RADIALES DE CIELO
    stroke(red(currentColA), green(currentColA), blue(currentColA), alpha * 0.5);
    beginShape();
    for (let z = 1200 - zOffset; z >= 130; z -= 40) {
      strokeWeight(map(z, 1200, 130, 0.75, 2.2));
      let yHeight = calculateRetrowaveHeight(x, z);
      let px = centerX + (x * dynamicFocalDist) / z;
      let py = centerY + ((-180 + yHeight * 0.6) * dynamicFocalDist) / z;
      vertex(px, py);
    }
    endShape();
  }
}

// Calcula la Deformación del Terreno
function calculateRetrowaveHeight(x, z) {
  let valleyFactor = map(abs(x), 0, 450, 0, 1.0, true);
  let roadWidthCurve = pow(valleyFactor, 2.5); 

  let waveBass = sin(x * 0.003 - flowTime * 1.5) * cos(z * 0.004) * 60 * currentBassScale;
  let waveMid = cos(x * 0.007 + flowTime * 0.8) * sin(z * 0.008) * 28 * currentMidScale;
  let waveTreble = sin(x * 0.02 - flowTime * 3.5) * 8 * currentTrebleScale;

  let noiseFloor = (noise(x * 0.002, z * 0.003 + flowTime * 0.08) - 0.5) * 45;

  let rawHeight = (waveBass + waveMid + waveTreble + noiseFloor) * roadWidthCurve;

  let fovAngle = 120;
  let fovRad = radians(fovAngle);
  let focalDist = (width / 2) / tan(fovRad / 2);
  let dynamicFocalDist = focalDist * phase2FocalPulse; // Sincronizado con el latido
  let px = width / 2 + (x * dynamicFocalDist) / z;
  let py = height / 2 + ((180 - rawHeight) * dynamicFocalDist) / z;

  let dMouse = dist(px, py, mouseX, mouseY);
  if (dMouse < 220) {
    let mouseForce = map(dMouse, 0, 220, 1.0, 0, true) * gravityInfluence * 70;
    rawHeight += mouseForce * sin(x * 0.01 - flowTime * 2.0);
  }

  return rawHeight;
}

// Dibuja el horizonte y el sol degradado clásico de Retrowave con cortes 3D curvos
function drawHorizonSun(cx, cy, weight) {
  // El horizonte ahora vibra y cambia de color en armonía con el lienzo general
  stroke(red(currentSunCol), green(currentSunCol), blue(currentSunCol), 180 * weight);
  strokeWeight(3.0);
  line(0, cy, width, cy);

  push();
  noStroke();
  let sunSize = min(width, height) * 0.22;
  let dynamicSunSize = sunSize * (0.85 + currentBassScale * 0.15);
  
  for (let r = 4; r > 0; r--) {
    let alpha = map(r, 0, 4, 3, 38) * weight;
    fill(red(currentSunCol), green(currentSunCol), blue(currentSunCol), alpha);
    ellipse(cx, cy, dynamicSunSize + r * 15);
  }
  
  fill(red(currentSunCol), green(currentSunCol), blue(currentSunCol), 230 * weight);
  ellipse(cx, cy, dynamicSunSize);
  
  // Cortes de franjas horizontales clásicas del sol retro con degradado curvo 3D
  for (let sy = cy - dynamicSunSize / 2; sy < cy + dynamicSunSize / 2; sy += 12) {
    let sliceHeight = map(sy, cy - dynamicSunSize / 2, cy + dynamicSunSize / 2, 1, 7);
    
    let dySun = sy - cy;
    let rSun = dynamicSunSize / 2;
    let halfWidth = 0;
    if (rSun * rSun > dySun * dySun) {
      halfWidth = sqrt(rSun * rSun - dySun * dySun);
    }
    
    // Gradiente horizontal que se difumina en los costados de la circunferencia
    let sliceGrad = drawingContext.createLinearGradient(cx - halfWidth, sy, cx + halfWidth, sy);
    sliceGrad.addColorStop(0.0, "rgba(0, 0, 0, 0.0)");
    sliceGrad.addColorStop(0.15, "rgba(0, 0, 0, 0.85)");
    sliceGrad.addColorStop(0.5, "rgba(0, 0, 0, 1.0)");
    sliceGrad.addColorStop(0.85, "rgba(0, 0, 0, 0.85)");
    sliceGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    
    drawingContext.fillStyle = sliceGrad;
    rect(cx - halfWidth - 5, sy, halfWidth * 2 + 10, sliceHeight);
  }
  pop();
}

// ========================================== // REDISEÑO TOTAL FASE 4: EL VACÍO / CAJA DE ONDAS 3D CON GRAVEDAD SUCCIONANTE POTENTE // ========================================== 
function drawSectionVacio(weight) { 
  let centerX = width / 2;
  let centerY = height / 2;

  // Cámara de perspectiva de 135 FOV estable
  let fovAngle = 135;
  let fovRad = radians(fovAngle);
  let focalDist = (width / 2) / tan(fovRad / 2);

  // Inicialización de rayos prismáticos de fondo
  if (!initializedLightRays) {
    lightRays = [];
    for (let i = 0; i < 10; i++) {
      lightRays.push({
        seed: random(1000),
        x: random(width * 0.15, width * 0.85),
        y: random(height * 0.1, height * 0.8),
        angle: random(32, 60), 
        width: random(130, 320), 
        length: random(width * 0.85, width * 1.6),
        speedX: random(-0.35, 0.35),
        speedY: random(-0.15, 0.15),
        colorShift: random(TWO_PI)
      });
    }
    initializedLightRays = true;
  }

  // Rastreamos los alaridos agudos de Echoes (1200 Hz a 3800 Hz)
  let shriekVolume = waveFFT.getEnergy(1200, 3800);
  let shriekFactor = map(shriekVolume, 45, 175, 0.0, 1.0, true);

  // --- 1. FONDO DE AURORAS DE COLOR INTENSO Y REACTIVO AL TONO (ROJO TENUE A COLORES NEÓN) ---
  push();
  let gradBg = drawingContext.createRadialGradient(centerX, centerY, 50, centerX, centerY, min(width, height) * 0.7);
  
  // Estado base en silencio (Rojo tenue a negro)
  colorMode(RGB, 255, 255, 255, 255);
  let baseBgCol1 = color(30, 2, 4); // Faint dark red
  let baseBgCol2 = color(0, 0, 0);   // Black abisal
  
  // Tono dinámico intenso derivado de la mezcla de agudos de Gilmour (HSB)
  let shriekPitch = map(waveFFT.getEnergy("highMid"), 0, 255, 0, 1);
  let shriekPitchTreble = map(waveFFT.getEnergy("treble"), 0, 255, 0, 1);
  let activeHue = (345 + shriekPitch * 110 + shriekPitchTreble * 190) % 360; // Tono neón vibrante cambiante
  
  colorMode(HSB, 360, 100, 100, 1);
  let peakBgCol1 = color(activeHue, 95, 90, 0.45);
  let peakBgCol2 = color((activeHue + 60) % 360, 95, 40, 0.15);
  colorMode(RGB, 255, 255, 255, 255); // Retorno a RGB estable
  
  // Interpolación gradual de color y brillo según la guitarra de Gilmour
  let bgCol1 = lerpColor(baseBgCol1, peakBgCol1, shriekFactor * weight);
  let bgCol2 = lerpColor(baseBgCol2, peakBgCol2, shriekFactor * weight);
  
  gradBg.addColorStop(0.0, "rgba(" + red(bgCol1) + ", " + green(bgCol1) + ", " + blue(bgCol1) + ", 0.55)");
  gradBg.addColorStop(0.5, "rgba(" + red(bgCol2) + ", " + green(bgCol2) + ", " + blue(bgCol2) + ", 0.2)");
  gradBg.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  
  drawingContext.fillStyle = gradBg;
  rect(0, 0, width, height);
  pop();

  for (let r of lightRays) {
    r.x += r.speedX * currentRate;
    r.y += r.speedY * currentRate;

    if (r.x < -200) r.x = width + 200;
    if (r.x > width + 200) r.x = -200;
    if (r.y < -200) r.y = height + 200;
    if (r.y > height + 200) r.y = -200;

    let individualFactor = noise(r.seed, frameCount * 0.015) * shriekFactor;
    let rayAlpha = individualFactor * 65 * shriekFactor * weight; // Oscurecido y reactivo

    if (rayAlpha > 0.5) {
      push();
      noStroke();

      let rad = radians(r.angle);
      let perpRad = rad + HALF_PI;
      let halfW = r.width / 2;

      let gx1 = r.x - cos(perpRad) * halfW;
      let gy1 = r.y - sin(perpRad) * halfW;
      let gx2 = r.x + cos(perpRad) * halfW;
      let gy2 = r.y + sin(perpRad) * halfW;

      let grad = drawingContext.createLinearGradient(gx1, gy1, gx2, gy2);
      let shift = r.colorShift + flowTime * 0.22;
      let c1 = getSpectralColor(shift + 0.0, rayAlpha);
      let c2 = getSpectralColor(shift + 0.16, rayAlpha);
      let c3 = getSpectralColor(shift + 0.32, rayAlpha);
      let c4 = getSpectralColor(shift + 0.48, rayAlpha);
      let c5 = getSpectralColor(shift + 0.64, rayAlpha);
      let c6 = getSpectralColor(shift + 0.80, rayAlpha);

      grad.addColorStop(0.0, "rgba(0, 0, 0, 0.0)");
      grad.addColorStop(0.2, c1);
      grad.addColorStop(0.35, c2);
      grad.addColorStop(0.5, c3);
      grad.addColorStop(0.65, c4);
      grad.addColorStop(0.8, c5);
      grad.addColorStop(0.9, c6);
      grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

      let rx1 = r.x - cos(rad) * (r.length / 2);
      let ry1 = r.y - sin(rad) * (r.length / 2);
      let rx2 = r.x + cos(rad) * (r.length / 2);
      let ry2 = r.y - sin(rad) * (r.length / 2);

      let x1 = rx1 - cos(perpRad) * halfW;
      let y1 = ry1 - sin(perpRad) * halfW;
      let x2 = rx1 + cos(perpRad) * halfW;
      let y2 = ry1 + sin(perpRad) * halfW;
      let x3 = rx2 + cos(perpRad) * halfW;
      let y3 = ry2 + sin(perpRad) * halfW;
      let x4 = rx2 - cos(perpRad) * halfW;
      let y4 = ry2 - sin(perpRad) * halfW;

      drawingContext.fillStyle = grad;
      beginShape();
      vertex(x1, y1);
      vertex(x2, y2);
      vertex(x3, y3);
      vertex(x4, y4);
      endShape(CLOSE);
      pop();
    }
  }

  // --- 2. CAJA TRIDIMENSIONAL DE ONDAS OSCURAS (Hipercubo deformado) ---
  let slices = [-180, -90, 0, 90, 180];
  let linesToDraw = [];

  // Recopilamos todas las líneas de la caja 3D en base al helper de proyección y succión
  // Líneas alineadas en el eje X
  for (let y of slices) {
    for (let z of slices) {
      let pts = [];
      let sumZ = 0;
      for (let x = -180; x <= 180; x += 45) {
        let pt = processPoint(x, y, z, shriekFactor, centerX, centerY, focalDist);
        pts.push(pt);
        sumZ += pt.z;
      }
      linesToDraw.push({ pts: pts, avgZ: sumZ / pts.length });
    }
  }

  // Líneas alineadas en el eje Y
  for (let x of slices) {
    for (let z of slices) {
      let pts = [];
      let sumZ = 0;
      for (let y = -180; y <= 180; y += 45) {
        let pt = processPoint(x, y, z, shriekFactor, centerX, centerY, focalDist);
        pts.push(pt);
        sumZ += pt.z;
      }
      linesToDraw.push({ pts: pts, avgZ: sumZ / pts.length });
    }
  }

  // Líneas alineadas en el eje Z
  for (let x of slices) {
    for (let y of slices) {
      let pts = [];
      let sumZ = 0;
      for (let z = -180; z <= 180; z += 45) {
        let pt = processPoint(x, y, z, shriekFactor, centerX, centerY, focalDist);
        pts.push(pt);
        sumZ += pt.z;
      }
      linesToDraw.push({ pts: pts, avgZ: sumZ / pts.length });
    }
  }

  // Ordenamiento de profundidad real en Z (Painter's Algorithm)
  linesToDraw.sort((a, b) => b.avgZ - a.avgZ);

  // Renderizado de oclusión en función de la profundidad real de la pelota (650 + phase4SphereZ)
  let sphereZDepth = 650 + phase4SphereZ;
  let sphereDrawn = false;
  noFill();

  for (let lineItem of linesToDraw) {
    // Cuando el sistema pasa a renderizar líneas frontales, dibuja la pelota en sus coordenadas dinámicas
    if (!sphereDrawn && lineItem.avgZ < sphereZDepth) {
      let spX = centerX + (phase4SphereX * focalDist) / sphereZDepth;
      let spY = centerY + (phase4SphereY * focalDist) / sphereZDepth;
      drawCentralRedSphere(spX, spY, shriekFactor, weight, sphereZDepth);
      sphereDrawn = true;
    }

    // Grosor y opacidad reducidos (Haz de líneas más oscuras y finas)
    let sw = map(lineItem.avgZ, 470, 830, 2.0, 0.6, true);
    let alphaLine = map(lineItem.avgZ, 470, 830, 140, 30, true) * weight;

    // La jaula de hilos tiene una base un poco más notoria como solicitaste y cambia de color según el tiempo
    let phase4Progress = map(currentTime, 600, 840, 0.0, 1.0, true);
    
    // El color por defecto cambia de gris carbón a un violeta brillante
    let baseGridColor = lerpColor(color(50, 52, 58), color(130, 80, 255), phase4Progress);
    
    // El color activo en los alaridos de guitarra cambia de rojo a un cian eléctrico brillante
    let targetGridColor = lerpColor(color(255, 20, 30), color(0, 255, 240), phase4Progress);
    
    let gridColor = lerpColor(baseGridColor, targetGridColor, shriekFactor);

    stroke(red(gridColor), green(gridColor), blue(gridColor), alphaLine);
    strokeWeight(sw);

    beginShape();
    for (let pt of lineItem.pts) {
      vertex(pt.x, pt.y);
    }
    endShape();
  }

  if (!sphereDrawn) {
    let spX = centerX + (phase4SphereX * focalDist) / sphereZDepth;
    let spY = centerY + (phase4SphereY * focalDist) / sphereZDepth;
    drawCentralRedSphere(spX, spY, shriekFactor, weight, sphereZDepth);
  }
}

// Función helper que deforma, rota, proyecta y aplica la succión gravitacional directamente en espacio de cámara global rotado
function processPoint(x, y, z, shriekFactor, centerX, centerY, focalDist) {
  // 1. Deformación base del hipercubo/telaraña
  let d = sqrt(x * x + y * y + z * z);
  let bulge = 1.0 + pow(d / 220, 2) * 0.45;
  let wx = x * bulge;
  let wy = y * bulge;
  let wz = z * bulge;

  // Expansión volumétrica incrementada de la jaula según los gritos de la guitarra (INCREMENTADA para reaccionar más)
  let shriekExpansion = 1.0 + shriekFactor * 0.75;
  wx *= shriekExpansion;
  wy *= shriekExpansion;
  wz *= shriekExpansion;

  // Distorsión de Estrella: deformación asimétrica y puntiaguda incrementada
  if (shriekFactor > 0.01) {
    let angleX = atan2(wy, wx);
    let angleY = atan2(wz, wy);
    
    // Succión geométrica de estrella con mayor relieve
    let starSpikes = 1.0 + sin(angleX * 5.0) * 0.6 * shriekFactor;
    let starSpikesY = 1.0 + cos(angleY * 5.0) * 0.6 * shriekFactor;
    
    wx *= starSpikes;
    wy *= starSpikesY;
    wz *= starSpikes;

    // Vibración asimétrica más rápida y caótica de transición (Fase 5)
    wx += sin(x * 0.08 + flowTime * 14.0) * 55 * shriekFactor;
    wy += cos(y * 0.08 + flowTime * 14.0) * 55 * shriekFactor;
    wz += sin(z * 0.08 + flowTime * 14.0) * 55 * shriekFactor;
  }

  // 2. Rotación en 3D lenta y espeluznante
  let rot = rotate3D(wx, wy, wz, flowTime * 0.12, flowTime * 0.18);

  // 3. SUCCIÓN GRAVITATORIA DE AGUJERO NEGRO (Calculada con precisión sobre el espacio rotado global)
  let rx = rot.x;
  let ry = rot.y;
  let rz = rot.z;

  let dx = phase4SphereX - rx;
  let dy = phase4SphereY - ry;
  let dz = phase4SphereZ - rz;
  let distToSphere = sqrt(dx * dx + dy * dy + dz * dz);
  let gravityRadius = 450; // Amplio rango de alcance succionador

  if (distToSphere < gravityRadius) {
    let pull = map(distToSphere, 0, gravityRadius, 1.2, 0, true);
    pull = pow(pull, 1.5); // Curva de absorción gravitacional profunda
    
    // Fuerza gravitacional masiva al arrastrar directamente con el mouse
    let activePull = phase4SphereGrabbed ? 2.6 : 1.2;
    
    rx += dx * pull * 0.65 * activePull;
    ry += dy * pull * 0.65 * activePull;
    rz += dz * pull * 0.65 * activePull;
  }

  // 4. Proyección física a 2D
  let finalZ = rz + 650;
  if (finalZ < 110) finalZ = 110;
  let px = centerX + (rx * focalDist) / finalZ;
  let py = centerY + (ry * focalDist) / finalZ;

  return { x: px, y: py, z: finalZ };
}

// Rotador vectorial en 3D para la orientación de la caja
function rotate3D(x, y, z, angleX, angleY) {
  let cosX = cos(angleX);
  let sinX = sin(angleX);
  let y1 = y * cosX - z * sinX;
  let z1 = y * sinX + z * cosX;

  let cosY = cos(angleY);
  let sinY = sin(angleY);
  let x2 = x * cosY + z1 * sinY;
  let z2 = -x * sinY + z1 * cosY;

  return { x: x2, y: y1, z: z2 };
}

// Renderizador del sol/pelota de tensión central con degradado radial 3D perfectamente difuminado y fluido
function drawCentralRedSphere(cx, cy, shriekFactor, weight, z) {
  push();
  noStroke();

  // Escalamiento del diámetro real en base a su profundidad Z en la proyección
  let baseSize = map(z, 300, 1100, 75, 20, true);
  let dynamicSunSize = baseSize * (0.8 + shriekFactor * 1.6);

  // --- CÁLCULO DE TRANSICIÓN CROMÁTICA A TONOS FRÍOS (Fase 4 progress) ---
  let phase4Progress = map(currentTime, 600, 840, 0.0, 1.0, true); // Progresión temporal en la fase 4
  
  // El destello muta de rojo incandescente a cian/azul glacial como pediste
  let peakRed = color(255, 12, 18);
  let peakCool = color(0, 215, 255); // Cian/Azul neón brillante
  let peakTarget = lerpColor(peakRed, peakCool, phase4Progress);

  // El color de reposo muta de rojo opaco a índigo profundo
  let baseRed = color(78, 6, 10);
  let baseCool = color(10, 5, 60); // Índigo/Púrpura oscuro abisal
  let baseTarget = lerpColor(baseRed, baseCool, phase4Progress);

  let col = lerpColor(baseTarget, peakTarget, shriekFactor);

  // 1. HALO / RESPLANDOR RADIAL FLUIDO SIN BANDAS (Con fov/profundidad - PERFECTAMENTE DIFUMINADO)
  let glowRadius = dynamicSunSize * 2.5;
  let glowGrad = drawingContext.createRadialGradient(cx, cy, dynamicSunSize * 0.05, cx, cy, glowRadius);
  
  let glowAlpha = map(shriekFactor, 0, 1, 0.12, 0.95) * weight;
  
  // Transición suave de múltiples capas de color difuso usando la paleta de tonos fríos
  glowGrad.addColorStop(0.0, "rgba(" + red(col) + ", " + green(col) + ", " + blue(col) + ", " + glowAlpha + ")");
  glowGrad.addColorStop(0.2, "rgba(" + (red(col)*0.8) + ", " + (green(col)*0.8) + ", " + (blue(col)*0.8) + ", " + (glowAlpha * 0.45) + ")");
  glowGrad.addColorStop(0.6, "rgba(" + (red(col)*0.4) + ", " + (green(col)*0.4) + ", " + (blue(col)*0.4) + ", " + (glowAlpha * 0.1) + ")");
  glowGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  
  drawingContext.fillStyle = glowGrad;
  ellipse(cx, cy, glowRadius * 2);

  // 2. Núcleo base (En silencio brilla apenas con un tono de tensión muy tenue)
  let coreAlpha = map(shriekFactor, 0, 1, 45, 255) * weight; // Apenas visible en silencio
  fill(red(col), green(col), blue(col), coreAlpha);
  ellipse(cx, cy, dynamicSunSize);

  // 3. Núcleo incandescente súper brillante (Punto blanco que genera el destello ciego)
  if (shriekFactor > 0.1) {
    fill(255, 242, 245, shriekFactor * 255 * weight);
    ellipse(cx, cy, dynamicSunSize * 0.6);
  }
  pop();
}

// Generador de colores espectrales cíclicos para simular la aberración del prisma
function getSpectralColor(phase, alpha) {
  let r = floor(127 + 127 * cos(TWO_PI * (phase + 0.0)));
  let g = floor(127 + 127 * cos(TWO_PI * (phase + 0.33)));
  let b = floor(127 + 127 * cos(TWO_PI * (phase + 0.67)));
  return "rgba(" + r + ", " + g + ", " + b + ", " + (alpha / 255) + ")";
}

// ========================================== // FASE 5: EL RENACIMIENTO - HILOS REACTIVOS Y ESPIRAL DE FIBONACCI (CLÍMAX) // ========================================== 
function drawSectionRenacimiento(weight) { 
  let centerX = width / 2;
  let centerY = height / 2;

  colorMode(HSB, 360, 100, 100, 1); 
  noFill();

  // Factor de progresión final a partir del minuto 17:20 (1040 segundos) - Un minuto antes como solicitaste
  let spiralProgress = map(currentTime, 1040, 1400, 0.0, 1.0, true);

  for (let y = -20; y < height + 20; y += yStepRenacimiento) { 
    let rowIdx = floor((y + 20) / yStepRenacimiento); 
    
    // Transición de colores lenta y progresiva (lerp) hacia la paleta fría de la referencia (Cian, Azul, Púrpura, Rosa)
    let hueVal;
    if (spiralProgress > 0) {
      let baseHue = (rowIdx * 3 + frameCount * 0.2) % 360;
      let coolHue = map(sin(baseHue * 0.05), -1, 1, 190, 310); // Espectro de HSB frío (190° - 310°)
      let warmHue = (rowIdx * 5 + frameCount * 0.5) % 360;
      
      // Interpolación suave y progresiva lerp para evitar cambios de color de golpe
      hueVal = lerp(warmHue, coolHue, spiralProgress); 
    } else {
      hueVal = (rowIdx * 5 + frameCount * 0.5) % 360;
    }

    let prevX = null;
    let prevY = null;

    // Renderizado por segmentos pequeños para permitir la iluminación y grosor variable ante el paso de ondas
    for (let x = -150; x <= width + 150; x += xStep) {
      let res = calculateRenacimientoWaveAt(x, y);

      let finalX = x;
      let finalY = y + res.displacementY;

      // Deformación de espiral logarítmica de Fibonacci reactiva a la canción para el clímax final (según la referencia)
      if (spiralProgress > 0) {
        // La velocidad de giro y rotación de la espiral reaccionan dinámicamente al volumen general de la canción
        let baseAngle = map(x, -150, width + 150, 0, TWO_PI * 5.0) + spiralRotationAngle * (1.0 + waveLevel * 1.5);
        
        // El radio de expansión de Fibonacci pulsa directamente al compás de los graves (Bass)
        let r = map(y, -20, height + 20, 20, max(width, height) * 0.85) * (0.8 + currentBassScale * 0.3);
        r += res.displacementY * 0.5; // Modulamos el radio con la distorsión del audio

        let spiralX = centerX + r * cos(baseAngle + log(r) * 0.45);
        let spiralY = centerY + r * sin(baseAngle + log(r) * 0.45) * 0.75; // ligeramente achatado en Y

        // Fusión lenta de la rejilla horizontal hacia la espiral infinita de Fibonacci
        finalX = lerp(x, spiralX, spiralProgress);
        finalY = lerp(y + res.displacementY, spiralY, spiralProgress);
      }

      // Dibujamos el segmento de línea
      if (prevX !== null) {
        // Brillo interactivo (emula Fase 1): las ondas generadas al hacer clic aumentan la opacidad y grosor temporalmente (sin deformación física)
        let edgeAlpha = map(res.alpha, 0.45, 1.0, 0.45, 1.0);
        let strokeW = map(res.alpha, 0.45, 1.0, 1.5, 4.0);

        stroke(hueVal, 85, 100, edgeAlpha * weight);
        strokeWeight(strokeW);
        line(prevX, prevY, finalX, finalY);
      }

      prevX = finalX;
      prevY = finalY;
    }
  }

  colorMode(RGB, 255, 255, 255, 255); 
}

// Las ondas de los hilos ahora reaccionan en perfecta armonía matemática con el ecualizador de Echoes
function calculateRenacimientoWaveAt(x, y) { 
  let totalDisplacementY = 0; 
  let maxAlpha = 0;

  // Evaluamos las ondas concéntricas generadas interactivamente por clics (Solo emiten brillo y grosor, eliminada la deformación de salto)
  for (let r of ripples) { 
    if (r.hitGround) { 
      let d = dist(x, y, r.x, r.y); 
      let distFromWavefront = abs(d - r.radius); 
      if (distFromWavefront < r.wavefrontWidth) { 
        let envelope = exp(-sq(distFromWavefront / (r.wavefrontWidth * 0.5))); 
        let ageFactor = map(r.radius, 0, width * 1.6, 1.0, 0, true); 
        maxAlpha = max(maxAlpha, envelope * ageFactor); 
      } 
    } 
  }

  // Capas musicales de fondo que se agitan al compás de Echoes
  let wave1 = sin(x * 0.005 - flowTime * 1.2) * cos(y * 0.006 + flowTime * 0.5) * 85 * currentBassScale;
  let wave2 = cos(x * 0.012 + flowTime * 0.8) * sin(y * 0.015 - flowTime * 0.4) * 35 * currentMidScale;
  let wave3 = sin(x * 0.035 - flowTime * 2.0) * 12 * currentTrebleScale;

  let noiseVal = (noise(x * 0.0025, y * 0.0025, flowTime * 0.1) - 0.5) * 45;

  totalDisplacementY += wave1 + wave2 + wave3 + noiseVal;
  maxAlpha = max(maxAlpha, 0.45); // Brillo base neutral

  return { displacementY: totalDisplacementY, alpha: maxAlpha }; 
}

// ========================================== // SISTEMA AUXILIAR Y CONTROLES // ========================================== 
function spawnRipple(customX, customY, forceSquare) { 
  if (ripples.length > MAX_RIPPLES) { 
    ripples.shift(); 
  }

  let nx, ny, nw;

  if (currentTime < 120) { 
    if (totalRipplesSpawned === 0) { 
      nx = width / 2; ny = height / 2; 
    } else { 
      nx = customX !== undefined ? customX : random(width * 0.15, width * 0.85); 
      ny = customY !== undefined ? customY : random(height * 0.15, height * 0.85); 
    } 
    nw = random(120, 240); 
  } else { 
    nx = customX !== undefined ? customX : (width / 2 + random(-width/5, width/5)); 
    ny = customY !== undefined ? customY : (height / 2 + random(-height/5, height/5)); 
    nw = 280;
  }

  let instant = (currentTime >= 60) || (grabbedRowIdx !== -1);

  ripples.push({ 
    id: frameCount + floor(random(1000)), x: nx, y: ny, radius: 0,
    speed: random(1.8, 3.2), wavefrontWidth: nw, dropletY: ny - 180, dropletSpeed: 25,
    hitGround: instant, counterCurrent: random(1) < 0.35, sizeScale: random(0.55, 1.85), 
    isSquare: forceSquare || false 
  });

  totalRipplesSpawned++; 
}

// HUD simplificado que únicamente muestra el nombre de la fase activa o su transición de forma minimalista
function drawHUD(timeSec) { 
  let phaseName = ""; 
  if (timeSec < 60) phaseName = "Fase 1"; 
  else if (timeSec < 120) phaseName = "Fase 1 -> 2"; 
  else if (timeSec < 240) phaseName = "Fase 2"; 
  else if (timeSec < 300) phaseName = "Fase 2 -> 3"; 
  else if (timeSec < 600) phaseName = "Fase 3"; 
  else if (timeSec < 660) phaseName = "Fase 3 -> 4"; 
  else if (timeSec < 840) phaseName = "Fase 4"; 
  else if (timeSec < 900) phaseName = "Fase 4 -> 5"; 
  else phaseName = "Fase 5";

  fill(255, 120); 
  noStroke(); 
  textAlign(LEFT, BOTTOM); 
  textSize(14);
  textFont('Courier New'); 
  text(phaseName, 20, height - 20); 
}

function keyPressed() { 
  if (waveSong && waveSong.isLoaded()) { 
    if (key === '1') waveSong.jump(1);
    if (key === '2') waveSong.jump(121);
    if (key === '3') waveSong.jump(301); 
    if (key === '4') waveSong.jump(661);
    if (key === '5') waveSong.jump(901);

    // Pausar y reanudar con la barra espaciadora
    if (key === ' ') {
      if (waveSong.isPlaying()) {
        waveSong.pause();
      } else {
        waveSong.play();
      }
    }
  } 
}

function mousePressed() { 
  pressX = mouseX; 
  isDragging = true;

  grabbedRowIdx = -1; 
  grabbedLayerIdx = -1; 

  // --- INTERACCIÓN CON EL SOL (Fase 2) ---
  let inPhase2 = (currentTime >= 60 && currentTime < 300);
  if (inPhase2) {
    let cx = width / 2;
    let cy = height / 2;
    let sunSize = min(width, height) * 0.22;
    let d = dist(mouseX, mouseY, cx, cy);

    // Detección de clics sobre el sol ampliada para facilidad de uso táctil
    if (d < sunSize * 0.95) {
      // Generamos un esquema de color complementario vibrante y aleatorio en cada clic
      colorMode(HSB, 360, 100, 100, 1);
      
      let hSun = random(360);
      let hA = (hSun + random(100, 260)) % 360;  // Garantiza alto contraste de color
      let hB = (hA + random(100, 260)) % 360;    // Contraste secundario
      
      targetSunCol = color(hSun, 90, 95);
      targetColA = color(hA, 85, 95);
      targetColB = color(hB, 85, 95);
      
      colorMode(RGB, 255, 255, 255, 255); // Retorno a RGB

      spawnRipple(cx, cy);
      return; 
    }
  }

  // --- INTERACCIÓN CON LA ESFERA (Fase 4 - GRAB) ---
  let inPhase4 = (currentTime >= 600 && currentTime < 840);
  if (inPhase4) {
    let cx = width / 2;
    let cy = height / 2;
    
    let fovAngle = 135; // FOV consistente
    let fovRad = radians(fovAngle);
    let focalDist = (width / 2) / tan(fovRad / 2);
    
    // Calculamos el centro proyectado de la pelota 3D actual
    let spZ = 650 + phase4SphereZ;
    let spX = cx + (phase4SphereX * focalDist) / spZ;
    let spY = cy + (phase4SphereY * focalDist) / spZ;
    
    let sunSize = min(width, height) * 0.08;
    let shriekVolume = waveFFT.getEnergy(1200, 3800);
    let shriekFactor = map(shriekVolume, 45, 175, 0.0, 1.0, true);
    let dynamicSunSize = sunSize * (0.8 + shriekFactor * 1.6);
    
    let d = dist(mouseX, mouseY, spX, spY);
    // Área de colisión ampliada para facilitar la captura con cursor
    if (d < dynamicSunSize * 0.85 + 15) {
      phase4SphereGrabbed = true;
    }
  }

  // --- INTERACCIÓN CLIC GENERADORA DE ONDAS DE BRILLO (Fase 5) ---
  let inPhase5 = (currentTime >= 900);
  if (inPhase5) {
    // Al presionar el lienzo en la Fase 5, se genera una onda expansiva de iluminación y brillo (sin deforma física)
    spawnRipple(mouseX, mouseY);
    return;
  }
}

function mouseDragged() { 
  if (waveSong && waveSong.isPlaying()) { 
    isDragging = true;

    let allowedPhase = (currentTime >= 120 && currentTime < 240); 

    if (allowedPhase) {
      let dx = mouseX - pressX;
      targetRate = map(dx, -width / 2, width / 2, 0.85, 1.15);
      targetRate = constrain(targetRate, 0.85, 1.15);
    } else {
      targetRate = 1.0; 
    }
  } 
}

function mouseReleased() { 
  if (targetRate === 1.0) { 
    handleInteraction(); 
  }
  isDragging = false; 
  targetRate = 1.0; 
  
  // Liberación del agarre gravitatorio en la Fase 4
  phase4SphereGrabbed = false;
}

function handleInteraction() { 
  userStartAudio(); 
  if (!waveSong || !waveSong.isLoaded()) return;

  if (!waveSong.isPlaying()) { 
    waveSong.play(); 
  } else { 
    let allowRipples = (currentTime < 120); 
    if (allowRipples) { 
      spawnRipple(mouseX, mouseY); 
    } 
  } 
}

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
}