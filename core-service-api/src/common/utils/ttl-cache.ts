/**
 * Caché en memoria con expiración por tiempo y tamaño acotado.
 *
 * La analítica se recalcula sobre ventanas de fechas cerradas: dos usuarios
 * mirando el mismo rango producen exactamente la misma respuesta. Cachear ese
 * resultado unos minutos evita repetir el trabajo agregado en Postgres en cada
 * carga de la pantalla.
 *
 * Es deliberadamente un caché de proceso: no añade Redis ni infraestructura
 * nueva. Si la API pasa a correr en varias instancias, cada una mantendrá su
 * propia copia — aceptable porque las entradas son de solo lectura y expiran
 * solas. Ese es el punto donde conviene migrar a un caché compartido.
 */
export class TtlCache<T> {
  private readonly store = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 200,
  ) {}

  get(key: string): T | undefined {
    const hit = this.store.get(key);

    if (!hit) return undefined;

    if (hit.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return hit.value;
  }

  set(key: string, value: T): void {
    // Evicción simple FIFO: basta para un caché de pocas decenas de entradas.
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }

    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Devuelve el valor cacheado o ejecuta `factory` y guarda su resultado. */
  async wrap(key: string, factory: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const value = await factory();
    this.set(key, value);
    return value;
  }
}
