import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import QRCode from 'qrcode'

// Certificate PDF (A4 landscape). Returns Uint8Array.
export async function makeCertificatePdf({ name, courseTitle, instructor, certId, issueDate, verifyUrl }) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([842, 595]) // A4 landscape
  const { width, height } = page.getSize()

  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  // Background: subtle radial gradient (approximated with rects)
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.055, 0.055, 0.117) })
  // decorative bars
  page.drawRectangle({ x: 0, y: height - 22, width, height: 22, color: rgb(0.31, 0.27, 0.90) })
  page.drawRectangle({ x: 0, y: 0, width, height: 22, color: rgb(0.86, 0.15, 0.47) })

  // Inner border
  page.drawRectangle({ x: 40, y: 40, width: width - 80, height: height - 80, borderColor: rgb(0.55, 0.36, 0.96), borderWidth: 2 })
  page.drawRectangle({ x: 50, y: 50, width: width - 100, height: height - 100, borderColor: rgb(0.55, 0.36, 0.96), borderWidth: 0.5, opacity: 0.4 })

  // Brand header
  page.drawText('INTEGRATIONx PRO', { x: width / 2 - 100, y: height - 90, size: 22, font, color: rgb(0.98, 0.98, 0.98) })
  page.drawText('SAP BTP & Enterprise Integration Experts', { x: width / 2 - 130, y: height - 112, size: 10, font: regular, color: rgb(0.7, 0.7, 0.8) })

  // Title
  page.drawText('Certificate of Completion', { x: width / 2 - 175, y: height - 175, size: 26, font, color: rgb(0.55, 0.36, 0.96) })

  // "This is to certify that"
  page.drawText('This is proudly presented to', { x: width / 2 - 100, y: height - 225, size: 12, font: italic, color: rgb(0.75, 0.75, 0.85) })

  // Name
  const nameSize = 34
  const nameWidth = font.widthOfTextAtSize(name, nameSize)
  page.drawText(name, { x: (width - nameWidth) / 2, y: height - 275, size: nameSize, font, color: rgb(1, 1, 1) })
  page.drawLine({ start: { x: (width - nameWidth) / 2 - 10, y: height - 285 }, end: { x: (width + nameWidth) / 2 + 10, y: height - 285 }, thickness: 0.8, color: rgb(0.55, 0.36, 0.96) })

  // "for successfully completing"
  page.drawText('for successfully completing the course', { x: width / 2 - 125, y: height - 315, size: 12, font: regular, color: rgb(0.75, 0.75, 0.85) })

  // Course title
  const courseSize = 20
  const courseWidth = font.widthOfTextAtSize(courseTitle, courseSize)
  page.drawText(courseTitle, { x: (width - courseWidth) / 2, y: height - 355, size: courseSize, font, color: rgb(0.6, 0.85, 1) })

  // Meta row
  page.drawText(`Instructor: ${instructor}`, { x: 90, y: 130, size: 10, font: regular, color: rgb(0.8, 0.8, 0.9) })
  page.drawText(`Issued: ${issueDate}`, { x: 90, y: 112, size: 10, font: regular, color: rgb(0.8, 0.8, 0.9) })
  page.drawText(`Certificate ID: ${certId}`, { x: 90, y: 94, size: 9, font: regular, color: rgb(0.65, 0.65, 0.75) })

  // QR code
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: '#ffffff', light: '#0e0e1e' } })
  const qrBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64')
  const qrImg = await pdf.embedPng(qrBytes)
  page.drawImage(qrImg, { x: width - 170, y: 80, width: 90, height: 90 })
  page.drawText('Scan to verify', { x: width - 165, y: 65, size: 8, font: regular, color: rgb(0.7, 0.7, 0.8) })

  // Signature line
  page.drawLine({ start: { x: width / 2 - 80, y: 130 }, end: { x: width / 2 + 80, y: 130 }, thickness: 0.6, color: rgb(0.6, 0.6, 0.7) })
  page.drawText('Rajesh Kumar', { x: width / 2 - 40, y: 138, size: 12, font, color: rgb(0.95, 0.95, 0.95) })
  page.drawText('Principal Instructor', { x: width / 2 - 45, y: 115, size: 9, font: regular, color: rgb(0.7, 0.7, 0.8) })

  // Diagonal watermark
  page.drawText('VERIFIED', { x: 100, y: 200, size: 90, font, color: rgb(0.55, 0.36, 0.96), opacity: 0.04, rotate: degrees(-20) })

  return await pdf.save()
}

// GST Invoice PDF (A4 portrait). India-format with CGST 9% + SGST 9%.
export async function makeInvoicePdf({ invoiceNo, invoiceDate, buyerName, buyerEmail, courseTitle, amountRupees, paymentId }) {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const { width, height } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  const regular = await pdf.embedFont(StandardFonts.Helvetica)

  const total = Number(amountRupees) || 0
  // Backwards - assume price is INCLUSIVE of 18% GST
  const taxable = +(total / 1.18).toFixed(2)
  const cgst = +((total - taxable) / 2).toFixed(2)
  const sgst = cgst

  // Header band
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: rgb(0.31, 0.27, 0.90) })
  page.drawText('INTEGRATIONx PRO', { x: 40, y: height - 45, size: 22, font, color: rgb(1, 1, 1) })
  page.drawText('Tax Invoice', { x: width - 130, y: height - 45, size: 16, font, color: rgb(1, 1, 1) })
  page.drawText('www.integrationx.pro', { x: 40, y: height - 68, size: 10, font: regular, color: rgb(0.9, 0.9, 0.95) })
  page.drawText('GSTIN: 29ABCDE1234F1Z5', { x: 40, y: height - 84, size: 9, font: regular, color: rgb(0.9, 0.9, 0.95) })

  // Invoice meta box
  let y = height - 140
  page.drawText(`Invoice No: ${invoiceNo}`, { x: 40, y, size: 10, font, color: rgb(0, 0, 0) })
  page.drawText(`Date: ${invoiceDate}`, { x: 40, y: y - 15, size: 10, font: regular, color: rgb(0.2, 0.2, 0.2) })
  page.drawText(`Payment ID: ${paymentId}`, { x: 40, y: y - 30, size: 10, font: regular, color: rgb(0.2, 0.2, 0.2) })

  // Bill to
  page.drawText('Bill To:', { x: 340, y, size: 10, font, color: rgb(0, 0, 0) })
  page.drawText(buyerName || 'Customer', { x: 340, y: y - 15, size: 10, font: regular, color: rgb(0.2, 0.2, 0.2) })
  page.drawText(buyerEmail || '', { x: 340, y: y - 30, size: 9, font: regular, color: rgb(0.4, 0.4, 0.4) })

  // Table header
  y -= 70
  page.drawRectangle({ x: 40, y, width: width - 80, height: 26, color: rgb(0.93, 0.93, 0.97) })
  page.drawText('Description', { x: 50, y: y + 8, size: 10, font, color: rgb(0.1, 0.1, 0.2) })
  page.drawText('HSN/SAC', { x: 300, y: y + 8, size: 10, font, color: rgb(0.1, 0.1, 0.2) })
  page.drawText('Amount', { x: width - 100, y: y + 8, size: 10, font, color: rgb(0.1, 0.1, 0.2) })

  // Row
  y -= 40
  page.drawText(courseTitle.length > 45 ? courseTitle.slice(0, 45) + '...' : courseTitle, { x: 50, y, size: 10, font: regular, color: rgb(0.1, 0.1, 0.2) })
  page.drawText('999293', { x: 300, y, size: 10, font: regular, color: rgb(0.1, 0.1, 0.2) }) // Online course HSN
  page.drawText(`INR ${taxable.toFixed(2)}`, { x: width - 110, y, size: 10, font: regular, color: rgb(0.1, 0.1, 0.2) })
  page.drawText('Online IT / SAP training - lifetime access', { x: 50, y: y - 15, size: 8, font: regular, color: rgb(0.5, 0.5, 0.55) })

  // Totals
  y -= 60
  const drawTotalRow = (label, value, bold = false) => {
    page.drawText(label, { x: 340, y, size: 10, font: bold ? font : regular, color: rgb(0.1, 0.1, 0.2) })
    page.drawText(`INR ${value.toFixed(2)}`, { x: width - 110, y, size: 10, font: bold ? font : regular, color: rgb(0.1, 0.1, 0.2) })
    y -= 20
  }
  drawTotalRow('Taxable Amount', taxable)
  drawTotalRow('CGST @ 9%', cgst)
  drawTotalRow('SGST @ 9%', sgst)
  page.drawLine({ start: { x: 340, y: y + 15 }, end: { x: width - 50, y: y + 15 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) })
  drawTotalRow('Grand Total (INR)', total, true)
  // Footer
  page.drawText('This is a computer-generated invoice. GST included. No signature required.', { x: 40, y: 80, size: 9, font: regular, color: rgb(0.4, 0.4, 0.45) })
  page.drawText('For queries: support@integrationx.pro', { x: 40, y: 66, size: 9, font: regular, color: rgb(0.4, 0.4, 0.45) })

  return await pdf.save()
}
