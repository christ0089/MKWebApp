
import { Validators } from "@angular/forms";
import { CheckboxQuestion } from "src/app/Models/Forms/checkbox";
import { DatePickerQuestion } from "src/app/Models/Forms/datePicker";
import { DropdownQuestion } from "src/app/Models/Forms/dropdown";
import { GeolocationQuestion } from "src/app/Models/Forms/geolocation";
import { RadioQuestion } from "src/app/Models/Forms/radio";
import { TextboxQuestion } from "src/app/Models/Forms/textbox";
import { IQuestion } from "src/app/Models/question";

export const warehouse_centers = (): IQuestion => {
  return {
    title: "Centro de Distribución",
    subtitle: null,
    questions: [
      new TextboxQuestion({
        key: "name",
        label: "Nombre",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
    ]
  }
}

export const delivery_fee = ():IQuestion => {
  return {
    title: "Fees de Servicio",
    subtitle: null,
    questions: [
      new TextboxQuestion({
        key: "min_payment",
        label: "Monto Minimo para Cobro",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "max_fee",
        label: "Tarifa Maxima",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "min_fee",
        label: "Tarfia Minima",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
    ]
  }
}


export const warehouse_questionaire = (): IQuestion[] => {
  const questions = [
    warehouse_centers(),
    delivery_fee()
  ]
  return questions;
}