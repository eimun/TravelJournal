import { Linking, Platform } from 'react-native';

/**
 * Pre-composes a reassuring 1-tap WhatsApp message to send family or parents.
 *
 * @param {Object} params
 * @param {string} params.currentStation Current metro/bus station name
 * @param {string} [params.gate] Specific gate entered (e.g. "Gate 1")
 * @param {string} [params.lineName] Transit line (e.g. "Purple Line Metro")
 * @param {string} [params.towards] Direction train is heading (e.g. "Towards Challaghatta")
 * @param {string} [params.destination] Final destination name
 * @param {number} [params.etaMinutes] Estimated travel duration in minutes
 * @param {string} [params.recipient] Optional recipient salutation (default "Family")
 * @returns {string} Formatted WhatsApp message string
 */
export function generateSafetyMessage({
  currentStation = 'Namma Metro Station',
  gate = '',
  lineName = 'Namma Metro',
  towards = '',
  destination = '',
  etaMinutes = 25,
  recipient = 'Mummy / Papa',
} = {}) {
  const gatePart = gate ? ` (${gate})` : '';
  const towardsPart = towards ? ` heading towards ${towards}` : '';
  const destPart = destination ? `\n🎯 Heading to: ${destination}` : '';
  const etaPart = etaMinutes ? `\n⏱️ Est. Travel Time: ~${etaMinutes} mins` : '';

  return (
    `Hi ${recipient}! Just sharing my travel update:\n` +
    `📍 Currently at: ${currentStation}${gatePart}\n` +
    `🚇 Boarding: ${lineName}${towardsPart}` +
    `${destPart}` +
    `${etaPart}\n` +
    `✅ Safe and on track! Tracking route via Bengaluru Transit Companion.`
  );
}

/**
 * Triggers WhatsApp share URL or copies to clipboard.
 *
 * @param {string} message Text message to send
 * @param {Function} [onFallbackCopy] Optional callback if WhatsApp app URL fails
 * @returns {Promise<boolean>}
 */
export async function sendSafetyPingWhatsApp(message, onFallbackCopy) {
  const encoded = encodeURIComponent(message);
  const mobileUrl = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://api.whatsapp.com/send?text=${encoded}`;

  if (Platform.OS === 'web') {
    try {
      window.open(webUrl, '_blank');
      return true;
    } catch {
      if (onFallbackCopy) onFallbackCopy();
      return false;
    }
  }

  try {
    const canOpen = await Linking.canOpenURL(mobileUrl);
    if (canOpen) {
      await Linking.openURL(mobileUrl);
      return true;
    } else {
      await Linking.openURL(webUrl);
      return true;
    }
  } catch {
    if (onFallbackCopy) onFallbackCopy();
    return false;
  }
}
