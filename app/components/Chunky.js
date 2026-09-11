import { Pressable, View } from 'react-native';

/**
 * The design's signature "chunky" depth: `box-shadow: 0 Npx 0 <colour>` — a
 * solid copy of the shape sitting N px lower, with no blur. React Native has no
 * offset-only shadow, so the depth is a slab of the shadow colour showing below
 * the face.
 */
export function Chunky({ depth = 6, depthColor, radius, style, innerStyle, children }) {
  return (
    <View
      style={[{ borderRadius: radius, backgroundColor: depthColor, paddingBottom: depth }, style]}
    >
      <View style={[{ borderRadius: radius, overflow: 'hidden' }, innerStyle]}>{children}</View>
    </View>
  );
}

/**
 * A pressable version: pressing sinks the face into its depth, the way the
 * canvas's `style-active="transform:translateY(3px);box-shadow:0 1px 0"` does.
 * The total height never changes, so nothing around it jumps.
 */
export function ChunkyButton({
  depth = 4,
  pressedDepth = 1,
  depthColor,
  radius = 999,
  style,
  innerStyle,
  onPress,
  children,
  ...a11y
}) {
  return (
    <Pressable onPress={onPress} style={style} {...a11y}>
      {({ pressed }) => {
        const d = pressed ? pressedDepth : depth;
        return (
          <View
            style={{
              borderRadius: radius,
              backgroundColor: depthColor,
              paddingBottom: d,
              marginTop: depth - d,
            }}
          >
            <View
              style={[
                { borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
                innerStyle,
              ]}
            >
              {children}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

export default Chunky;
