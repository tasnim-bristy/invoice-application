import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  @ViewChild('invoiceDialog') dialog!: ElementRef;

  showInvoiceCard = true;
  shopObj: Shop = new Shop();

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

  saveInvoice() {
    const isLocalPresent = localStorage.getItem('invoiceApplication');
    if (isLocalPresent != null) {
      const oldArray = JSON.parse(isLocalPresent);
      oldArray.push(this.shopObj);
      localStorage.setItem('invoiceApplication', JSON.stringify(oldArray));
    } else {
      const newArr = [];
      newArr.push(this.shopObj);
      localStorage.setItem('invoiceApplication', JSON.stringify(newArr));
    }
  }

  updateField(field: keyof Shop, event: any) {
    const value = event.target.value;
    (this.shopObj as any)[field] = value;
  }

  updateItemField(index: number, field: keyof InvoiceItem, event: any) {
    let value: any;

    if (field === 'products') {
      value = event.detail.selectedOption?.text || '';
    } else {
      value = event.target.value;
    }

    const item = this.shopObj.items[index];
    (item as any)[field] = value;

    // calculate total
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
      const pageHeight = 295;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      let position = 0;

      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save('invoice.pdf');
    });
  }
}

export class Shop {
  invoiceNo: number;
  invoiceDate: Date;
  customerId: number;
  customerName: string;
  customerAddress: string;
  taxCode: string;
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
