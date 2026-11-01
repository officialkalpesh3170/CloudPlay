export const VEHICLE_PHYSICS = Object.freeze({
  jeep: {
    mass: 1,
    power: 1,
    grip: 1,
    suspension: 1,
    suspensionDamping: 1,
    airControl: 1,
    wheelBase: 56,
    wheelRadius: 17,
    maxSpeed: 480,
    brakePower: 620,
    color: "#e97932",
  },
  buggy: {
    mass: 0.76,
    power: 1.28,
    grip: 0.9,
    suspension: 0.82,
    suspensionDamping: 0.82,
    airControl: 1.22,
    wheelBase: 62,
    wheelRadius: 15,
    maxSpeed: 650,
    brakePower: 560,
    color: "#e9bd39",
  },
  truck: {
    mass: 1.48,
    power: 1.12,
    grip: 1.18,
    suspension: 1.28,
    suspensionDamping: 1.22,
    airControl: 0.66,
    wheelBase: 72,
    wheelRadius: 19,
    maxSpeed: 410,
    brakePower: 760,
    color: "#d64b37",
  },
});

const WHEEL_REST_Y = 24;
const WHEEL_MIN_Y = 7;
const WHEEL_MAX_Y = 41;
const GRAVITY = 980;
const SUBSTEPS = 4;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function angleDifference(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function transformPoint(g, localX, localY) {
  const cos = Math.cos(g.angle);
  const sin = Math.sin(g.angle);

  return {
    x: g.x + localX * cos - localY * sin,
    y: g.y + localX * sin + localY * cos,
  };
}

function getWheelContact(g, wheel, vehicle, terrainHeight, step) {
  const localX = wheel.side * vehicle.wheelBase / 2;
  const point = transformPoint(g, localX, g[wheel.offset]);
  const terrainY = terrainHeight(point.x);
  const penetration = point.y + vehicle.wheelRadius - terrainY;

  if (penetration < -0.6 || Math.cos(g.angle) < 0.25) {
    const oldCompression = g[wheel.compression];
    g[wheel.compression] *= Math.exp(-14 * step);
    g[wheel.compressionVelocity] = (g[wheel.compression] - oldCompression) / step;
    g[wheel.offset] += (WHEEL_REST_Y - g[wheel.offset]) * Math.min(1, 14 * step);
    return null;
  }

  // Move this wheel up along its own suspension axis until its tire touches terrain.
  const previousCompression = g[wheel.compression];
  const correctedOffset = clamp(
    g[wheel.offset] - penetration / Math.max(0.35, Math.cos(g.angle)),
    WHEEL_MIN_Y,
    WHEEL_MAX_Y,
  );
  g[wheel.offset] = correctedOffset;
  const compression = clamp(WHEEL_REST_Y - correctedOffset, -12, 17);
  g[wheel.compression] = compression;
  g[wheel.compressionVelocity] = (compression - previousCompression) / step;

  const correctedPoint = transformPoint(g, localX, correctedOffset);
  const slope = (terrainHeight(correctedPoint.x + 2) - terrainHeight(correctedPoint.x - 2)) / 4;
  const normalLength = Math.hypot(slope, 1);
  const spring = (compression + 4) * 120 * vehicle.suspension * Math.hypot(slope, 1);
  const damping = g[wheel.compressionVelocity] * 24 * vehicle.suspensionDamping;
  const normalForce = clamp(spring + damping, 0, 16000 * vehicle.mass);

  return {
    point: correctedPoint,
    slope,
    normalX: slope / normalLength,
    normalY: -1 / normalLength,
    normalForce,
  };
}

export function createVehicleState({ x, y, angle = 0 } = {}) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    angle,
    angularVelocity: 0,
    wheelSpin: 0,
    rearWheelOffset: WHEEL_REST_Y,
    frontWheelOffset: WHEEL_REST_Y,
    rearCompression: 0,
    frontCompression: 0,
    rearCompressionVelocity: 0,
    frontCompressionVelocity: 0,
    airRotation: 0,
    flipCount: 0,
    frontFlips: 0,
    backFlips: 0,
    fuel: 100,
    distance: 0,
    runCoins: 0,
    grounded: false,
    crashed: false,
    world: { coins: [], fuels: [] },
  };
}

export function stepVehiclePhysics(g, deltaTime, {
  vehicleId = "jeep",
  engineLevel = 1,
  tireLevel = 1,
  controls = {},
  terrainHeight,
} = {}) {
  const vehicle = VEHICLE_PHYSICS[vehicleId] || VEHICLE_PHYSICS.jeep;
  const tireGrip = 1 + Math.max(0, tireLevel - 1) * 0.08;
  const wasGrounded = g.grounded;
  const impactVelocity = g.vy;
  const dt = clamp(deltaTime, 1 / 240, 1 / 24);
  const step = dt / SUBSTEPS;
  const wheels = [
    { side: -1, offset: "rearWheelOffset", compression: "rearCompression", compressionVelocity: "rearCompressionVelocity" },
    { side: 1, offset: "frontWheelOffset", compression: "frontCompression", compressionVelocity: "frontCompressionVelocity" },
  ];
  let contactCount = 0;
  let finalContactCount = 0;
  let sawGroundContact = false;
  let averageSlope = 0;
  let landingAngleAtContact = Math.PI;

  for (let index = 0; index < SUBSTEPS; index += 1) {
    let forceX = 0;
    let forceY = GRAVITY * vehicle.mass;
    let torque = 0;
    let slopeSum = 0;
    let contacts = 0;

    for (const wheel of wheels) {
      const contact = getWheelContact(g, wheel, vehicle, terrainHeight, step);
      if (!contact) continue;

      contacts += 1;
      slopeSum += contact.slope;
      const fx = contact.normalX * contact.normalForce;
      const fy = contact.normalY * contact.normalForce;
      forceX += fx;
      forceY += fy;
      const armX = contact.point.x - g.x;
      const armY = contact.point.y - g.y;
      torque += armX * fy - armY * fx;

      if (controls.gas && g.fuel > 0) {
        forceX += 225 * engineLevel * vehicle.power * vehicle.grip * tireGrip;
      }
    }

    const traction = contacts / 2;
    if (contacts > 0) {
      sawGroundContact = true;
      const slope = slopeSum / contacts;
      landingAngleAtContact = Math.abs(angleDifference(g.angle, Math.atan(slope)));
    }
    if (controls.brake) forceX -= vehicle.brakePower * vehicle.mass * traction * tireGrip;

      // A terrain normal points uphill and away from the surface; gravity then slides the chassis downhill.
    if (contacts > 0) {
      const slope = slopeSum / contacts;
      const desiredAngle = Math.atan(slope);
      torque += (angleDifference(g.angle, desiredAngle) * 6200 - g.angularVelocity * 2100) * vehicle.mass * traction;
    } else {
      const airInput = Number(Boolean(controls.rotateRight)) - Number(Boolean(controls.rotateLeft));
      torque += airInput * 11200 * vehicle.airControl;
    }

    const linearDrag = contacts > 0 ? 1.4 : 0.08;
    forceX -= g.vx * linearDrag * vehicle.mass;
    g.vx += forceX / vehicle.mass * step;
    g.vy += forceY / vehicle.mass * step;

    const momentOfInertia = vehicle.mass * (1650 + vehicle.wheelBase * vehicle.wheelBase * 0.38);
    g.angularVelocity += torque / momentOfInertia * step;
    g.angularVelocity = clamp(g.angularVelocity, -7.2, 7.2);
    g.angularVelocity *= Math.exp(-(contacts > 0 ? 1.8 : 0.08) * step);
    g.angle += g.angularVelocity * step;
    g.x += g.vx * step;
    g.y += g.vy * step;

    contactCount = Math.max(contactCount, contacts);
    finalContactCount = contacts;
    averageSlope = contacts ? slopeSum / contacts : averageSlope;
  }

  if (controls.gas && g.fuel > 0) g.fuel = Math.max(0, g.fuel - 2.1 * dt);
  g.vx = clamp(g.vx, -220, vehicle.maxSpeed);
  g.wheelSpin += g.vx * dt / vehicle.wheelRadius;
  g.grounded = finalContactCount > 0 || sawGroundContact;

  const airborneDelta = g.grounded ? 0 : g.angularVelocity * dt;
  g.airRotation += airborneDelta;
  const fullRotationCount = Math.floor(Math.abs(g.airRotation) / (Math.PI * 2));
  if (fullRotationCount > g.flipCount) {
    const newFlips = fullRotationCount - g.flipCount;
    if (g.airRotation > 0) g.frontFlips += newFlips;
    else g.backFlips += newFlips;
    g.runCoins += newFlips * 2;
    g.flipCount = fullRotationCount;
  }

  const landed = !wasGrounded && sawGroundContact;
  const landingAngle = landingAngleAtContact < Math.PI ? landingAngleAtContact : Math.abs(angleDifference(g.angle, Math.atan(averageSlope)));
  const landingCrash = landed && (Math.abs(impactVelocity) > 620 || landingAngle > 0.92);

  if (landed) {
    g.airRotation = 0;
    g.flipCount = 0;
  }

  const localBodyCorners = [
    [-44, -8], [44, -8], [-23, -50], [25, -50],
  ];
  const bodyImpact = localBodyCorners.some(([x, y]) => {
    const point = transformPoint(g, x, y);
    return point.y >= terrainHeight(point.x) - 1;
  });
  const overturned = g.grounded && Math.cos(g.angle) < -0.25;
  const outOfFuel = g.fuel <= 0 && Math.abs(g.vx) < 14;
  const crashed = landingCrash || bodyImpact || overturned || g.y > 900 || outOfFuel;
  g.crashed ||= crashed;
  if (crashed && !g.crashReason) {
    g.crashReason = landingCrash
      ? Math.abs(impactVelocity) > 620 ? "Hard landing" : "Bad landing angle"
      : bodyImpact ? "The chassis hit the trail"
        : overturned ? "The vehicle overturned"
          : g.y > 900 ? "Lost below the trail" : "Out of fuel";
  }

  return {
    landed,
    crashed,
    bodyImpact,
    landingCrash,
    landingAngle,
    impactVelocity,
    contactCount,
    speed: Math.abs(g.vx),
    vehicle,
    crashReason: g.crashReason,
  };
}
