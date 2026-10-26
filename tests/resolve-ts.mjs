const hasExtension = /\.[cm]?[jt]sx?$|\.json$/

/** Hook de resolução: tenta `.ts` e `/index.ts` para imports relativos sem extensão. */
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (err) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (!relative || hasExtension.test(specifier)) throw err
    for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
      try {
        return await nextResolve(candidate, context)
      } catch {
        /* tenta o próximo */
      }
    }
    throw err
  }
}
