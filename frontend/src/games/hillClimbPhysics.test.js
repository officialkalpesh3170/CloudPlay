import test from "node:test";
import assert from "node:assert/strict";
import { createVehicleState, stepVehiclePhysics } from "./hillClimbPhysics.js";

const flatTerrain = () => 140;

function simulate(state, seconds, options, stopOnLanding = false) {
  const steps = Math.ceil(seconds * 60);
  let result;
  for (let frame = 0; frame < steps; frame += 1) {
    result = stepVehiclePhysics(state, 1 / 60, options);
    if (result.crashed || (stopOnLanding && result.landed)) break;
  }
  return result;
}

test("suspension settles on flat terrain without a false crash", () => {
  const state = createVehicleState({ x: 100, y: 100 });
  const result = simulate(state, 3, { terrainHeight: flatTerrain });

  assert.equal(result.crashed, false);
  assert.equal(state.grounded, true);
  assert.ok(Math.abs(state.vy) < 30, `vertical velocity was ${state.vy}`);
  assert.ok(state.rearCompression > 0);
  assert.equal(state.rearCompression, state.frontCompression);
});

test("front and rear wheels respond independently to different hill heights", () => {
  const state = createVehicleState({ x: 100, y: 100 });
  const terrain = (x) => 140 + (x - 100) * 0.24;
  simulate(state, 1.2, { terrainHeight: terrain });

  assert.notEqual(state.rearWheelOffset, state.frontWheelOffset);
  assert.notEqual(state.rearCompression, state.frontCompression);
});

test("gravity carries the vehicle downhill and throttle makes uphill progress", () => {
  const downhill = createVehicleState({ x: 100, y: 100 });
  simulate(downhill, 0.7, { terrainHeight: (x) => 140 + (x - 100) * 0.25 });
  assert.ok(downhill.vx > 0, `downhill speed was ${downhill.vx}`);

  const uphillCoast = createVehicleState({ x: 100, y: 100 });
  simulate(uphillCoast, 0.7, { terrainHeight: (x) => 140 - (x - 100) * 0.25 });
  const uphillDrive = createVehicleState({ x: 100, y: 100 });
  simulate(uphillDrive, 0.7, {
    terrainHeight: (x) => 140 - (x - 100) * 0.25,
    controls: { gas: true },
  });
  assert.ok(uphillDrive.vx > uphillCoast.vx);
});

test("air controls rotate the chassis and completed flips award coins", () => {
  const state = createVehicleState({ x: 100, y: -300 });
  state.vy = -700;
  simulate(state, 2.2, {
    terrainHeight: () => 10000,
    controls: { rotateRight: true },
  });

  assert.ok(state.airRotation > Math.PI * 2);
  assert.ok(state.frontFlips >= 1);
  assert.ok(state.runCoins >= 2);

  const backflip = createVehicleState({ x: 100, y: -300 });
  backflip.vy = -700;
  simulate(backflip, 2.2, {
    terrainHeight: () => 10000,
    controls: { rotateLeft: true },
  });
  assert.ok(backflip.backFlips >= 1);
});

test("safe landings settle while hard impacts and bad angles crash", () => {
  const safe = createVehicleState({ x: 100, y: 96 });
  safe.vy = 120;
  const safeResult = simulate(safe, 0.12, { terrainHeight: flatTerrain }, true);
  assert.equal(safeResult.landed, true);
  assert.equal(safeResult.crashed, false);

  const hard = createVehicleState({ x: 100, y: 96 });
  hard.vy = 720;
  const hardResult = stepVehiclePhysics(hard, 1 / 24, { terrainHeight: flatTerrain });
  assert.equal(hardResult.landingCrash, true);
  assert.equal(hardResult.crashed, true);

  const badAngle = createVehicleState({ x: 100, y: 96, angle: 1.1 });
  badAngle.vy = 120;
  const angleResult = stepVehiclePhysics(badAngle, 1 / 24, { terrainHeight: flatTerrain });
  assert.equal(angleResult.landingCrash, true);
});

test("buggy, jeep, and truck have distinct handling and speed limits", () => {
  const vehicleResults = ["jeep", "buggy", "truck"].map((vehicleId) => {
    const state = createVehicleState({ x: 100, y: 100 });
    simulate(state, 1.5, {
      vehicleId,
      terrainHeight: flatTerrain,
      controls: { gas: true },
    });
    return state.vx;
  });

  assert.notEqual(vehicleResults[0], vehicleResults[1]);
  assert.notEqual(vehicleResults[0], vehicleResults[2]);
});

test("body strikes and a stationary empty tank end the run with a reason", () => {
  const bodyStrike = createVehicleState({ x: 100, y: 110 });
  const bodyResult = stepVehiclePhysics(bodyStrike, 1 / 60, { terrainHeight: () => 100 });
  assert.equal(bodyResult.bodyImpact, true);
  assert.equal(bodyResult.crashed, true);
  assert.equal(bodyResult.crashReason, "The chassis hit the trail");

  const emptyTank = createVehicleState({ x: 100, y: -100 });
  emptyTank.fuel = 0;
  const fuelResult = stepVehiclePhysics(emptyTank, 1 / 60, { terrainHeight: () => 10000 });
  assert.equal(fuelResult.crashed, true);
  assert.equal(fuelResult.crashReason, "Out of fuel");
});

test("engine and tyre upgrades improve the matching handling stats", () => {
  const drive = (engineLevel, tireLevel) => {
    const state = createVehicleState({ x: 100, y: 100 });
    simulate(state, 0.8, {
      terrainHeight: flatTerrain,
      controls: { gas: true },
      engineLevel,
      tireLevel,
    });
    return state.vx;
  };

  assert.ok(drive(2, 1) > drive(1, 1));
  assert.ok(drive(1, 2) > drive(1, 1));
});
