import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Menu.js";
import "@ui5/webcomponents/dist/Text.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Assets-fetch.js";
import "@ui5/webcomponents/dist/DatePicker.js";
import "@ui5/webcomponents-localization/dist/features/calendar/Gregorian.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
