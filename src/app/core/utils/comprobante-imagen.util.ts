/**
 * Genera la imagen tipo comprobante de una inversión, imitando la pantalla "Cartilla de inversión"
 * (inversion-detail, estilo fintech mobile light): hero con el cliente, valor de cuota y progreso,
 * alerta de cuotas vencidas, cartilla de cuotas y detalle de la inversión.
 * Se dibuja directo en un <canvas> (sin depender del DOM de la pantalla), así se puede generar
 * desde cualquier vista, incluso la de "inversión registrada" que no muestra la cartilla.
 *
 * Devuelve el PNG en base64 SIN el prefijo "data:image/png;base64,", que es lo que espera
 * POST /inversion/enviarComprobanteWhatsapp en "imagenBase64".
 */

interface CuotaComprobante {
  fechaPagar?: string;
  fechaPago?: string;
  isPagado?: boolean;
  isAtrasado?: boolean;
}

export interface ComprobanteImagenParams {
  /** Respuesta de getInversionesDetail (resp.data). */
  invDetail: any;
  currency: string;
}

const W = 420;            // ancho lógico, como la pantalla del celular
const SCALE = 3;          // se dibuja al triple para que se vea nítido en WhatsApp
const PAD = 16;
const CARD_W = W - PAD * 2;

const COLS = 4;
const GRID_PAD = 12;
const GAP = 8;
const CELL = (CARD_W - GRID_PAD * 2 - GAP * (COLS - 1)) / COLS;

/** Colores del tema: se leen de las variables CSS de la app (con respaldo por si no existen). */
function colores() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const blue = v('--blue-400', '#60a5fa');
  const green = v('--primary-500', '#10b981');
  const red = v('--red-500', '#ef4444');
  const orange = v('--orange-500', '#f97316');
  return {
    blue, green, red, orange,
    ink: v('--gray-700', '#374151'),
    muted: v('--gray-500', '#6b7280'),
    gray400: v('--gray-400', '#9ca3af'),
    gray200: v('--gray-200', '#e5e7eb'),
    gray100: v('--gray-100', '#f3f4f6'),
    gray50: v('--gray-50', '#f9fafb'),
    blueSoft: mezclar(blue, 12),
    greenSoft: mezclar(green, 7),
    redSoft: mezclar(red, 8),
    orangeSoft: mezclar(orange, 10),
  };
}

export async function generarImagenComprobante({ invDetail, currency }: ComprobanteImagenParams): Promise<string> {
  // Espera a que la fuente de la app esté cargada para que el canvas no use la de respaldo.
  try { await (document as any).fonts?.ready; } catch { /* sin soporte: usa la fuente de respaldo */ }
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif';
  const sello = await cargarSello();
  const C = colores();

  const cuotas: CuotaComprobante[] = invDetail?.frecuenciaPago?.fechasPagos || [];
  const filas = Math.max(1, Math.ceil(cuotas.length / COLS));
  const persona = invDetail?.persona || {};
  const nombre = [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno].filter(Boolean).join(' ');
  const iniciales = ((persona.nombres || '').trim().charAt(0) + (persona.apellidoPaterno || '').trim().charAt(0)).toUpperCase();
  const nroCuotas = Number(invDetail?.nroCuotas || 0);
  const pagadas = Number(invDetail?.ctasPagadas || 0);
  const pendientes = nroCuotas - pagadas;
  const porcentaje = nroCuotas ? Math.round(pagadas * 100 / nroCuotas) : 0;
  const atrasadas = Number(invDetail?.frecuenciaPago?.cuotasAtrasadas || 0);

  // Filas del detalle, en el mismo orden que la pantalla
  const detalle: [string, string][] = [
    ['Monto invertido', `${currency} ${formatMonto(invDetail?.monto)}`],
    ['Interés', `${String(invDetail?.interes ?? '').padStart(2, '0')}%`],
    ['Número de cuotas', String(invDetail?.nroCuotas ?? '')],
    ['Fecha de registro', String(invDetail?.fechaRegistro ?? '')],
    ['Periodo', `${invDetail?.fechaInicio ?? ''} → ${invDetail?.fechaFin ?? ''}`],
  ];
  // El código ya viene con su prefijo (ej. "SS-123"): se muestra tal cual, como en la pantalla.
  if (invDetail?.codOperacion) detalle.push(['Código de operación', String(invDetail.codOperacion)]);

  /* ===== Alturas ===== */
  const HEAD_H = 84;
  const HERO_H = 208;
  const ALERTA_H = atrasadas > 0 ? 48 + 12 : 0;
  const SECCION_H = 30;
  const LEYENDA_H = 38;
  const GRID_CARD_H = GRID_PAD * 2 + filas * CELL + (filas - 1) * GAP + LEYENDA_H;
  const DET_ROW_H = 44;
  const DET_CARD_H = detalle.length * DET_ROW_H + 12;
  const FOOTER_H = 44;
  const H = HEAD_H + HERO_H + 14 + ALERTA_H + SECCION_H + GRID_CARD_H + 14 + SECCION_H + DET_CARD_H + FOOTER_H;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);
  const t = textFn(ctx, font);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  /* ===== Título (sólido, como .label-title) ===== */
  t('Cartilla de inversión', PAD + 4, 44, { size: 24, weight: 700, color: mezclarColores(C.blue, '#4b5563', 28) });
  t('Avance de pagos y detalles del préstamo.', PAD + 4, 66, { size: 13, weight: 400, color: C.muted });

  let y = HEAD_H;

  /* ===== Hero ===== */
  dibujarHero(ctx, PAD, y, CARD_W, HERO_H, C);

  // Tarjeta del cliente (translúcida)
  const pillX = PAD + 16, pillY = y + 14, pillW = CARD_W - 32, pillH = 56;
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  roundRect(ctx, pillX, pillY, pillW, pillH, 18);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(pillX + 8 + 21, pillY + pillH / 2, 21, 0, Math.PI * 2);
  ctx.fill();
  t(iniciales || '-', pillX + 29, pillY + pillH / 2 + 5.5, { size: 15, weight: 700, color: C.blue, align: 'center' });
  ctx.font = `700 15px ${font}`;
  t(ellipsis(ctx, capitalizar(nombre) || '-', pillW - 80), pillX + 62, pillY + 24, { size: 15, weight: 700, color: '#fff' });
  t('Cliente', pillX + 62, pillY + 42, { size: 12, weight: 400, color: 'rgba(255,255,255,.85)' });

  // Valor de cuota
  t('Valor de cuota', W / 2, y + 98, { size: 13.5, weight: 600, color: 'rgba(255,255,255,.92)', align: 'center' });
  const monto = formatMonto(invDetail?.valorCuota);
  ctx.font = `700 40px ${font}`;
  const mw = ctx.measureText(monto).width;
  ctx.font = `600 20px ${font}`;
  const cw = ctx.measureText(currency + ' ').width;
  const mx = W / 2 - (mw + cw) / 2;
  t(currency + ' ', mx, y + 142, { size: 20, weight: 600, color: 'rgba(255,255,255,.9)' });
  t(monto, mx + cw, y + 142, { size: 40, weight: 700, color: '#fff' });

  // Progreso
  const px = PAD + 16, pw = CARD_W - 32;
  ctx.font = `700 14px ${font}`;
  const pagW = ctx.measureText(String(pagadas)).width;
  t(String(pagadas), px, y + 172, { size: 14, weight: 700, color: '#fff' });
  t(` de ${nroCuotas} cuotas pagadas`, px + pagW, y + 172, { size: 12.5, weight: 400, color: '#fff' });
  t(`${porcentaje}%`, px + pw, y + 172, { size: 12.5, weight: 400, color: '#fff', align: 'right' });
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  roundRect(ctx, px, y + 182, pw, 8, 4);
  ctx.fill();
  if (porcentaje > 0) {
    ctx.fillStyle = '#fff';
    roundRect(ctx, px, y + 182, Math.max(8, pw * porcentaje / 100), 8, 4);
    ctx.fill();
  }
  y += HERO_H + 14;

  /* ===== Alerta de cuotas vencidas ===== */
  if (atrasadas > 0) {
    const grave = atrasadas >= 3;
    const acento = grave ? C.red : C.orange;
    ctx.fillStyle = grave ? C.redSoft : C.orangeSoft;
    roundRect(ctx, PAD, y, CARD_W, 48, 16);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(PAD + 30, y + 24, 16, 0, Math.PI * 2);
    ctx.fill();
    t('!', PAD + 30, y + 30, { size: 16, weight: 800, color: acento, align: 'center' });
    const pre = 'Inversión con ';
    const num = String(atrasadas);
    const post = atrasadas === 1 ? ' cuota vencida.' : ' cuotas vencidas.';
    let ax = PAD + 56;
    ctx.font = `400 13.5px ${font}`;
    t(pre, ax, y + 29, { size: 13.5, weight: 400, color: C.ink });
    ax += ctx.measureText(pre).width;
    ctx.font = `700 13.5px ${font}`;
    t(num, ax, y + 29, { size: 13.5, weight: 700, color: acento });
    ax += ctx.measureText(num).width;
    t(post, ax, y + 29, { size: 13.5, weight: 400, color: C.ink });
    y += 48 + 12;
  }

  /* ===== Cartilla ===== */
  t('Cartilla', PAD + 4, y + 18, { size: 13, weight: 600, color: C.muted });
  chip(ctx, font, `${pendientes} pendientes`, W - PAD - 4, y + 18, C.blue, C.blueSoft);
  y += SECCION_H;

  card(ctx, PAD, y, CARD_W, GRID_CARD_H);
  const gx = PAD + GRID_PAD, gy = y + GRID_PAD;

  cuotas.forEach((cuota, i) => {
    const x = gx + (i % COLS) * (CELL + GAP);
    const top = gy + Math.floor(i / COLS) * (CELL + GAP);
    const cx = x + CELL / 2;
    // Misma regla que la pantalla: la primera cuota no pagada (o la siguiente a una pagada) es la siguiente a pagar.
    const siguiente = !cuota.isPagado && (i === 0 || !!cuotas[i - 1]?.isPagado);

    if (cuota.isPagado) {
      // Pagada: sello (fundido con el fondo) + fecha en que se pagó
      ctx.fillStyle = C.greenSoft;
      roundRect(ctx, x, top, CELL, CELL, 16);
      ctx.fill();
      const s = CELL * 0.56;
      if (sello) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(sello, cx - s / 2, top + 9, s, s);
        ctx.restore();
      } else {
        dibujarCheck(ctx, cx, top + 9 + s / 2, s / 2.4, C.green);
      }
      ctx.font = `700 8.5px ${font}`;
      t(ellipsis(ctx, String(cuota.fechaPago || ''), CELL - 6), cx, top + CELL - 10, { size: 8.5, weight: 700, color: C.muted, align: 'center' });
      return;
    }

    // Fondo de la celda
    ctx.fillStyle = cuota.isAtrasado ? C.redSoft : siguiente ? C.blueSoft : C.gray50;
    roundRect(ctx, x, top, CELL, CELL, 16);
    ctx.fill();
    if (siguiente) {
      ctx.strokeStyle = cuota.isAtrasado ? mezclar(C.red, 40) : mezclar(C.blue, 45);
      ctx.lineWidth = 2;
      roundRect(ctx, x + 1, top + 1, CELL - 2, CELL - 2, 15);
      ctx.stroke();
    }

    // Número en círculo
    const cy = top + CELL / 2 - 8;
    if (siguiente && !cuota.isAtrasado) {
      const g = ctx.createLinearGradient(cx - 17, cy - 17, cx + 17, cy + 17);
      g.addColorStop(0, C.blue);
      g.addColorStop(1, C.green);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = siguiente ? C.red : '#fff';
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 17, 0, Math.PI * 2);
    ctx.fill();
    const colorNum = siguiente ? '#fff' : cuota.isAtrasado ? C.red : C.gray400;
    t(String(i + 1), cx, cy + 5, { size: 14, weight: 700, color: colorNum, align: 'center' });

    // Debajo: "Siguiente" o la fecha a pagar
    const etiqueta = siguiente ? 'Siguiente' : fechaCorta(cuota.fechaPagar);
    const colorEtq = cuota.isAtrasado ? C.red : siguiente ? C.blue : C.muted;
    t(etiqueta, cx, top + CELL - 12, { size: 10, weight: 700, color: colorEtq, align: 'center' });
  });

  // Leyenda
  const ly = y + GRID_CARD_H - LEYENDA_H;
  ctx.strokeStyle = C.gray100;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD + GRID_PAD, ly + 4);
  ctx.lineTo(PAD + CARD_W - GRID_PAD, ly + 4);
  ctx.stroke();
  const items: [string, string][] = [['Pagada', C.green], ['Siguiente', C.blue], ['Vencida', C.red], ['Pendiente', C.gray200]];
  ctx.font = `400 11.5px ${font}`;
  const anchos = items.map(([txt]) => 13 + ctx.measureText(txt).width);
  const totalLeyenda = anchos.reduce((a, b) => a + b, 0) + 14 * (items.length - 1);
  let lx = W / 2 - totalLeyenda / 2;
  items.forEach(([txt, color], k) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lx + 4.5, ly + 22, 4.5, 0, Math.PI * 2);
    ctx.fill();
    t(txt, lx + 13, ly + 26, { size: 11.5, weight: 400, color: C.muted });
    lx += anchos[k] + 14;
  });
  y += GRID_CARD_H + 14;

  /* ===== Detalles de la inversión ===== */
  t('Detalles de la inversión', PAD + 4, y + 18, { size: 13, weight: 600, color: C.muted });
  y += SECCION_H;

  card(ctx, PAD, y, CARD_W, DET_CARD_H);
  detalle.forEach(([label, valor], r) => {
    const ry = y + 6 + r * DET_ROW_H;
    if (r > 0) {
      ctx.strokeStyle = C.gray100;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD + 16, ry);
      ctx.lineTo(PAD + CARD_W - 16, ry);
      ctx.stroke();
    }
    t(label, PAD + 16, ry + 27, { size: 13.5, weight: 400, color: C.muted });
    ctx.font = `600 14px ${font}`;
    const maxValor = CARD_W - 32 - ctx.measureText(label).width - 16;
    t(ellipsis(ctx, valor, maxValor), PAD + CARD_W - 16, ry + 27, { size: 14, weight: 600, color: C.ink, align: 'right' });
  });

  /* ===== Pie ===== */
  t(`Generado el ${fechaHoraActual()} · Sistema Simple Pay`, W / 2, H - 18,
    { size: 11, weight: 500, color: C.gray400, align: 'center' });

  return canvas.toDataURL('image/png').split(',')[1];
}

/* ===== Helpers de dibujo ===== */

interface TextOpts {
  size: number;
  weight: number;
  color: string | CanvasGradient;
  align?: CanvasTextAlign;
}

function textFn(ctx: CanvasRenderingContext2D, font: string) {
  return (value: string, x: number, y: number, o: TextOpts) => {
    ctx.font = `${o.weight} ${o.size}px ${font}`;
    ctx.fillStyle = o.color;
    ctx.textAlign = o.align || 'left';
    ctx.fillText(value, x, y);
  };
}

/** Recorta con "…" usando la fuente que ya tenga configurada el contexto. */
function ellipsis(ctx: CanvasRenderingContext2D, value: string, maxW: number): string {
  if (ctx.measureText(value).width <= maxW) return value;
  let v = value;
  while (v.length > 1 && ctx.measureText(v + '…').width > maxW) v = v.slice(0, -1);
  return v + '…';
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Tarjeta blanca sin borde, radio 20 y sombra suave (como .ct-card). */
function card(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, .12)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#fff';
  roundRect(ctx, x, y, w, h, 20);
  ctx.fill();
  ctx.restore();
}

/** Píldora alineada a la derecha (ej. "21 pendientes"). */
function chip(ctx: CanvasRenderingContext2D, font: string, txt: string, right: number, baseline: number, color: string, bg: string) {
  ctx.font = `600 12px ${font}`;
  const w = ctx.measureText(txt).width + 18;
  ctx.fillStyle = bg;
  roundRect(ctx, right - w, baseline - 14, w, 20, 10);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(txt, right - w / 2, baseline);
}

/** Hero con el degradado del tema, "dunas" blancas abajo y brillo arriba a la derecha (como .ct-hero). */
function dibujarHero(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, C: ReturnType<typeof colores>) {
  ctx.save();
  // Sombra azulada bajo el hero
  ctx.shadowColor = mezclar(C.blue, 45);
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, x, y, w, h, 26);
  const ang = 165 * Math.PI / 180;
  const dx = Math.sin(ang) * h / 2, dy = -Math.cos(ang) * h / 2;
  const g = ctx.createLinearGradient(x + w / 2 - dx, y + h / 2 - dy, x + w / 2 + dx, y + h / 2 + dy);
  g.addColorStop(0, mezclar(C.blue, 85));
  g.addColorStop(0.35, C.blue);
  g.addColorStop(1, mezclarColores(C.green, C.blue, 80));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, 26);
  ctx.clip();
  // Brillo arriba a la derecha
  const glow = ctx.createRadialGradient(x + w * 0.85, y, 0, x + w * 0.85, y, w * 0.55);
  glow.addColorStop(0, 'rgba(255,255,255,.28)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  // Dunas
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + h * 1.12, w * 0.68, h * 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.13)';
  ctx.beginPath();
  ctx.ellipse(x + w, y + h * 1.08, w * 0.6, h * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.09)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 1.28, w * 0.8, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Respaldo si no se pudo cargar la imagen del sello. */
function dibujarCheck(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.4, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.3);
  ctx.lineTo(cx + r * 0.45, cy - r * 0.3);
  ctx.stroke();
  ctx.restore();
}

/**
 * Sello de cuota pagada: el mismo que usa la cartilla (pathSello en sessionStorage o el de la app).
 * Se pide con crossOrigin para no "ensuciar" el canvas; si el servidor del sello no lo permite,
 * falla la carga y se dibuja un check en su lugar.
 */
function cargarSello(): Promise<HTMLImageElement | null> {
  const guardado = sessionStorage.getItem('pathSello');
  const src = guardado && guardado !== 'null' ? guardado : 'public/logos/sello_ssimple.png';
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* ===== Colores: el canvas no entiende color-mix, se mezcla a mano ===== */

function hexARgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.substring(0, 6), 16);
  if (Number.isNaN(n)) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Equivalente a color-mix(in srgb, color pct%, #fff). */
function mezclar(color: string, pct: number): string {
  return mezclarColores(color, '#ffffff', pct);
}

/** Equivalente a color-mix(in srgb, a pct%, b). */
function mezclarColores(a: string, b: string, pct: number): string {
  const [r1, g1, b1] = hexARgb(a);
  const [r2, g2, b2] = hexARgb(b);
  const p = pct / 100;
  const m = (x: number, y: number) => Math.round(x * p + y * (1 - p));
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
}

/* ===== Formatos ===== */

/** "24 de abr. 2025" -> "24 abr." (mismo formato que getFechaSinAnio de la cartilla). */
function fechaCorta(fecha?: string): string {
  if (!fecha) return '';
  const partes = fecha.split(' ');
  return partes.length >= 3 ? `${partes[0]} ${partes[2]}` : fecha;
}

function capitalizar(texto: string): string {
  return texto.toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase());
}

function formatMonto(value: any): string {
  const n = Number(value);
  if (value == null || Number.isNaN(n)) return '';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fechaHoraActual(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
