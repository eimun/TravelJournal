import { MAJESTIC_STATION } from '../../app/data/stationBlueprintData';

describe('Station Blueprint (Majestic Interchange Hub)', () => {
  it('defines realistic 4-level station structure with correct depth metadata', () => {
    expect(MAJESTIC_STATION.id).toBe('majestic_kempegowda');
    expect(MAJESTIC_STATION.depthMeters).toBe(21);
    expect(MAJESTIC_STATION.levelsCount).toBe(4);
    expect(MAJESTIC_STATION.levels.length).toBe(4);

    const levelIds = MAJESTIC_STATION.levels.map((l) => l.id);
    expect(levelIds).toEqual(['L0', 'L-1', 'L-2', 'L-3']);
  });

  it('includes key surface gates connecting to Railway Station, BMTC bus, and Auto stand', () => {
    const l0 = MAJESTIC_STATION.levels.find((l) => l.id === 'L0');
    expect(l0).toBeDefined();
    expect(l0.gates.length).toBeGreaterThanOrEqual(6);

    const gateA = l0.gates.find((g) => g.id === 'gate_a');
    expect(gateA.connectsTo).toContain('Railway Station');
    expect(gateA.accessible).toBe(true);

    const gateC = l0.gates.find((g) => g.id === 'gate_c');
    expect(gateC.connectsTo).toContain('BMTC');

    const gateE = l0.gates.find((g) => g.id === 'gate_e');
    expect(gateE.connectsTo).toContain('Auto Rickshaw');
  });

  it('contains concourse security, ticketing, AFC turnstiles, and cloakroom facilities', () => {
    const concourse = MAJESTIC_STATION.levels.find((l) => l.id === 'L-1');
    expect(concourse).toBeDefined();
    expect(concourse.zones.length).toBeGreaterThanOrEqual(4);

    const hasSecurity = concourse.zones.some((z) => z.title.includes('Security'));
    const hasAFC = concourse.zones.some((z) => z.title.includes('AFC'));
    const hasCloakroom = concourse.zones.some((z) => z.title.includes('Cloakroom'));

    expect(hasSecurity).toBe(true);
    expect(hasAFC).toBe(true);
    expect(hasCloakroom).toBe(true);
  });

  it('correctly maps Purple Line and Green Line platforms across Level -2 and Level -3', () => {
    const purpleLevel = MAJESTIC_STATION.levels.find((l) => l.id === 'L-2');
    expect(purpleLevel.platforms.length).toBe(2);
    expect(purpleLevel.platforms[0].number).toBe('1');
    expect(purpleLevel.platforms[0].towards).toContain('Whitefield');
    expect(purpleLevel.platforms[1].number).toBe('2');
    expect(purpleLevel.platforms[1].towards).toContain('Challaghatta');

    const greenLevel = MAJESTIC_STATION.levels.find((l) => l.id === 'L-3');
    expect(greenLevel.platforms.length).toBe(2);
    expect(greenLevel.platforms[0].number).toBe('3');
    expect(greenLevel.platforms[0].towards).toContain('Nagasandra');
    expect(greenLevel.platforms[1].number).toBe('4');
    expect(greenLevel.platforms[1].towards).toContain('Silk Institute');
  });

  it('provides step-by-step guided paths with walking distances and accessibility flags', () => {
    expect(MAJESTIC_STATION.presetPaths.length).toBeGreaterThanOrEqual(3);

    const railwayPath = MAJESTIC_STATION.presetPaths.find((p) => p.id === 'ksr_to_purple');
    expect(railwayPath).toBeDefined();
    expect(railwayPath.stepFree).toBe(true);
    expect(railwayPath.walkMins).toBeLessThanOrEqual(5);
    expect(railwayPath.steps.length).toBeGreaterThanOrEqual(4);

    const transferPath = MAJESTIC_STATION.presetPaths.find((p) => p.id === 'purple_to_green_transfer');
    expect(transferPath).toBeDefined();
    expect(transferPath.walkMins).toBeLessThanOrEqual(2);
  });
});
