// Node resolve hook so plain `node` scripts can import the app's ES modules,
// which use extensionless specifiers (Metro/Babel style), e.g. '../data/transitData'.
// Usage: node --import ./scripts/lib/register-esm.mjs scripts/<script>.mjs
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (
      err &&
      err.code === 'ERR_MODULE_NOT_FOUND' &&
      /^\.{1,2}\//.test(specifier) &&
      !/\.[cm]?js$/.test(specifier)
    ) {
      return nextResolve(`${specifier}.js`, context);
    }
    throw err;
  }
}
