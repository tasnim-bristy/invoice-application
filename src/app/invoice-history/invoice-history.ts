import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Shop } from '../app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-history.html',
  styleUrl: './invoice-history.css',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InvoiceHistory implements OnInit {
  invoices: Shop[] = [];

  ngOnInit() {
    const data = localStorage.getItem('invoiceApplication');
    if (data) {
      this.invoices = JSON.parse(data);
    }
  }

  deleteInvoice(index: number) {
    if (confirm('Delete this invoice?')) {
      this.invoices.splice(index, 1);
      localStorage.setItem('invoiceApplication', JSON.stringify(this.invoices));
    }
  }

  constructor(private router: Router) {}
  viewInvoice(index: number) {
  const invoiceNo = this.invoices[index].invoiceNo;
  this.router.navigate(['/invoice/edit', invoiceNo]);
}
}