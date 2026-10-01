const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verifica se uma string tem o formato de UUID. Usado para evitar que IDs
 * mal formados cheguem ao Supabase (a coluna é do tipo `uuid` e rejeita
 * qualquer valor fora do padrão com erro 500 em vez de simplesmente não
 * encontrar o registro).
 */
export const isValidUuid = (value: string): boolean => UUID_PATTERN.test(value);
