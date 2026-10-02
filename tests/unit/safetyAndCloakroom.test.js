import { generateSafetyMessage } from '../../app/services/safetyPingService';
import { BENGALURU_CLOAKROOMS, CLOAKROOM_CHECKLIST } from '../../app/data/cloakroomData';

describe('Safety Ping Service', () => {
  test('generates complete WhatsApp message with station and leg details', () => {
    const msg = generateSafetyMessage({
      currentStation: 'National College Metro',
      gate: 'Gate 2',
      lineName: 'Green Line Metro',
      towards: 'Towards Silk Institute',
      destination: 'Lalbagh Botanical Garden',
      etaMinutes: 12,
      recipient: 'Mom & Dad',
    });

    expect(msg).toContain('Hi Mom & Dad!');
    expect(msg).toContain('Currently at: National College Metro (Gate 2)');
    expect(msg).toContain('Boarding: Green Line Metro heading towards Towards Silk Institute');
    expect(msg).toContain('Heading to: Lalbagh Botanical Garden');
    expect(msg).toContain('Est. Travel Time: ~12 mins');
    expect(msg).toContain('Safe and on track!');
  });

  test('falls back gracefully when parameters are omitted', () => {
    const msg = generateSafetyMessage();
    expect(msg).toContain('Hi Mummy / Papa!');
    expect(msg).toContain('Currently at: Namma Metro Station');
    expect(msg).toContain('Safe and on track!');
  });
});

describe('Cloakroom & Left-Luggage Directory', () => {
  test('contains Majestic, Yesvantpur, and Cantonment railway facilities', () => {
    expect(BENGALURU_CLOAKROOMS.length).toBeGreaterThanOrEqual(4);
    
    const majestic = BENGALURU_CLOAKROOMS.find((c) => c.id === 'ksr_majestic_railway');
    expect(majestic).toBeDefined();
    expect(majestic.tariff.first24Hours).toContain('₹30');
    expect(majestic.timings).toContain('24 Hours');
    expect(majestic.rules.some((r) => r.toLowerCase().includes('lock'))).toBe(true);

    const yesvantpur = BENGALURU_CLOAKROOMS.find((c) => c.id === 'yesvantpur_railway');
    expect(yesvantpur).toBeDefined();
    expect(yesvantpur.locationDetails).toContain('Platform 1');
  });

  test('checklist contains essential padlock and ID proof items', () => {
    expect(CLOAKROOM_CHECKLIST.length).toBeGreaterThanOrEqual(3);
    expect(CLOAKROOM_CHECKLIST.some((c) => c.item.toLowerCase().includes('padlock'))).toBe(true);
    expect(CLOAKROOM_CHECKLIST.some((c) => c.item.toLowerCase().includes('id'))).toBe(true);
  });
});
