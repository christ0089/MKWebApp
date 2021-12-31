
import { Validators } from "@angular/forms";
import { CheckboxQuestion } from "src/app/Models/Forms/checkbox";
import { DatePickerQuestion } from "src/app/Models/Forms/datePicker";
import { DropdownQuestion } from "src/app/Models/Forms/dropdown";
import { GeolocationQuestion } from "src/app/Models/Forms/geolocation";
import { RadioQuestion } from "src/app/Models/Forms/radio";
import { TextboxQuestion } from "src/app/Models/Forms/textbox";
import { IQuestion } from "src/app/Models/question";


export const medic_questionaire = () => {
  let options: IQuestion[] = [
    {
      title: "Tu seguro estará listo en unos minutos listo para empezar?",
      subtitle: null,
      questions: [
        new TextboxQuestion({
          key: "name",
          label: "Primer Nombre",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
        }),
        new TextboxQuestion({
          key: "lname1",
          label: "Apellido Paterno",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
        }),
        new TextboxQuestion({
          key: "lname2",
          label: "Apellido Materno",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
        }),
        new DropdownQuestion({
          key: "sex",
          label: "Sexo",
          value: "",
          required: true,
          order: 0,
          options: [
            {
              key: true,
              value: "Hombre",
            },
            { key: false, value: "Mujer" },
          ],
          verfication: false,
        }),
      ],
    },
    {
      title: "De donde eres?",
      subtitle: null,
      questions: [
        new GeolocationQuestion({
          key: "street",
          label: "Calle",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
        }),
        new TextboxQuestion({
          key: "house_ext",
          label: "No. Ext",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
          validators: [Validators.minLength(1)],
        }),
        new TextboxQuestion({
          key: "house_int",
          label: "No Int (Opctional)",
          value: "",
          required: false,
          order: 0,
          options: [],
          verfication: false,
          validators: [Validators.minLength(1)],
        }),
        new TextboxQuestion({
          key: "zip",
          label: "Codigo Postal",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
          validators: [Validators.minLength(5), Validators.maxLength(5)],
        }),
      ],
    },
    {
      title: "Dinos un pocos mas de ti",
      subtitle: null,
      questions: [
        new TextboxQuestion({
          key: "size",
          label: "Altura",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
          icon : {
            name: 'metros',
            type: 'string'
          }
        }),
        new TextboxQuestion({
          key: "weight",
          label: "Peso",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
          icon : {
            name: 'kg',
            type: 'string'
          }
        }),
      ] 
    },
    {
      title: "En los ultimos diez años...?",
      subtitle: null,
      questions: [
        new CheckboxQuestion({
          key: "chronic_disease",
          label: "Enfermedaes cronicas como:  Arthritis, Hepatitis",
          value: false,
          order: 0,
          options: [],
          verfication: false,
        }),
        new CheckboxQuestion({
          key: "serious_disease",
          label: "Codiciones Gravez: Infartos, Problemas Intestinales",
          value: false,
          order: 0,
          options: [],
          verfication: false,
        }),
      ],
    },
    {
      title: "Consumes algunos de estos",
      subtitle: null,
      questions: [
        new CheckboxQuestion({
          key: "cigarrates",
          label: "Cigarros",
          value: false,
          order: 0,
          verfication: false,
        }),
        new CheckboxQuestion({
          key: "alcohol",
          label: "Alcohol",
          value: false,
          order: 0,
          verfication: false,
        }),
        new CheckboxQuestion({
          key: "druggs",
          label: "Drogas",
          value: false,
          order: 0,
          verfication: false,
        }),
      ],
    },
    {
      title:
        "Ya terminamos! Solo necesitamos estos datos para poder enviarte la cotizacion",
      subtitle: null,
      questions: [
        new TextboxQuestion({
          key: "email",
          label: "Correo Electronico",
          value: "",
          required: true,
          order: 0,
          options: [],
          verfication: false,
          validators: [Validators.email],
        }),
        new DatePickerQuestion({
          key: "dob",
          label: "Fecha de Nacimiento",
          value: new Date(
            new Date(Date.now()).getFullYear() - 18,
            new Date(Date.now()).getMonth(),
            new Date(Date.now()).getDay()
          ),
          required: true,
          order: 0,
          options: [
            {
              key: "max",
              value: new Date(
                new Date(Date.now()).getFullYear() - 18,
                new Date(Date.now()).getMonth(),
                new Date(Date.now()).getDay()
              ),
            },
            {
              key: "min",
              value: new Date(
                new Date(Date.now()).getFullYear() - 100,
                new Date(Date.now()).getMonth(),
                new Date(Date.now()).getDay()
              ),
            },
          ],
          verfication: false,
        }),
        new CheckboxQuestion({
          key: "accept_terms",
          label: "Acepto los terminos de servicio",
          value: false,
          required: true,
          order: 0,
          verfication: false,
        }),
      ],
    },
  ];
  return options;
};
