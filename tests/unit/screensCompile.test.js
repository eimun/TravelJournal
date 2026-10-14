/**
 * Smoke test: every screen/component touched by the food, fare and logging work must
 * at least compile and import. Catches syntax errors that unit tests of pure logic miss.
 */
// Native-only module; not available under Jest.
jest.mock('react-native-webview', () => ({ WebView: () => null }));
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));

const modules = {
  ExploreScreen: () => require('../../app/screens/ExploreScreen'),
  NavigateScreen: () => require('../../app/screens/NavigateScreen'),
  GuideScreen: () => require('../../app/screens/GuideScreen'),
  RestaurantDetailSheet: () => require('../../app/components/RestaurantDetailSheet'),
  DiagnosticsModal: () => require('../../app/components/DiagnosticsModal'),
  FareReliabilityModal: () => require('../../app/components/FareReliabilityModal'),
  DynamicAutoFareCard: () => require('../../app/components/DynamicAutoFareCard'),
  ConnectingLegSelector: () => require('../../app/components/ConnectingLegSelector'),
  RouteDetailSheet: () => require('../../app/components/RouteDetailSheet'),
  WebRoadMap: () => require('../../app/components/WebRoadMap'),
};

describe('changed UI modules compile', () => {
  for (const [name, load] of Object.entries(modules)) {
    it(name, () => {
      const mod = load();
      expect(typeof mod.default).toBe('function');
    });
  }
});
