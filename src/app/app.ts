import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface UI5InputEvent extends Event {
  detail: { value: string };
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App {
   @ViewChild('invoiceDialog') dialog : ElementRef | undefined;
     showInvoiceCard = true;
     shopObj: Shop = new Shop();

   openInvoice(){
    const dialog = document.getElementById("invoiceDialog");
    if(dialog != null){
      dialog.style.display = 'block';
    }
    this.showInvoiceCard = false; 
   }


  closeDialog() {
    if(this.dialog != null){
      this.dialog.nativeElement.style.display = 'none';
    }
    this.showInvoiceCard = true;
  }

  // saveInvoice() {
  //   console.log('Saving invoice:', this.selectedInvoice);
  //   this.closeDialog();
  // }

}

export class Shop {
  invoiceNo: number;
  invoiceDate: Date;          
  customerId: number;
  customerName: string;
  address: string;
  taxCode: string;
  products: string;           
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;

  constructor() {
    this.invoiceNo = 0;
    this.invoiceDate = new Date();
    this.customerId = 0;
    this.customerName = '';
    this.address = '';
    this.taxCode = '';
    this.products = '';
    this.quantity = 0;
    this.unitPrice = 0;
    this.tax = 0;
    this.total = 0;
  }
}
