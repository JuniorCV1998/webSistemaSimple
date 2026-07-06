interface CronogramaItemPdf {
  nroCuota: number;
  fechaCierre: string;
  diasCuota: number;
  montoCuota: number;
  pagado: boolean;
}

interface CronogramaGrupoPdf {
  label: string;
  items: CronogramaItemPdf[];
  montoGrupo: number;
}

interface GenerarPdfParams {
  invDetail: any;
  pathLogo: string | null;
  currency: string;
  grupos: CronogramaGrupoPdf[];
  totalCuotas: number;
  totalMonto: number;
  mostrarMontosAgregados: boolean;
}

const DEFAULT_LOGO = 'public/logos/logo_ssimple.png';

const PRIMARY: [number, number, number] = [16, 185, 129];
const GRAY: [number, number, number] = [107, 114, 128];
const GRAY_DARK: [number, number, number] = [55, 65, 81];
const HEADER_HEIGHT = 26;
const MARGIN = 14;

export async function generarPdfCronograma(params: GenerarPdfParams) {
  const { invDetail, pathLogo, currency, grupos, totalCuotas, totalMonto, mostrarMontosAgregados } = params;

  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoDataUrl = await imageUrlToDataUrl(pathLogo);
  const logoFormat = logoDataUrl ? detectImageFormat(logoDataUrl) : null;

  const drawHeader = () => {
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    if (logoDataUrl && logoFormat) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(MARGIN, 4, 18, 18, 2, 2, 'F');
      try {
        doc.addImage(logoDataUrl, logoFormat, MARGIN + 1.5, 5.5, 15, 15);
      } catch (e) {
        console.warn('[cronograma-pdf] No se pudo dibujar el logo en el PDF:', e);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Cronograma de pago', MARGIN + 24, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(invDetail?.fullName ?? '', MARGIN + 24, 18);

    doc.setFontSize(8);
    doc.text(`Placa: ${invDetail?.placaVehiculo ?? '-'}`, pageWidth - MARGIN, 10, { align: 'right' });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')}`, pageWidth - MARGIN, 15, { align: 'right' });
  };

  const drawFooter = (pageNumber: number, pageCount: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...PRIMARY);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, pageHeight - 12, pageWidth - MARGIN, pageHeight - 12);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Sistema Simple', MARGIN, pageHeight - 7);
    doc.text(`Página ${pageNumber} de ${pageCount}`, pageWidth - MARGIN, pageHeight - 7, { align: 'right' });
  };

  drawHeader();

  // Resumen de la inversión
  autoTable(doc, {
    startY: HEADER_HEIGHT + 6,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.2, textColor: GRAY_DARK },
    body: [
      ['Frecuencia', invDetail?.frecuencia ?? '-', 'Duración', `${invDetail?.duracionPago ?? '-'} meses`],
      ['Fecha inicio', invDetail?.fechaInicio ?? '-', 'Fecha fin', invDetail?.fechaFin ?? '-'],
      ['N° de cuotas', String(totalCuotas), ...(mostrarMontosAgregados ? ['Monto total', `${currency} ${totalMonto.toFixed(2)}`] : ['', ''])],
    ],
    columnStyles: {
      0: { fontStyle: 'bold', textColor: GRAY, cellWidth: 28 },
      2: { fontStyle: 'bold', textColor: GRAY, cellWidth: 28 },
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Tabla principal, agrupada por mes
  const body: any[] = [];
  for (const grupo of grupos) {
    const tituloGrupo = mostrarMontosAgregados
      ? `${grupo.label}   ·   Subtotal ${currency} ${grupo.montoGrupo.toFixed(2)}`
      : grupo.label;
    body.push([{
      content: tituloGrupo,
      colSpan: 5,
      styles: { fillColor: [230, 249, 239], textColor: PRIMARY, fontStyle: 'bold', halign: 'left' }
    }]);
    for (const item of grupo.items) {
      body.push([
        item.nroCuota.toString().padStart(2, '0'),
        item.fechaCierre,
        item.diasCuota,
        `${currency} ${item.montoCuota.toFixed(2)}`,
        item.pagado ? 'Pagado' : 'Pendiente'
      ]);
    }
  }

  autoTable(doc, {
    startY: finalY,
    head: [['N° Cuota', 'Fecha de pago', 'Días', 'Monto', 'Estado']],
    body,
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 250, 249] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'center' },
    },
    margin: { top: HEADER_HEIGHT + 4, bottom: 16 },
    didDrawPage: () => drawHeader(),
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(i, pageCount);
  }

  doc.save(`cronograma-${invDetail?.placaVehiculo ?? 'inversion'}.pdf`);
}

async function imageUrlToDataUrl(url: string | null): Promise<string | null> {
  const dataUrl = url ? await fetchImageAsDataUrl(url) : null;
  // Si el logo del inversor no se pudo leer (ej. el bucket de Firebase Storage no permite fetch por CORS),
  // se usa el logo por defecto del sistema para que el PDF nunca quede sin logo.
  if (dataUrl) return dataUrl;
  if (url === DEFAULT_LOGO) return null;
  console.warn(`[cronograma-pdf] No se pudo leer el logo "${url}", se usará el logo por defecto en el PDF.`);
  return fetchImageAsDataUrl(DEFAULT_LOGO);
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[cronograma-pdf] fetch("${url}") respondió ${response.status} ${response.statusText}`);
      return null;
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    // Motivo típico: el bucket de Firebase Storage no tiene configurado CORS para este origen,
    // así que fetch() falla aunque la misma URL funcione bien en un <img src="...">.
    console.warn(`[cronograma-pdf] No se pudo descargar la imagen "${url}" (posible bloqueo CORS):`, e);
    return null;
  }
}

function detectImageFormat(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' | null {
  const match = dataUrl.match(/^data:image\/(png|jpe?g|webp)/i);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  if (ext === 'png') return 'PNG';
  if (ext === 'webp') return 'WEBP';
  return 'JPEG';
}
