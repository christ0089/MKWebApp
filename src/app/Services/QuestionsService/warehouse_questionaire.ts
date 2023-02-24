
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
    key: null,
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

export const times_centers = (title: string): IQuestion => {
  return {
    title: title,
    subtitle: null,
    key: "time",
    questions: [
      new TextboxQuestion({
        key: "hours",
        label: "Hora",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "mins",
        label: "Minutos",
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

export const time_is_open = (): IQuestion => {
  return {
    title: "",
    questions: [
      new CheckboxQuestion({
        key: 'is_open',
        label: 'Abren este día?',
        value: '',
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
    ]
  }
}

export const delivery_fee = (): IQuestion => {
  return {
    title: "Fees de Servicio",
    subtitle: null,
    key: "fees",
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

export const warehouse_questionaire_time = () => {
  const questions = new Array(7).fill([
    times_centers('Apertura de Tienda'),
    times_centers('Cierre de Tienda'),
    time_is_open()
  ]);
  console.log(questions);
  return questions;
};


export const warehouse_questionaire = (): IQuestion[] => {
  const questions = [
    //warehouse_centers(),
    times_centers("Cierre de Venta de Alcohol"),
    // times_centers('Apertura de Tienda'),
    // times_centers('Cierre de Tienda'),
    delivery_fee()
  ]
  return questions;
}
