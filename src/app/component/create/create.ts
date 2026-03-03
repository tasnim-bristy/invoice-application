import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create.html',
  styleUrls: ['./create.css'], 
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Create implements OnInit, OnDestroy {
  title = 'Invoice Application';
  invoiceform!: FormGroup;

  constructor(private builder: FormBuilder) {
    this.invoiceform = this.builder.group({
      invoiceno: [{ value: '', disabled: true }],
      invoicedate: [new Date(), Validators.required],
      customerid: ['', Validators.required],
      customername: [''],
      taxcode: [''],
      address: [''],
      total: [0],
      tax: [0],
      nettotal: [0],
      products: this.builder.array([]),
    });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}