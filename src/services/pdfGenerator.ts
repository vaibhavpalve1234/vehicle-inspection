import * as Print from 'expo-print';
import { InspectionData } from '../types/inspection';
import { StorageService } from './storageService';

export class PdfGeneratorService {
  /**
   * Generates offline PDF matching the exact template from the vehicle inspection report
   */
  static async generateReportPdf(data: InspectionData): Promise<string> {
    // 1. Preload base64 for standard photos
    const loadedStandardPhotos = await Promise.all(
      data.standardPhotos.map(async (slot) => {
        if (!slot.uri) return { ...slot, base64: null };
        const b64 = await StorageService.getPhotoBase64(slot.uri);
        return { ...slot, base64: b64 };
      })
    );

    // 2. Preload base64 for extra photos
    const loadedExtraPhotos = await Promise.all(
      data.extraPhotos.map(async (item) => {
        const b64 = await StorageService.getPhotoBase64(item.uri);
        return { ...item, base64: b64 };
      })
    );

    const htmlContent = this.buildHtmlTemplate(data, loadedStandardPhotos, loadedExtraPhotos);

    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    return uri;
  }

  private static buildHtmlTemplate(
    data: InspectionData,
    standardPhotos: Array<any>,
    extraPhotos: Array<any>
  ): string {
    const { info, sections, remarks } = data;

    // Helper for status badge HTML
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'OK':
          return `<span class="badge badge-ok">OK</span>`;
        case 'Attention':
          return `<span class="badge badge-attention">Attention</span>`;
        case 'Failed':
          return `<span class="badge badge-failed">Failed</span>`;
        case 'NA':
        default:
          return `<span class="badge badge-na">NA</span>`;
      }
    };

    // Build Table Sections HTML
    const sectionsHtml = sections
      .map((sec) => {
        const rows = sec.items
          .map(
            (item) => `
            <tr>
              <td class="col-checkpoint">${item.name}</td>
              <td class="col-status">${getStatusBadge(item.status)}</td>
              <td class="col-obs">${item.observation || '—'}</td>
            </tr>
          `
          )
          .join('');

        return `
          <div class="section-container">
            <div class="section-header">${sec.title}</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Checkpoint</th>
                  <th style="width: 20%;">Status</th>
                  <th style="width: 30%;">Observation</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    // Filter standard photos that have an uploaded image
    const availableStandardPhotos = standardPhotos.filter((p) => p.base64);

    const standardPhotosHtml = availableStandardPhotos.length > 0
      ? `
        <div class="photos-title-container">
          <h2 class="section-title">Vehicle Photos</h2>
        </div>
        <div class="photos-grid">
          ${availableStandardPhotos
            .map(
              (p) => `
              <div class="photo-card">
                <div class="photo-label">${p.title}</div>
                <div class="photo-img-box">
                  <img src="${p.base64}" alt="${p.title}" />
                </div>
                ${p.observation ? `<div class="photo-obs">${p.observation}</div>` : ''}
              </div>
            `
            )
            .join('')}
        </div>
      `
      : '';

    const extraPhotosHtml = extraPhotos.length > 0
      ? `
        <div class="photos-title-container" style="margin-top: 35px;">
          <h2 class="section-title">Extra Photos</h2>
        </div>
        <div class="photos-grid extra-grid">
          ${extraPhotos
            .map(
              (p, idx) => `
              <div class="photo-card extra-card">
                <div class="photo-label">${p.title || `Extra Photo #${idx + 1}`}</div>
                <div class="photo-img-box">
                  <img src="${p.base64}" alt="${p.title || 'Extra Photo'}" />
                </div>
                ${p.observation ? `<div class="photo-obs">${p.observation}</div>` : ''}
              </div>
            `
            )
            .join('')}
        </div>
      `
      : '';

    const remarksListHtml = remarks
      ? remarks
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .map((line) => `<div class="remark-item">${line}</div>`)
          .join('')
      : '<div class="remark-item">No major remarks recorded.</div>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Live Vehicle Inspection Report - ${info.registrationNumber || 'Report'}</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background-color: #ffffff;
            font-size: 11.5px;
            line-height: 1.45;
            padding: 24px 28px;
          }
          
          /* Header */
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 12px;
            border-bottom: 3px solid #f97316;
            margin-bottom: 16px;
          }
          .brand-box {
            display: flex;
            flex-direction: column;
          }
          .brand-logo-text {
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.5px;
          }
          .brand-logo-text span {
            color: #ea580c;
          }
          .brand-tagline {
            font-size: 8px;
            font-weight: 700;
            color: #6b7280;
            letter-spacing: 0.8px;
            margin-top: 1px;
            text-transform: uppercase;
          }
          .report-main-title {
            text-align: right;
          }
          .report-main-title h1 {
            font-size: 22px;
            font-weight: 800;
            color: #111827;
            margin: 0;
          }
          .report-main-title .report-subtitle {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
            font-weight: 500;
          }

          /* Customer Info Grid */
          .customer-info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
            margin-bottom: 22px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            row-gap: 12px;
            column-gap: 12px;
          }
          .info-cell {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-size: 8.5px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .info-value {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
          }

          /* Section Container */
          .section-container {
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .section-header {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            padding: 7px 12px;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            letter-spacing: 0.2px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
            border-top: none;
            background-color: #ffffff;
          }
          .data-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            text-align: left;
            padding: 6px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .data-table td {
            padding: 6.5px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 11px;
            color: #1e293b;
            vertical-align: middle;
          }
          .data-table tr:last-child td {
            border-bottom: none;
          }
          .data-table tr:nth-child(even) td {
            background-color: #fafbfc;
          }
          .col-checkpoint {
            font-weight: 600;
            color: #1e293b;
          }
          .col-status {
            font-weight: 700;
          }
          .col-obs {
            color: #64748b;
            font-size: 10.5px;
          }

          /* Status Badges */
          .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 700;
            text-align: center;
          }
          .badge-ok {
            color: #15803d;
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
          }
          .badge-attention {
            color: #b45309;
            background-color: #fffbeb;
            border: 1px solid #fde68a;
          }
          .badge-failed {
            color: #b91c1c;
            background-color: #fef2f2;
            border: 1px solid #fecaca;
          }
          .badge-na {
            color: #64748b;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          /* Photo Section */
          .photos-title-container {
            border-bottom: 2px solid #ea580c;
            padding-bottom: 6px;
            margin-top: 30px;
            margin-bottom: 16px;
            page-break-before: always;
          }
          .section-title {
            font-size: 17px;
            font-weight: 800;
            color: #0f172a;
          }
          .photos-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            page-break-inside: auto;
          }
          .photo-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background-color: #ffffff;
            padding: 8px;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
          }
          .photo-label {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .photo-img-box {
            width: 100%;
            height: 190px;
            border-radius: 4px;
            overflow: hidden;
            background-color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .photo-img-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .photo-obs {
            margin-top: 6px;
            font-size: 10px;
            color: #475569;
            background-color: #f8fafc;
            padding: 3px 6px;
            border-radius: 3px;
          }

          /* Extra photos 3-column grid */
          .extra-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .extra-card .photo-img-box {
            height: 130px;
          }

          /* Remarks Box */
          .remarks-container {
            margin-top: 28px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
          }
          .remarks-header {
            background-color: #f8fafc;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
          }
          .remarks-content {
            padding: 12px;
            background-color: #ffffff;
            font-size: 11px;
            color: #334155;
            line-height: 1.6;
          }
          .remark-item {
            margin-bottom: 4px;
          }

          /* Footer */
          .report-footer {
            margin-top: 35px;
            border-top: 2px solid #e2e8f0;
            padding-top: 14px;
            text-align: center;
            page-break-inside: avoid;
          }
          .footer-brand {
            font-size: 13px;
            font-weight: 800;
            color: #0f172a;
          }
          .footer-sub {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
          }
          .footer-contact {
            font-size: 9.5px;
            color: #64748b;
            margin-top: 4px;
          }

          @media print {
            body {
              padding: 16px;
            }
            .section-container {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>

        <!-- Header -->
        <div class="header-top">
          <div class="brand-box">
            <div class="brand-logo-text">Inspect <span>AutoCar</span></div>
            <div class="brand-tagline">PDI & PPI Service Providers · Transparent · Trusted · Professional</div>
          </div>
          <div class="report-main-title">
            <h1>Live Vehicle Inspection</h1>
            <div class="report-subtitle">PDI / PPI Customer Report</div>
          </div>
        </div>

        <!-- Customer & Vehicle Info -->
        <div class="customer-info-box">
          <div class="info-cell">
            <div class="info-label">Customer</div>
            <div class="info-value">${info.customerName || '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Mobile</div>
            <div class="info-value">${info.mobile || '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Vehicle</div>
            <div class="info-value">${info.vehicleModel || '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Registration</div>
            <div class="info-value">${info.registrationNumber || '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">VIN</div>
            <div class="info-value">${info.vin || '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Odometer</div>
            <div class="info-value">${info.odometer ? `${info.odometer} km` : '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Inspection</div>
            <div class="info-value">${info.inspectionType || 'PPI'} · ${info.inspectionDate || '—'}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">Inspector</div>
            <div class="info-value">${info.inspectorName || '—'}</div>
          </div>
        </div>

        <!-- 1. All Inspection Checkpoints Tables First -->
        ${sectionsHtml}

        <!-- 2. Vehicle Standard Photos Grid -->
        ${standardPhotosHtml}

        <!-- 3. Extra Photos Grid (e.g. paint gauge, damage) -->
        ${extraPhotosHtml}

        <!-- 4. Remarks Section -->
        <div class="remarks-container">
          <div class="remarks-header">Remarks</div>
          <div class="remarks-content">
            ${remarksListHtml}
          </div>
        </div>

        <!-- 5. Footer -->
        <div class="report-footer">
          <div class="footer-brand">Inspect AutoCar</div>
          <div class="footer-sub">Professional Vehicle Inspection</div>
          <div class="footer-contact">https://www.autoinspectcar.co.in | +91 87790 90854 · +91 87790 85433 | inspectautocar@gmail.com · India</div>
        </div>

      </body>
      </html>
    `;
  }
}
