/**
 * Lectura paginada.
 *
 * PostgREST corta cualquier respuesta a 1000 filas y **no avisa**: devuelve un
 * 200 con datos incompletos. Con 39 casas por partido se pasa de ese límite con
 * apenas nueve partidos, así que cualquier consulta de cuotas tiene que paginar
 * o trabajará en silencio sobre datos truncados.
 */

const PAGE_SIZE = 1000;

export async function fetchAllRows<T>(
  build: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = PAGE_SIZE
): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;

    rows.push(...data);
    if (data.length < pageSize) break;
  }

  return rows;
}
