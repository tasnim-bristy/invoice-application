import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  constructor(private cdr: ChangeDetectorRef) {}

  showInvoiceCard = true;
  showHistory = false;
  shopObj: Shop = new Shop();
  invoices: Shop[] = [];
  customerNames: string[] = [];

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

  closeDialog() {
    this.dialog.nativeElement.open = false;
    this.showInvoiceCard = true;
  }

  addItem() {
    this.shopObj.items.push(new InvoiceItem());
  }

  updateCustomerName(event: any) {
    const value = event.target.value;
    this.shopObj.customerName = value;
  }

  saveInvoice() {
    this.showValidation = true;

    if (
      !this.shopObj.customerName ||
      !this.shopObj.customerAddress ||
      !this.shopObj.taxCode ||
      this.shopObj.items.some((item) => !item.products || !item.quantity || !item.unitPrice)
    ) {
      return; // stop save
    }

    // SAVE
    this.invoices.push({ ...this.shopObj });
    localStorage.setItem('invoiceApplication', JSON.stringify(this.invoices));

    // reset form
    const lastInvoice = this.shopObj.invoiceNo;
    const lastCustomer = this.shopObj.customerId;

    this.shopObj = new Shop();
    this.shopObj.invoiceNo = lastInvoice + 1;
    this.shopObj.customerId = lastCustomer + 1;

    this.showValidation = false;
    this.cdr.detectChanges();
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
  downloadInvoice() {
    const data = document.getElementById('invoicePDF');

    if (!data) return;

    html2canvas(data).then((canvas) => {
      const imgWidth = 210;
      const pageHeight = 210;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      let position = 0;

      pdf.addImage(contentDataURL, 'HTML', 0, position, imgWidth, imgHeight);
      pdf.save('invoice.pdf');
    });
  }

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
    this.shopObj = this.invoices[index];
    this.dialog.nativeElement.open = true;
    this.showInvoiceCard = false;
  }

  deleteInvoice(index: number) {
    if (confirm('Delete this invoice?')) {
      this.invoices.splice(index, 1);

      localStorage.setItem('invoiceApplication', JSON.stringify(this.invoices));
    }
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
