import { PipeTransform } from "@angular/core";
import { ValidatorFn } from "@angular/forms";


interface Icon {
  "name": string;
  "type": 'string' | 'icon';
  "position": 'prefix' | 'suffix';
};


export class QuestionBase<T> {
  value: T | number;
  key: string;
  label: string;
  required: boolean;
  order: number;
  validators: ValidatorFn[];
  controlType: string;
  type: string;
  disabled: boolean;
  options: { key: string | number; value: T | number }[] = [];
  verification: boolean;
  icon: Icon | null;

  constructor(
    options: {
      value?: T | number;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      type?: string;
      verfication?: boolean;
      disabled?: boolean;
      icon?: Icon;
      validators?: ValidatorFn[];
    } = {}
  ) {
    this.value = options.value || 0;
    this.key = options.key || "";
    this.label = options.label || "";
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || "";
    this.type = options.type || "";
    this.validators = options.validators || [];
    this.disabled = options.disabled || false;
    this.verification = options.verfication || false;
    this.icon = options.icon || null;
  }
}
