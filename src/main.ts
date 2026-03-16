import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Menu.js";
import "@ui5/webcomponents/dist/Text.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Calendar.js";
import "@ui5/webcomponents/dist/DatePicker.js";
import "@ui5/webcomponents-localization/dist/features/calendar/Gregorian.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/MenuSeparator.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents-icons/dist/edit.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
import "@ui5/webcomponents-icons/dist/message-information.js";
import "@ui5/webcomponents-icons/dist/delete.js";
import "@ui5/webcomponents/dist/Dialog.js";
import "@ui5/webcomponents/dist/ComboBox.js";
import "@ui5/webcomponents/dist/ComboBoxItem.js";


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
