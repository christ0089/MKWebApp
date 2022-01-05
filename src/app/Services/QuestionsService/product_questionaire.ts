import { Firestore, GeoPoint } from "@firebase/firestore";
import { DatePickerQuestion } from "src/app/Models/Forms/datePicker";
import { DropdownQuestion } from "src/app/Models/Forms/dropdown";
import { RadioQuestion } from "src/app/Models/Forms/radio";
import { TextboxQuestion } from "src/app/Models/Forms/textbox";
import { UploadFileQuestion } from "src/app/Models/Forms/upload_file";
import { IQuestion } from "src/app/Models/question";



export const product_questionaire = () => {
  return {
    title: "Agregar Producto",
    subtitle: null,
    questions: [
      new UploadFileQuestion({
        key: "images",
        label: "Image",
        value: "",
        disabled: false,
        order: 0,
        options: [
          { key: "uploaded", value: false }
        ],
        required: true,
        verfication: false,
      }),
      new TextboxQuestion({
        key: "name",
        label: "Name",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "price",
        label: "Price",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "description",
        label: "Description",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: "active",
        label: "Activo",
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: "True",
          },
          {
            key: false,
            value: "False",
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "stripe_metadata_color",
        label: "Color",
        value: "",
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "stripe_metadata_type",
        label: "Tipo",
        value: "",
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "stripe_metadata_brand",
        label: "Brand",
        value: "",
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "stripe_metadata_discount",
        label: "Descuento",
        value: null,
        order: 0,
        options: [],
        icon: {
          name: "attach_money",
          type: "icon",
          position: "prefix"
        },
        verfication: false,
      }),
    ],
  }
}

export const brand_questionaire = () => {
  return {
    title: "Agregar Producto",
    subtitle: null,
    questions: [
      new UploadFileQuestion({
        key: "img",
        label: "Image",
        value: "",
        disabled: false,
        order: 0,
        options: [
          { key: "uploaded", value: false }
        ],
        required: true,
        verfication: false,
      }),
      new TextboxQuestion({
        key: "name",
        label: "Name",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: "buildActive",
        label: "Build Active",
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: "True",
          },
          {
            key: false,
            value: "False",
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "type",
        label: "Type",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "brand",
        label: "Brand",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "category",
        label: "Category",
        value: "",
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
    ],
  }
}

export interface ICoupon {
  expirationDate: any;
  active: boolean;
  code: string;
  requiered_products: boolean;
  requiered_product_quantity: number;
  requiered_min_purchase: boolean;
  min_purchase: number;
  key: string[];
  type: 'brands' | 'types' | 'products';
  discount_type: 'fixed' | 'percent';
  coupon_type: 'user' | 'store' | 'referral';
  discount: number;
  id: string;
}
export const coupon_questionaire = () => {
  return {
    title: "Agregar Producto",
    subtitle: null,
    questions: [
      new DropdownQuestion({
        key: "active",
        label: "Activo",
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: "True",
          },
          {
            key: false,
            value: "False",
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "code",
        label: "Code",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: "discount_type",
        label: "Tipo de Descuento",
        value: "fixed",
        required: true,
        order: 0,
        options: [
          {
            key: "fixed",
            value: "Fijo",
          },
          {
            key: "percent",
            value: "Porcentaje",
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "discount",
        label: "Discount",
        value: "",
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: "coupon_type",
        label: "Tipo de Coupon",
        value: "store",
        required: true,
        order: 0,
        options: [
          {
            key: "store",
            value: "Tienda",
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: "type",
        label: "Linea de Coupon",
        value: "brands",
        required: true,
        order: 0,
        options: [
          {
            key: "brands",
            value: "Marcas",
          },
          {
            key: "types",
            value: "Tipos",
          },
          {
            key: "products",
            value: "Productos",
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: "discount_type",
        label: "Tipo de Descuento",
        value: "fixed",
        required: true,
        order: 0,
        options: [
          {
            key: "fixed",
            value: "Fijo",
          },
          {
            key: "percent",
            value: "Porcentaje",
          },
        ],
        verfication: false,
      }),
      new DatePickerQuestion({
        key: "expirationDate",
        label: "Fecha de Expiracion",
        value: new Date(Date.now()),
        required: true,
      }),
      new DropdownQuestion({
        key: "requiered_products",
        label: "Requiere Numero de Productos Minimo",
        value: false,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: "True",
          },
          {
            key: false,
            value: "False",
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "requiered_product_quantity",
        label: "Numero de Productos Requeridos",
        value: 1,
        required: true,
      }),
      new DropdownQuestion({
        key: "requiered_min_purchase",
        label: "Requiere Compra Minima",
        value: "fixed",
        required: false,
        order: 0,
        options: [
          {
            key: true,
            value: "True",
          },
          {
            key: false,
            value: "False",
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: "min_purchase",
        label: "Monto de Compra Minima",
        value: "",
        required: true,
      }),
      new TextboxQuestion({
        key: "uses",
        label: "Numero de Usos",
        value: 100,
        required: true,
      })
    ]
  }
}

export interface Warehouse {
  name: string,
  cities: string[]
  alchohol_time: string[],
  warehouse_centers: GeoPoint[];
}

