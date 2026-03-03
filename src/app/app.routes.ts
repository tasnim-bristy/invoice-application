import { Routes } from '@angular/router';
import { List } from './component/list/list';
import { Create } from './component/create/create';

export const routes: Routes = [
    {path:'invoice',component:List},
    {path:'invoice/create',component:Create},
    {path:'invoice/edit/:invoiceno', component:Create}
];
