/**
 * O Express tipa `req.params[chave]` como `string | string[]` para suportar
 * rotas com parâmetros repetidos. Nossas rotas usam sempre um único segmento,
 * então normalizamos para `string` em um único lugar.
 */
export const getIdParam = (value: string | string[]): string => (Array.isArray(value) ? value[0] : value);
