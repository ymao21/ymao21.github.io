import {
  allSupportingSkills,
  featuredSkills,
  getDandelionSkills,
} from './data/dandelionSkills.js';

const canvas = document.getElementById('skillsDandelion');
const control = document.getElementById('dandelionControl');
const stage = control?.closest('.dandelion-visualization');
const semanticList = document.getElementById('dandelionSkillList');
const instructions = document.getElementById('dandelionInstructions');

if (canvas && control && stage && semanticList) {
  const context = canvas.getContext('2d');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const featuredSet = new Set(featuredSkills);
  const abortController = new AbortController();
  const eventOptions = { signal: abortController.signal };

  const CONFIG = {
    rotationSeconds: 96,
    emptyDuration: 1250,
    releaseWaveDuration: 920,
    reconstructionSpread: 1250,
    pointerRadius: 92,
  };

  const COMPANION_FLOWERS = [
    { x: -.96, y: 1.46, radius: .26, bottom: -.105, rays: 72, stem: 3.1, sway: .7 },
    { x: -.48, y: 1.78, radius: .19, bottom: -.045, rays: 56, stem: 2.7, sway: .9 },
    { x: .5, y: 1.6, radius: .23, bottom: .02, rays: 64, stem: 2.9, sway: 1.05 },
    { x: .94, y: 1.92, radius: .16, bottom: .085, rays: 48, stem: 2.5, sway: 1.2 },
  ];

  const YELLOW_DANDELIONS = [
    { x: -1.28, y: 1.78, radius: .105, bottom: -.14, petals: 25, sway: .85 },
    { x: .05, y: 2.04, radius: .085, bottom: -.005, petals: 21, sway: 1.1 },
    { x: 1.22, y: 1.55, radius: .11, bottom: .13, petals: 27, sway: 1.25 },
  ];

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let centerX = 0;
  let centerY = 0;
  let radius = 1;
  let seeds = [];
  let depthOrder = [];
  let frontOrder = [];
  let animationState = 'idle';
  let stateStartedAt = 0;
  let rotationY = 0;
  let lastFrameTime = 0;
  let rafId = 0;
  let running = false;
  let inViewport = true;
  let reducedMotion = motionQuery.matches;
  let longestRelease = 0;
  let reconstructionEnd = 0;
  const sessionRotationY = Math.random() * Math.PI * 2;
  const sessionRotationX = (Math.random() - .5) * .34;
  const pointer = { x: 0, y: 0, active: false };

  function deterministic(index, salt = 1) {
    const value = Math.sin(index * 91.713 + salt * 47.143) * 43758.5453;
    return value - Math.floor(value);
  }

  function rotatePoint(x, y, z, angleX, angleY) {
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const xY = x * cosY + z * sinY;
    const zY = -x * sinY + z * cosY;
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    return {
      x: xY,
      y: y * cosX - zY * sinX,
      z: y * sinX + zY * cosX,
    };
  }

  function supportingCountForViewport() {
    if (window.innerWidth < 520) return 52;
    if (window.innerWidth < 760) return 64;
    if (window.innerWidth < 1024) return 74;
    return allSupportingSkills.length;
  }

  function visualSeedCountForViewport(uniqueCount) {
    if (window.innerWidth < 520) return Math.min(72, uniqueCount + 10);
    if (window.innerWidth < 760) return Math.min(88, uniqueCount + 14);
    if (window.innerWidth < 1024) return Math.min(102, uniqueCount + 18);
    return 116;
  }

  function updateSemanticList(labels) {
    semanticList.replaceChildren(...labels.map((label) => {
      const item = document.createElement('li');
      item.textContent = label;
      return item;
    }));
  }

  /* Fibonacci points make a uniformly full sphere without visible latitude
     rings. A single random session rotation is baked into the saved homes. */
  function buildSeeds() {
    const semanticLabels = getDandelionSkills(supportingCountForViewport());
    const labels = semanticLabels.slice();
    const supportingLabels = semanticLabels.slice(featuredSkills.length);
    const targetCount = visualSeedCountForViewport(semanticLabels.length);
    while (labels.length < targetCount) {
      const repeatIndex = ((labels.length - semanticLabels.length) * 7 + 3) % supportingLabels.length;
      labels.push(supportingLabels[repeatIndex]);
    }
    const count = labels.length;
    const points = new Array(count);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < count; index += 1) {
      const y = 1 - (index / Math.max(1, count - 1)) * 2;
      const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * index;
      const point = rotatePoint(
        Math.cos(theta) * horizontalRadius,
        y,
        Math.sin(theta) * horizontalRadius,
        sessionRotationX,
        sessionRotationY,
      );
      points[index] = { ...point, index, assigned: '' };
    }

    const featuredHomes = points
      .filter((point) => point.z > .08 && Math.hypot(point.x, point.y) > .3)
      .sort((a, b) => b.z - a.z);

    featuredSkills.forEach((label, index) => {
      const candidateIndex = Math.min(
        featuredHomes.length - 1,
        Math.floor(index * featuredHomes.length / featuredSkills.length),
      );
      featuredHomes[candidateIndex].assigned = label;
    });

    let supportingIndex = featuredSkills.length;
    for (const point of points) {
      if (!point.assigned) {
        point.assigned = labels[supportingIndex];
        supportingIndex += 1;
      }
    }

    seeds = points.map((point, index) => {
      const featured = featuredSet.has(point.assigned);
      const baseFontSize = (featured ? 20 : 17 + deterministic(index, 2) * 2.8)
        * (width < 520 ? .9 : 1);
      return {
        index,
        label: point.assigned,
        featured,
        originalX: point.x,
        originalY: point.y,
        originalZ: point.z,
        currentX: point.x,
        currentY: point.y,
        currentZ: point.z,
        projectedX: 0,
        projectedY: 0,
        zDepth: point.z,
        baseFontSize,
        currentOpacity: 1,
        currentScale: 1,
        rotationAngle: (deterministic(index, 3) - .5) * .22,
        filamentLength: .09 + deterministic(index, 4) * .07,
        releaseDelay: 0,
        velocityX: 0,
        velocityY: 0,
        turbulencePhase: deterministic(index, 5) * Math.PI * 2,
        turbulenceFrequency: .8 + deterministic(index, 6) * 1.3,
        turbulenceAmount: 5 + deterministic(index, 7) * 11,
        animationState: 'attached',
        textWidth: 0,
        fontString: '',
        hoverAmount: 0,
        collisionOpacity: 1,
        homeX: 0,
        homeY: 0,
        homeScale: 1,
        homeOpacity: 1,
        homeAngle: 0,
        flightX: 0,
        flightY: 0,
        flightRotation: 0,
        flightDuration: 0,
        returnStartX: 0,
        returnStartY: 0,
        returnDelay: 0,
        returnDuration: 0,
        returnAngle: 0,
        boxLeft: 0,
        boxRight: 0,
        boxTop: 0,
        boxBottom: 0,
      };
    });

    depthOrder = seeds.slice();
    frontOrder = seeds.slice();
    updateSemanticList(semanticLabels);
    measureSeedText();
    animationState = 'idle';
    control.removeAttribute('aria-busy');
    control.removeAttribute('aria-disabled');
  }

  function measureSeedText() {
    context.save();
    for (const seed of seeds) {
      const weight = seed.featured ? 600 : 500;
      seed.fontString = `${weight} ${seed.baseFontSize}px Inter, -apple-system, sans-serif`;
      context.font = seed.fontString;
      seed.textWidth = context.measureText(seed.label).width;
    }
    context.restore();
  }

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const nextWidth = Math.max(1, rect.width);
    const nextHeight = Math.max(1, rect.height);
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
    const uniqueCount = getDandelionSkills(supportingCountForViewport()).length;
    const countChanged = visualSeedCountForViewport(uniqueCount) !== seeds.length;

    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextRatio;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    centerX = width * (width < 620 ? .5 : .28);
    centerY = height * (width < 620 ? .3 : .31);
    radius = Math.min(
      width * (width < 620 ? .33 : .28),
      height * (width < 620 ? .19 : .245),
      width < 620 ? 145 : 205,
    );

    if (!seeds.length || countChanged || animationState !== 'idle') buildSeeds();
    else measureSeedText();
    draw(performance.now(), 0);
  }

  function normalizeReadableAngle(angle) {
    if (angle > Math.PI / 2) return angle - Math.PI;
    if (angle < -Math.PI / 2) return angle + Math.PI;
    return angle;
  }

  /* The saved unit sphere is rotated, perspective-scaled, and projected to
     screen space. Depth controls type scale, opacity, and draw order. */
  function projectIdleSeeds(now) {
    const seconds = now / 1000;
    const breath = 1 + Math.sin(seconds * Math.PI * 2 / 8.5) * .014;
    const floatY = Math.sin(seconds * Math.PI * 2 / 10.8) * 3.5;
    const pitch = Math.sin(seconds * Math.PI * 2 / 31) * .045;
    let leanX = 0;
    let leanY = 0;

    if (pointer.active) {
      const dx = pointer.x - centerX;
      const dy = pointer.y - (centerY + floatY);
      const distance = Math.hypot(dx, dy);
      if (distance < radius * 1.5) {
        const strength = 1 - distance / (radius * 1.5);
        leanX = -dx * strength * .014;
        leanY = -dy * strength * .008;
      }
    }

    const headX = centerX + leanX;
    const headY = centerY + floatY + leanY;
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    for (const seed of seeds) {
      const rotatedX = seed.originalX * cosY + seed.originalZ * sinY;
      const rotatedZBeforePitch = -seed.originalX * sinY + seed.originalZ * cosY;
      const rotatedY = seed.originalY * cosX - rotatedZBeforePitch * sinX;
      const rotatedZ = seed.originalY * sinX + rotatedZBeforePitch * cosX;
      const depth = (rotatedZ + 1) * .5;
      const perspective = .9 + depth * .16;
      let dx = rotatedX * radius * perspective * breath;
      let dy = rotatedY * radius * perspective * breath;
      let radialDistance = Math.hypot(dx, dy);
      if (radialDistance < radius * .11) {
        const fallbackAngle = Math.atan2(rotatedY || .01, rotatedX || .01);
        dx = Math.cos(fallbackAngle) * radius * .11;
        dy = Math.sin(fallbackAngle) * radius * .11;
        radialDistance = radius * .11;
      }
      const directionX = dx / radialDistance;
      const directionY = dy / radialDistance;
      const outward = radius * seed.filamentLength;
      let x = headX + dx + directionX * outward;
      let y = headY + dy + directionY * outward;

      let pointerTarget = 0;
      if (pointer.active && finePointer.matches) {
        const pointerDistance = Math.hypot(x - pointer.x, y - pointer.y);
        pointerTarget = Math.max(0, 1 - pointerDistance / CONFIG.pointerRadius);
      }
      seed.hoverAmount += (pointerTarget - seed.hoverAmount) * .1;
      x += directionX * seed.hoverAmount * 5;
      y += directionY * seed.hoverAmount * 5;

      seed.currentX = rotatedX;
      seed.currentY = rotatedY;
      seed.currentZ = rotatedZ;
      seed.projectedX = x;
      seed.projectedY = y;
      seed.zDepth = rotatedZ;
      seed.currentScale = (.68 + depth * .4) * (1 + seed.hoverAmount * .09);
      seed.currentOpacity = (.48 + depth * .5) * (seed.featured ? 1.02 : 1) + seed.hoverAmount * .08;
      seed.rotationAngle = normalizeReadableAngle(Math.atan2(directionY, directionX) + (deterministic(seed.index, 3) - .5) * .22);
      const halfWidth = seed.textWidth * seed.currentScale * .5;
      const halfHeight = seed.baseFontSize * seed.currentScale * .68;
      seed.boxLeft = x - halfWidth;
      seed.boxRight = x + halfWidth;
      seed.boxTop = y - halfHeight;
      seed.boxBottom = y + halfHeight;
    }

    frontOrder.sort((a, b) => b.zDepth - a.zDepth);
    for (let index = 0; index < frontOrder.length; index += 1) {
      const seed = frontOrder[index];
      let overlaps = false;
      for (let previous = 0; previous < index; previous += 1) {
        const other = frontOrder[previous];
        if (
          seed.boxLeft < other.boxRight + 2 &&
          seed.boxRight > other.boxLeft - 2 &&
          seed.boxTop < other.boxBottom + 1 &&
          seed.boxBottom > other.boxTop - 1
        ) {
          overlaps = true;
          break;
        }
      }
      seed.collisionOpacity = overlaps ? (seed.featured ? .94 : .68) : 1;
    }

    return { headX, headY, breath };
  }

  function drawStem(headX, headY, windLean = 0) {
    const bottomX = centerX - width * .025;
    const bottomY = height + 8;
    context.save();
    context.lineCap = 'round';
    context.strokeStyle = 'rgba(75, 119, 90, .56)';
    context.lineWidth = 3.2;
    context.beginPath();
    context.moveTo(bottomX, bottomY);
    context.bezierCurveTo(
      bottomX - width * .018,
      height * .73,
      headX - 8 + windLean * .45,
      headY + radius * .7,
      headX + windLean,
      headY + 4,
    );
    context.stroke();
    context.strokeStyle = 'rgba(239, 248, 246, .2)';
    context.lineWidth = 1.1;
    context.beginPath();
    context.moveTo(bottomX + 1.5, bottomY);
    context.bezierCurveTo(bottomX - 5, height * .71, headX - 4, headY + radius * .62, headX + windLean + 1, headY + 5);
    context.stroke();
    context.restore();
  }

  function drawYellowDandelions(now, windLean = 0) {
    const sway = reducedMotion ? 0 : Math.sin(now / 1650 + .8) * 1.8;

    for (let flowerIndex = 0; flowerIndex < YELLOW_DANDELIONS.length; flowerIndex += 1) {
      const flower = YELLOW_DANDELIONS[flowerIndex];
      const flowerRadius = radius * flower.radius;
      const headX = centerX + radius * flower.x + sway * flower.sway + windLean * .15;
      const headY = centerY + radius * flower.y;
      const bottomX = centerX + width * flower.bottom;

      context.save();
      context.lineCap = 'round';
      context.strokeStyle = 'rgba(72, 116, 86, .54)';
      context.lineWidth = 2.45;
      context.beginPath();
      context.moveTo(bottomX, height + 8);
      context.bezierCurveTo(bottomX, height * .84, headX - flower.x * 3, headY + flowerRadius * 2.6, headX, headY + 1);
      context.stroke();

      for (let petalIndex = 0; petalIndex < flower.petals; petalIndex += 1) {
        const angle = petalIndex / flower.petals * Math.PI * 2
          + deterministic(petalIndex + flowerIndex * 29, 51) * .16;
        const petalLength = flowerRadius * (.62 + deterministic(petalIndex + flowerIndex * 31, 52) * .36);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        context.strokeStyle = `rgba(247, 194, 54, ${.72 + deterministic(petalIndex, 53) * .22})`;
        context.lineWidth = 1.35 + flower.radius * 5;
        context.beginPath();
        context.moveTo(headX + cos * flowerRadius * .18, headY + sin * flowerRadius * .18);
        context.lineTo(headX + cos * petalLength, headY + sin * petalLength);
        context.stroke();
      }

      context.fillStyle = 'rgba(225, 151, 32, .92)';
      context.beginPath();
      context.arc(headX, headY, flowerRadius * .31, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(255, 216, 76, .94)';
      context.beginPath();
      context.arc(headX, headY, flowerRadius * .17, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  function drawCompanionDandelions(now, windLean = 0) {
    const sway = reducedMotion ? 0 : Math.sin(now / 1800) * 2;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    drawYellowDandelions(now, windLean);

    for (let flowerIndex = 0; flowerIndex < COMPANION_FLOWERS.length; flowerIndex += 1) {
      const flower = COMPANION_FLOWERS[flowerIndex];
      const headRadius = radius * flower.radius;
      const headX = centerX + radius * flower.x + sway * flower.sway + windLean * .18;
      const headY = centerY + radius * flower.y;
      const bottomX = centerX + width * flower.bottom;
      context.save();
      context.lineCap = 'round';
      context.strokeStyle = 'rgba(79, 123, 94, .5)';
      context.lineWidth = flower.stem;
      context.beginPath();
      context.moveTo(bottomX, height + 8);
      context.bezierCurveTo(
        bottomX + width * (flower.x < 0 ? -.012 : .01),
        height * .76,
        headX - flower.x * 5,
        headY + headRadius * 2.8,
        headX,
        headY + 2,
      );
      context.stroke();

      context.strokeStyle = 'rgba(232, 246, 237, .18)';
      context.lineWidth = Math.max(.55, flower.stem * .38);
      context.beginPath();
      context.moveTo(bottomX + 1, height + 8);
      context.bezierCurveTo(bottomX, height * .76, headX - flower.x * 3, headY + headRadius * 2.5, headX + .5, headY + 2);
      context.stroke();

      for (let rayIndex = 0; rayIndex < flower.rays; rayIndex += 1) {
        const angle = rayIndex * goldenAngle + flowerIndex * .7;
        const rayLength = headRadius * (.72 + deterministic(rayIndex + flowerIndex * 37, 41) * .3);
        const innerRadius = headRadius * .12;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const tipX = headX + cos * rayLength;
        const tipY = headY + sin * rayLength;

        context.strokeStyle = `rgba(252, 253, 255, ${.42 + flower.radius * .55})`;
        context.lineWidth = .58;
        context.beginPath();
        context.moveTo(headX + cos * innerRadius, headY + sin * innerRadius);
        context.lineTo(tipX, tipY);
        context.stroke();

        context.fillStyle = `rgba(255, 255, 255, ${.64 + flower.radius * .55})`;
        context.beginPath();
        context.arc(tipX, tipY, .72 + flower.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = 'rgba(255, 253, 242, .66)';
      context.beginPath();
      context.arc(headX, headY, 1.6 + flower.radius * 3, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
  }

  function drawCenter(headX, headY, fullness, now) {
    const pulse = reducedMotion ? 1 : 1 + Math.sin(now / 1300) * .06;
    const strength = .35 + fullness * .65;
    context.save();
    context.fillStyle = `rgba(250, 252, 255, ${.055 * strength})`;
    context.beginPath();
    context.arc(headX, headY, 17 * pulse, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = `rgba(252, 253, 248, ${.18 + .26 * strength})`;
    context.beginPath();
    context.arc(headX, headY, 5.2 * pulse, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = `rgba(255, 253, 242, ${.42 + .28 * strength})`;
    context.beginPath();
    context.arc(headX, headY, 1.7 * pulse, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawAttachedSeed(seed, headX, headY, opacityMultiplier = 1) {
    const opacity = Math.min(.99, seed.currentOpacity * seed.collisionOpacity * opacityMultiplier);
    if (opacity < .025) return;
    const dx = seed.projectedX - headX;
    const dy = seed.projectedY - headY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const directionX = dx / distance;
    const directionY = dy / distance;
    const textHalfWidth = seed.textWidth * seed.currentScale * .5;
    const startDistance = Math.min(distance * .7, radius * .12);

    context.strokeStyle = `rgba(245, 250, 255, ${opacity * .3})`;
    context.lineWidth = seed.featured ? .72 : .52;
    context.beginPath();
    context.moveTo(headX + directionX * startDistance, headY + directionY * startDistance);
    context.lineTo(
      seed.projectedX - directionX * (textHalfWidth + 2),
      seed.projectedY - directionY * (textHalfWidth + 2),
    );
    context.stroke();

    drawSeedWord(
      seed,
      seed.projectedX,
      seed.projectedY,
      seed.currentScale,
      opacity,
      seed.rotationAngle,
    );
  }

  function drawSeedWord(seed, x, y, scale, opacity, rotation) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(scale, scale);
    context.font = seed.fontString;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.strokeStyle = `rgba(54, 70, 91, ${opacity * .4})`;
    context.lineWidth = .78 / Math.max(.5, scale);
    context.strokeText(seed.label, 0, 0);
    context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    context.fillText(seed.label, 0, 0);
    context.restore();
  }

  function snapshotFlower(clickX, clickY, now) {
    const projected = projectIdleSeeds(now);
    longestRelease = 0;
    for (let index = 0; index < seeds.length; index += 1) {
      const seed = seeds[index];
      seed.homeX = seed.projectedX;
      seed.homeY = seed.projectedY;
      seed.homeScale = seed.currentScale;
      seed.homeOpacity = seed.currentOpacity * seed.collisionOpacity;
      seed.homeAngle = seed.rotationAngle;
      const distance = Math.hypot(seed.homeX - clickX, seed.homeY - clickY);
      const normalizedDistance = Math.min(1, distance / (radius * 2.15));
      seed.releaseDelay = normalizedDistance * CONFIG.releaseWaveDuration + deterministic(index, 11) * 190;
      seed.velocityX = 175 + deterministic(index, 12) * 155 + normalizedDistance * 50;
      seed.velocityY = -36 - deterministic(index, 13) * 66 - normalizedDistance * 12;
      seed.flightDuration = 4000 + deterministic(index, 14) * 1400;
      seed.flightRotation = (deterministic(index, 15) - .5) * .42;
      seed.animationState = 'waiting';
      longestRelease = Math.max(longestRelease, seed.releaseDelay + seed.flightDuration);
    }
    return projected;
  }

  /* A distance-ordered release delay turns the click into a soft wave. Flight
     is biased upper-right, with per-seed velocity and sinusoidal turbulence. */
  function startDispersal(clickX, clickY, now) {
    if (animationState !== 'idle' || reducedMotion) return;
    snapshotFlower(clickX, clickY, now);
    animationState = 'dispersing';
    stateStartedAt = now;
    control.setAttribute('aria-busy', 'true');
    control.setAttribute('aria-disabled', 'true');
  }

  function drawDetachedSeed(seed, age, opacity) {
    const seconds = age / 1000;
    const launchDuration = .58;
    const travelSeconds = seconds < launchDuration
      ? seconds * seconds / (launchDuration * 2)
      : seconds - launchDuration * .5;
    const turbulenceProgress = Math.min(1, seconds / .72);
    const turbulenceEnvelope = turbulenceProgress * turbulenceProgress * (3 - 2 * turbulenceProgress);
    const turbulence = Math.sin(seconds * seed.turbulenceFrequency * Math.PI * 2 + seed.turbulencePhase)
      * seed.turbulenceAmount * turbulenceEnvelope;
    const x = seed.homeX + seed.velocityX * travelSeconds + 16 * travelSeconds * travelSeconds + turbulence;
    const y = seed.homeY + seed.velocityY * travelSeconds - 8 * travelSeconds * travelSeconds
      + Math.cos(seconds * 1.35 + seed.turbulencePhase) * seed.turbulenceAmount * .45 * turbulenceEnvelope;
    const progress = Math.min(1, age / seed.flightDuration);
    const scale = seed.homeScale * (1 - progress * .48);
    const rotation = seed.homeAngle + seed.flightRotation * travelSeconds;
    const rightFadeDistance = Math.min(180, width * .14);
    const rightSpace = Math.max(0, Math.min(1, (width - x) / rightFadeDistance));
    const rightEdgeFade = rightSpace * rightSpace * (3 - 2 * rightSpace);
    const topFadeDistance = Math.min(110, height * .16);
    const topSpace = Math.max(0, Math.min(1, y / topFadeDistance));
    const topEdgeFade = topSpace * topSpace * (3 - 2 * topSpace);
    const visibleOpacity = opacity * Math.min(rightEdgeFade, topEdgeFade);
    const speed = Math.max(1, Math.hypot(seed.velocityX, seed.velocityY));
    const trailX = x - seed.velocityX / speed * (11 + 9 * (1 - progress));
    const trailY = y - seed.velocityY / speed * (11 + 9 * (1 - progress));
    context.strokeStyle = `rgba(245, 250, 255, ${visibleOpacity * .28})`;
    context.lineWidth = .55;
    context.beginPath();
    context.moveTo(trailX, trailY);
    context.lineTo(x, y);
    context.stroke();
    drawSeedWord(seed, x, y, scale, visibleOpacity, rotation);
  }

  function drawDispersing(now) {
    const elapsed = now - stateStartedAt;
    const windProgress = Math.min(1, elapsed / 900);
    const windLean = Math.sin(windProgress * Math.PI) * 8;
    const headX = centerX + windLean;
    const headY = centerY - windLean * .18;
    let attached = 0;

    drawCompanionDandelions(now, windLean);
    drawStem(headX, headY, windLean);
    for (const seed of seeds) {
      const age = elapsed - seed.releaseDelay;
      if (age < 0) {
        attached += 1;
        seed.projectedX = seed.homeX + windLean * .35;
        seed.projectedY = seed.homeY - windLean * .08;
        seed.currentScale = seed.homeScale;
        seed.currentOpacity = seed.homeOpacity;
        seed.collisionOpacity = 1;
        drawAttachedSeed(seed, headX, headY);
      } else if (age < seed.flightDuration) {
        seed.animationState = 'released';
        const progress = age / seed.flightDuration;
        const fadeProgress = Math.max(0, (progress - .64) / .36);
        const smoothFade = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
        const opacity = seed.homeOpacity * (1 - smoothFade);
        drawDetachedSeed(seed, age, opacity);
      } else {
        seed.animationState = 'gone';
      }
    }
    drawCenter(headX, headY, attached / seeds.length, now);

    if (elapsed >= longestRelease) {
      animationState = 'empty';
      stateStartedAt = now;
    }
  }

  /* Reconstruction is its own state rather than a reversed wind. Seeds begin
     at varied off-canvas homes and ease independently back to saved points. */
  function beginReconstruction(now) {
    reconstructionEnd = 0;
    for (let index = 0; index < seeds.length; index += 1) {
      const seed = seeds[index];
      const edge = index % 4;
      if (edge === 0) {
        seed.returnStartX = width * (1.05 + deterministic(index, 21) * .22);
        seed.returnStartY = height * deterministic(index, 22) * .72;
      } else if (edge === 1) {
        seed.returnStartX = width * deterministic(index, 23);
        seed.returnStartY = -40 - deterministic(index, 24) * 90;
      } else if (edge === 2) {
        seed.returnStartX = -50 - deterministic(index, 25) * 110;
        seed.returnStartY = height * (.12 + deterministic(index, 26) * .62);
      } else {
        seed.returnStartX = width * (1 + deterministic(index, 27) * .16);
        seed.returnStartY = height * (.45 + deterministic(index, 28) * .42);
      }
      seed.returnDelay = deterministic(index, 29) * CONFIG.reconstructionSpread;
      seed.returnDuration = 1150 + deterministic(index, 30) * 900;
      seed.returnAngle = seed.homeAngle + (deterministic(index, 31) - .5) * .7;
      seed.animationState = 'returning';
      reconstructionEnd = Math.max(reconstructionEnd, seed.returnDelay + seed.returnDuration);
    }
    animationState = 'reconstructing';
    stateStartedAt = now;
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function drawReconstructing(now) {
    const elapsed = now - stateStartedAt;
    let fullness = 0;
    drawCompanionDandelions(now);
    drawStem(centerX, centerY);
    for (const seed of seeds) {
      const localTime = elapsed - seed.returnDelay;
      if (localTime < 0) continue;
      const progress = Math.min(1, localTime / seed.returnDuration);
      const eased = easeOutCubic(progress);
      const x = seed.returnStartX + (seed.homeX - seed.returnStartX) * eased;
      const y = seed.returnStartY + (seed.homeY - seed.returnStartY) * eased;
      const scale = .52 + (seed.homeScale - .52) * eased;
      const opacity = seed.homeOpacity * Math.min(1, eased * 1.35);
      const rotation = seed.returnAngle + (seed.homeAngle - seed.returnAngle) * eased;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const filamentAlpha = opacity * eased * eased * .28;
      context.strokeStyle = `rgba(245, 250, 255, ${filamentAlpha})`;
      context.lineWidth = .52;
      context.beginPath();
      context.moveTo(centerX + dx / distance * radius * .1, centerY + dy / distance * radius * .1);
      context.lineTo(x - dx / distance * seed.textWidth * scale * .5, y - dy / distance * seed.textWidth * scale * .5);
      context.stroke();
      drawSeedWord(seed, x, y, scale, opacity, rotation);
      fullness += eased;
    }
    drawCenter(centerX, centerY, fullness / seeds.length, now);

    if (elapsed >= reconstructionEnd) {
      for (const seed of seeds) seed.animationState = 'attached';
      animationState = 'idle';
      stateStartedAt = now;
      control.removeAttribute('aria-busy');
      control.removeAttribute('aria-disabled');
    }
  }

  function drawIdle(now) {
    const projected = projectIdleSeeds(now);
    drawCompanionDandelions(now);
    drawStem(projected.headX, projected.headY);
    depthOrder.sort((a, b) => a.zDepth - b.zDepth);
    for (const seed of depthOrder) drawAttachedSeed(seed, projected.headX, projected.headY);
    drawCenter(projected.headX, projected.headY, 1, now);
  }

  function draw(now, deltaSeconds) {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    if (animationState === 'idle') {
      if (!reducedMotion) rotationY += deltaSeconds * Math.PI * 2 / CONFIG.rotationSeconds;
      drawIdle(now);
    } else if (animationState === 'dispersing') {
      drawDispersing(now);
    } else if (animationState === 'empty') {
      drawCompanionDandelions(now);
      drawStem(centerX, centerY);
      drawCenter(centerX, centerY, .05, now);
      if (now - stateStartedAt >= CONFIG.emptyDuration) beginReconstruction(now);
    } else if (animationState === 'reconstructing') {
      drawReconstructing(now);
    }
  }

  function frame(now) {
    if (!running) return;
    const deltaSeconds = lastFrameTime ? Math.min(.05, (now - lastFrameTime) / 1000) : 0;
    lastFrameTime = now;
    draw(now, deltaSeconds);
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (running || reducedMotion || document.hidden || !inViewport) return;
    running = true;
    lastFrameTime = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function syncMotionPreference() {
    reducedMotion = motionQuery.matches;
    control.disabled = reducedMotion;
    control.setAttribute('aria-disabled', String(reducedMotion));
    if (instructions) {
      instructions.textContent = reducedMotion
        ? 'Static visualization of the technical skills forming a dandelion.'
        : 'Press Enter or Space to send the skill seeds into the wind. The dandelion will rebuild automatically.';
    }
    if (reducedMotion) {
      stopLoop();
      animationState = 'idle';
      for (const seed of seeds) seed.animationState = 'attached';
      draw(performance.now(), 0);
    } else {
      control.disabled = false;
      control.removeAttribute('aria-disabled');
      startLoop();
    }
  }

  control.addEventListener('pointermove', (event) => {
    if (!finePointer.matches) return;
    const rect = control.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  }, eventOptions);

  control.addEventListener('pointerleave', () => {
    pointer.active = false;
  }, eventOptions);

  control.addEventListener('click', (event) => {
    if (animationState !== 'idle' || reducedMotion) return;
    const rect = control.getBoundingClientRect();
    const clickX = event.detail === 0 ? centerX : event.clientX - rect.left;
    const clickY = event.detail === 0 ? centerY : event.clientY - rect.top;
    if (event.detail !== 0 && Math.hypot(clickX - centerX, clickY - centerY) > radius * 1.38) return;
    startDispersal(clickX, clickY, performance.now());
  }, eventOptions);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else startLoop();
  }, eventOptions);

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(stage);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inViewport = entry.isIntersecting;
    if (inViewport) startLoop();
    else stopLoop();
  }, { rootMargin: '180px 0px' });
  intersectionObserver.observe(stage);

  motionQuery.addEventListener('change', syncMotionPreference, eventOptions);
  window.addEventListener('beforeunload', () => {
    stopLoop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    abortController.abort();
  }, { once: true });

  resizeCanvas();
  document.fonts?.ready.then(() => {
    measureSeedText();
    draw(performance.now(), 0);
  });
  syncMotionPreference();
}
