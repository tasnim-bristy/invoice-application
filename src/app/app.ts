import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements OnInit {
  @ViewChild('invoiceDialog') dialog!: ElementRef;
  @ViewChild('previewDialog') previewDialog!: ElementRef;
  constructor(private cdr: ChangeDetectorRef) {}

  showInvoiceCard = false;
  showHistory = true;
  shopObj: Shop = new Shop();
  invoices: Shop[] = [];
  customerNames: string[] = [];
  savedInvoice: Shop | null = null;
  editIndex: number | null = null;

  // Validation trigger
  showValidation = false;

  ngOnInit() {
    const data = localStorage.getItem('invoiceApplication');

    if (data) {
      this.invoices = JSON.parse(data);
      const lastInvoice = this.invoices[this.invoices.length - 1];
      const names = this.invoices.map((inv) => inv.customerName);
      this.customerNames = [...new Set(names)];
      this.shopObj.invoiceNo = Number(lastInvoice.invoiceNo) + 1;
      this.shopObj.customerId = lastInvoice.customerId + 1;
    } else {
      this.shopObj.invoiceNo = 1;
      this.shopObj.customerId = 100;
    }
  }

  openInvoice() {
    this.dialog.nativeElement.open = true;
    this.showInvoiceCard = false;
  }

  resetForm() {
    const lastInvoice =
      this.invoices.length > 0 ? this.invoices[this.invoices.length - 1].invoiceNo : 0;

    const lastCustomer =
      this.invoices.length > 0 ? this.invoices[this.invoices.length - 1].customerId : 100;

    this.shopObj = new Shop();
    this.shopObj.invoiceNo = lastInvoice + 1;
    this.shopObj.customerId = lastCustomer + 1;

    this.showValidation = false;
  }

  closeDialog() {
    this.dialog.nativeElement.open = false;
    this.resetForm();
  }

  closePreview() {
    (this.previewDialog.nativeElement as any).open = false;
    this.showHistory = true;
  }

  addItem() {
    this.shopObj.items.push(new InvoiceItem());
  }

  updateCustomerName(event: any) {
    const combobox = event.target as any;
    const selectedItem = event.detail?.selectedItem;
    if (selectedItem) {
      this.shopObj.customerName = selectedItem.text;
    } else {
      this.shopObj.customerName = combobox.value;
    }
  }

  onCustomerInput(event: any) {
    this.shopObj.customerName = event.detail.value;
  }

  onCustomerSelect(event: any) {
    const selectedItem = event.detail.selectedItem;
    if (selectedItem) {
      this.shopObj.customerName = selectedItem.text;
    }
  }

  saveInvoice() {
    this.showValidation = true;

    if (
      !this.shopObj.customerName ||
      !this.shopObj.customerAddress ||
      !this.shopObj.taxCode ||
      this.shopObj.items.some((item) => !item.products || !item.quantity || !item.unitPrice)
    )
      if (this.editIndex !== null) {
        this.invoices[this.editIndex] = JSON.parse(JSON.stringify(this.shopObj));
        this.editIndex = null;
      } else {
        this.invoices.push(JSON.parse(JSON.stringify(this.shopObj)));
      }
    localStorage.setItem('invoiceApplication', JSON.stringify(this.invoices));

    if (!this.customerNames.includes(this.shopObj.customerName)) {
      this.customerNames.push(this.shopObj.customerName);
    }

    // Reset form
    const lastInvoice = this.shopObj.invoiceNo;
    const lastCustomer = this.shopObj.customerId;
    this.shopObj = new Shop();
    this.shopObj.invoiceNo = lastInvoice + 1;
    this.shopObj.customerId = lastCustomer + 1;

    this.showValidation = false;
    this.closeDialog();
  }

  isFieldInvalid(field: keyof Shop) {
    if (!this.showValidation) return false;
    return !this.shopObj[field];
  }
  updateField(field: keyof Shop, event: any) {
    const value = event.target.value;
    (this.shopObj as any)[field] = value;
  }

  updateTaxCode(event: any) {
    this.shopObj.taxCode = event.detail.selectedOption.value;
  }

  updateItemField(index: number, field: keyof InvoiceItem, event: any) {
    let value: any;

    if (field === 'products') {
      value = event.detail.item.text;
    } else {
      value = event.target.value;
    }

    const item = this.shopObj.items[index];
    (item as any)[field] = value;

    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const taxPercent = Number(item.tax) || 0;

    item.total = quantity * unitPrice * (1 + taxPercent / 100);
  }

  // net total
  get subtotal(): number {
    return this.shopObj.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
  }

  get taxTotal(): number {
    return this.shopObj.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const tax = Number(item.tax) || 0;

      const itemTax = quantity * unitPrice * (tax / 100);
      return sum + itemTax;
    }, 0);
  }

  get netTotal(): number {
    return this.subtotal + this.taxTotal;
  }

  // download as a pdf
  isBusy = false;

  async downloadInvoice() {
    if (!this.savedInvoice) return;

    this.isBusy = true;
    this.cdr.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      let y = 10;

      // --- Header ---
      pdf.setFontSize(16);
      pdf.text(`Invoice #${this.savedInvoice.invoiceNo || 0}`, margin, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.text(
        `Date: ${
          this.savedInvoice.invoiceDate
            ? new Date(this.savedInvoice.invoiceDate).toLocaleDateString()
            : ''
        }`,
        margin,
        y,
      );
      y += 10;

      pdf.text(`Customer Name: ${this.savedInvoice.customerName || ''}`, margin, y);
      y += 10;

      pdf.text(`Customer Address: ${this.savedInvoice.customerAddress || ''}`, margin, y);
      y += 10;

      pdf.text(`Tax Code: ${this.savedInvoice.taxCode || ''}`, margin, y);
      y += 10;

      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;

      // --- Table Header ---
      pdf.setFont('helvetica', 'bold');
      const headers = ['Product', 'Qty', 'Unit Price', 'Tax', 'Total'];
      const colWidths = [70, 20, 30, 20, 30];
      let x = margin;
      headers.forEach((h, i) => {
        pdf.text(h, x, y);
        x += colWidths[i];
      });
      y += 7;
      pdf.setFont('helvetica', 'normal');

      pdf.setLineWidth(0.2);
      pdf.line(margin, y - 5, pageWidth - margin, y - 5);

      // --- Table Rows ---
      this.savedInvoice.items.forEach((item) => {
        if (!item.products && !item.quantity && !item.unitPrice && !item.tax && !item.total) return;

        x = margin;
        const values = [
          item.products || '',
          Number(item.quantity || 0).toString(),
          Number(item.unitPrice || 0).toFixed(2),
          Number(item.tax || 0).toFixed(2),
          Number(item.total || 0).toFixed(2),
        ];

        values.forEach((v, i) => {
          pdf.text(v, x, y);
          x += colWidths[i];
        });
        y += 7;
      });

      y += 5;
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;

      // --- Totals ---
      const labelX = pageWidth - margin - 40;
      const valueX = pageWidth - margin;

      pdf.setFont('helvetica');
      pdf.text(`Subtotal: ${(this.previewSubtotal || 0).toFixed(2)}`, valueX, y, {
        align: 'right',
      });
      y += 7;
      pdf.text(`Tax: ${(this.previewTaxTotal || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      y += 7;
      pdf.text(`Net Total: ${(this.previewNetTotal || 0).toFixed(2)}`, valueX, y, {
        align: 'right',
      });

      // --- Save PDF ---
      pdf.save(`Invoice-${this.savedInvoice.invoiceNo || 0}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      this.isBusy = false;
      this.cdr.detectChanges();
      this.closePreview();
    }
  }

  // downloadInvoice() {
  //   const doc = new jsPDF();
  //   doc.text('Hello World!', 10, 10);
  //   doc.save('hello');
  // }

  // delete row
  deleteItem(index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.shopObj.items.splice(index, 1);

      const data = localStorage.getItem('invoiceApplication');

      if (data) {
        const invoices = JSON.parse(data);
        invoices[invoices.length - 1].items = this.shopObj.items;

        localStorage.setItem('invoiceApplication', JSON.stringify(invoices));
      }
    }
  }

  // history
  openHistory() {
    this.showInvoiceCard = false;
    this.showHistory = true;
  }

  closeHistory() {
    this.showHistory = false;
    this.showInvoiceCard = true;
  }

  viewInvoice(index: number) {
    this.shopObj = JSON.parse(JSON.stringify(this.invoices[index]));
    this.dialog.nativeElement.open = true;
    this.showInvoiceCard = false;
    this.editIndex = index;
  }

  deleteInvoice(index: number) {
    if (confirm('Delete this invoice?')) {
      this.invoices.splice(index, 1);
      localStorage.setItem('invoiceApplication', JSON.stringify(this.invoices));
    }
  }

  // preview
  openPreviewFromHistory(index: number) {
    this.savedInvoice = JSON.parse(JSON.stringify(this.invoices[index]));
    const previewEl = this.previewDialog.nativeElement as any;
    previewEl.open = true;
    this.cdr.detectChanges();
  }

  get previewSubtotal(): number {
    if (!this.savedInvoice) return 0;

    return this.savedInvoice.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;

      return sum + quantity * unitPrice;
    }, 0);
  }

  get previewTaxTotal(): number {
    if (!this.savedInvoice) return 0;

    return this.savedInvoice.items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const tax = Number(item.tax) || 0;

      const itemTax = quantity * unitPrice * (tax / 100);
      return sum + itemTax;
    }, 0);
  }

  get previewNetTotal(): number {
    return this.previewSubtotal + this.previewTaxTotal;
  }
}

export class Shop {
  invoiceNo: number;
  invoiceDate: Date;
  customerId: number;
  customerName: string;
  customerAddress: string;
  taxCode: string = '';
  items: InvoiceItem[];

  constructor() {
    this.invoiceNo = 0;
    this.invoiceDate = new Date();
    this.customerId = 0;
    this.customerName = '';
    this.customerAddress = '';
    this.taxCode = '';
    this.items = [new InvoiceItem()];
  }
}

export class InvoiceItem {
  products: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;

  constructor() {
    this.products = '';
    this.quantity = 0;
    this.unitPrice = 0;
    this.tax = 0;
    this.total = 0;
  }
}
