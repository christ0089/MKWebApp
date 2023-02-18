import { Firestore, GeoPoint, Timestamp } from '@firebase/firestore';
import { CheckboxQuestion } from 'src/app/Models/Forms/checkbox';
import { DatePickerQuestion } from 'src/app/Models/Forms/datePicker';
import { DropdownQuestion } from 'src/app/Models/Forms/dropdown';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { RadioQuestion } from 'src/app/Models/Forms/radio';
import { TextboxQuestion } from 'src/app/Models/Forms/textbox';
import { UploadFileQuestion } from 'src/app/Models/Forms/upload_file';
import { IProducts } from 'src/app/Pages/info-view/products/products.component';
import { UserRoles } from '../Auth/auth.service';
import { times_centers, time_is_open } from './warehouse_questionaire';

export interface IAds {
  id: string;
  title: string;
  expirationDate?: any;
  subtitle?: string;
  img?: string;
  ranking: number;
  content_url: string;
  description?: string;
  products: IProducts[];
  warehouse_id?: string;
  type?: 'redirect' | 'coupon' | 'location' | 'video' | 'img';
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

export type NotificationIssueStatus =
  | 'testing'
  | 'tested'
  | 'approved'
  | 'delivered'
  | 'failed';

export interface INotification {
  id?: string;
  title: string;
  message: string;
  type: 'user' | 'region' | 'general';
  createdAt: Timestamp;
  issuer: string;
  approver?: string;
  issue_status: NotificationIssueStatus;
  warehouse_id: string;
  status: 'delivered' | 'pending' | 'processing';
}

export interface IQuestions {
  title: string;
  subtitle: string | null;
  questions: QuestionBase<any>[];
  action: string;
}

export interface Warehouse {
  name: string;
  cities: string[];
  alchohol_time: string[];
  warehouse_centers: GeoPoint[];
}

export interface IReservation {
  id: string,
  reservation: IBookingRange[],
  customer_id: string,
  product_owner_id: string;
  status: "pending" | "accepted" | "blocked";
  product: IBookingProduct;
  address: any;
  coords: GeoPoint;
  month: number;
  day: number;
  year: number;
}

export interface IBookingRange {
  start_hour: number;
  start_min: number;
  end_hour: number;
  end_min: number;
  selected: boolean;
  disabled: boolean;
  reservation_idx? : number;
}

export interface IBookingProduct extends IProducts {
  reservation?: IBookingRange[];
  day: number;
  month: number;
  year: number;
  schedule: ISchedule;
}
export interface ISchedule {
  dateRange: number[];
  hourRange: {
    end: number;
    start: number;
  };
  interval: '15min' | '30min' | '1hr';
}

export const booking_questionaire = () => {
  return {
    title: 'Agregar Producto',
    subtitle: null,
    questions: [
      new TextboxQuestion({
        key: 'start',
        label: 'Hora de Inicio',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'end',
        label: 'Hora de Fin',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new RadioQuestion({
        key: 'interval',
        label: 'Intevalo de Eventos',
        value: "",
        required: true,
        order: 0,
        options: [
          {
            key:  '15 minutos',
            value: '15min',
          },
          {
            key: '30 minutos',
            value:'30min' ,
          },
          {
            key: "Cada hora",
            value: '1hr',
          },
        ],
        verfication: false,
      }),
    ],
  };
};

export const available_days = () => {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado'
  ];

  const questions_form = days.map((day, i) => {
    return new CheckboxQuestion({
      key: `${i}`,
      label: day,
      value: false,
      disabled: false,
      order: 0,
      options: [],
      verfication: false,
    });
  });
  return {
    title: 'Dias Disponibles',
    subtitle: null,
    questions: [
      ...questions_form
    ],
  };
};


export const product_questionaire = (role: UserRoles) => {
  let questions:QuestionBase<any>[] = []
  if (role == "service_admin") {
    questions = [
      new UploadFileQuestion({
        key: 'images',
        label: 'Image',
        value: '',
        disabled: false,
        order: 0,
        options: [{ key: 'uploaded', value: false }],
        required: true,
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'name',
        label: 'Name',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'price',
        label: 'Price',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'description',
        label: 'Description',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'active',
        label: 'Disponible',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'Disponible',
          },
          {
            key: false,
            value: 'Agotado',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'stripe_metadata_productType',
        label: 'Tipo de Compra',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: 'unique',
            value: 'Compra Unica',
          },
          {
            key: 'calendar',
            value: 'Calendarizar',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'availability',
        label: 'Existencias',
        value: 100,
        required: true,
        order: 0,
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'stripe_model_3d',
        label: 'Modelo 3D',
        value: null,
        order: 0,
        options: [],
        icon: {
          name: '3d_rotation',
          type: 'icon',
          position: 'prefix',
        },
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'stripe_metadata_color',
        label: 'Color',
        value: '',
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),  
      new TextboxQuestion({
        key: 'stripe_metadata_discount',
        label: 'Descuento',
        value: null,
        order: 0,
        options: [],
        icon: {
          name: 'attach_money',
          type: 'icon',
          position: 'prefix',
        },
        verfication: false,
      })
    ]
  } else { 
    questions = [
      new UploadFileQuestion({
        key: 'images',
        label: 'Image',
        value: '',
        disabled: false,
        order: 0,
        options: [{ key: 'uploaded', value: false }],
        required: true,
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'name',
        label: 'Name',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'price',
        label: 'Price',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'description',
        label: 'Description',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'active',
        label: 'Disponible',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'Disponible',
          },
          {
            key: false,
            value: 'Agotado',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'stripe_metadata_productType',
        label: 'Tipo de Compra',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: 'unique',
            value: 'Compra Unica',
          },
          {
            key: 'calendar',
            value: 'Calendarizar',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'availability',
        label: 'Existencias',
        value: 100,
        required: false,
        order: 0,
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'stripe_metadata_model',
        label: 'Modelo 3D',
        value: null,
        order: 0,
        options: [],
        icon: {
          name: '3d_rotation',
          type: 'icon',
          position: 'prefix',
        },
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'stripe_metadata_color',
        label: 'Color',
        value: '',
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'stripe_metadata_discount',
        label: 'Descuento',
        value: null,
        order: 0,
        options: [],
        icon: {
          name: 'attach_money',
          type: 'icon',
          position: 'prefix',
        },
        verfication: false,
      }),
    new TextboxQuestion({
      key: 'stripe_metadata_type',
      label: 'Tipo',
      value: '',
      required: true,
      order: 0,
      options: [],
      verfication: false,
    }),
    new TextboxQuestion({
      key: 'stripe_metadata_brand',
      label: 'Brand',
      value: '',
      required: true,
      order: 0,
      options: [],
      verfication: false,
    })]
  }
  
  return {
    title: 'Agregar Producto',
    subtitle: null,
    questions: questions,
  };
};

export const ads_questionaire = () => {
  let data: IQuestions = {
    title: 'Agregar Producto',
    subtitle: '',
    questions: [],
    action: '',
  };

  return {
    title: 'Agregar Anuncio',
    subtitle: null,
    questions: [
      new UploadFileQuestion({
        key: 'content_url',
        label: 'Contenido',
        value: '',
        disabled: false,
        order: 0,
        options: [{ key: 'uploaded', value: false }],
        required: true,
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'title',
        label: 'Titulo',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'subtitle',
        label: 'Subtitulo',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'buildActive',
        label: 'Build Active',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'visible',
        label: 'Visible',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new DatePickerQuestion({
        key: 'expirationDate',
        label: 'Fecha de Expiracion',
        value: new Date(Date.now()),
        required: true,
      }),
      new DropdownQuestion({
        key: 'type',
        label: 'Tipo de Archivo',
        value: 'redirect',
        required: true,
        order: 0,
        options: [
          {
            key: 'video',
            value: 'Video',
          },
          {
            key: 'img',
            value: 'Imagen',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'ad_type',
        label: 'Tipo de Lista',
        value: 'tags',
        required: true,
        order: 0,
        options: [
          {
            key: 'tags',
            value: 'Anuncio',
          },
          {
            key: 'secondary_tags',
            value: 'Anuncio Secundario',
          },
          {
            key: 'list_tags',
            value: 'Lista',
          },
        ],
        verfication: false,
      }),
    ],
  };
};

export const brand_questionaire = (user_role: UserRoles) => {
  let data: IQuestions = {
    title: 'Agregar Producto',
    subtitle: '',
    questions: [],
    action: '',
  };
  if (user_role === 'zone_admin') {
    data.questions = [
      new TextboxQuestion({
        key: 'name',
        label: 'Name',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),

      new DropdownQuestion({
        key: 'visible',
        label: 'Visible',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'productType',
        label: 'Tipo de Compra',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: 'unique',
            value: 'Compra Unica',
          },
          {
            key: 'calendar',
            value: 'Calendarizar',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'type',
        label: 'Type',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'brand',
        label: 'Brand',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'category',
        label: 'Category',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
    ];
  } else {
    data.questions = [
      new UploadFileQuestion({
        key: 'img',
        label: 'Imagen Fila',
        value: '',
        disabled: false,
        order: 0,
        options: [{ key: 'uploaded', value: false }],
        required: true,
        verfication: false,
      }),
      new UploadFileQuestion({
        key: 'img_circle',
        label: 'Imagen Circulo',
        value: '',
        disabled: false,
        order: 0,
        options: [{ key: 'uploaded', value: false }],
        required: true,
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'name',
        label: 'Name',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'buildActive',
        label: 'Build Active',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'visible',
        label: 'Visible',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'productType',
        label: 'Tipo de Compra',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: 'unique',
            value: 'Compra Unica',
          },
          {
            key: 'calendar',
            value: 'Calendarizar',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'type',
        label: 'Type',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'brand',
        label: 'Brand',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'category',
        label: 'Category',
        value: '',
        disabled: false,
        order: 0,
        options: [],
        verfication: false,
      }),
    ];
  }

  return data;
};

export const coupon_questionaire = () => {
  return {
    title: 'Agregar Producto',
    subtitle: null,
    questions: [
      new DropdownQuestion({
        key: 'active',
        label: 'Activo',
        value: true,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'code',
        label: 'Code',
        value: '',
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'discount_type',
        label: 'Tipo de Descuento',
        value: 'fixed',
        required: true,
        order: 0,
        options: [
          {
            key: 'fixed',
            value: 'Fijo',
          },
          {
            key: 'percent',
            value: 'Porcentaje',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'discount',
        label: 'Discount',
        value: '',
        disabled: false,
        required: true,
        order: 0,
        options: [],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'coupon_type',
        label: 'Tipo de Coupon',
        value: 'store',
        required: true,
        order: 0,
        options: [
          {
            key: 'store',
            value: 'Tienda',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'type',
        label: 'Linea de Coupon',
        value: 'brands',
        required: true,
        order: 0,
        options: [
          {
            key: 'brands',
            value: 'Marcas',
          },
          {
            key: 'types',
            value: 'Tipos',
          },
          {
            key: 'products',
            value: 'Productos',
          },
        ],
        verfication: false,
      }),
      new DropdownQuestion({
        key: 'discount_type',
        label: 'Tipo de Descuento',
        value: 'fixed',
        required: true,
        order: 0,
        options: [
          {
            key: 'fixed',
            value: 'Fijo',
          },
          {
            key: 'percent',
            value: 'Porcentaje',
          },
        ],
        verfication: false,
      }),
      new DatePickerQuestion({
        key: 'expirationDate',
        label: 'Fecha de Expiracion',
        value: new Date(Date.now()),
        required: true,
      }),
      new DropdownQuestion({
        key: 'requiered_products',
        label: 'Requiere Numero de Productos Minimo',
        value: false,
        required: true,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'requiered_product_quantity',
        label: 'Numero de Productos Requeridos',
        value: 1,
        required: true,
      }),
      new DropdownQuestion({
        key: 'requiered_min_purchase',
        label: 'Requiere Compra Minima',
        value: 'fixed',
        required: false,
        order: 0,
        options: [
          {
            key: true,
            value: 'True',
          },
          {
            key: false,
            value: 'False',
          },
        ],
        verfication: false,
      }),
      new TextboxQuestion({
        key: 'min_purchase',
        label: 'Monto de Compra Minima',
        value: '',
        required: true,
      }),
      new TextboxQuestion({
        key: 'uses',
        label: 'Numero de Usos',
        value: 100,
        required: true,
      }),
    ],
  };
};

export const notification_question = () => {
  return {
    title: 'Crear Notificación',
    subtitle: null,
    action: 'notification.create',
    questions: [
      new TextboxQuestion({
        key: 'title',
        label: 'Titulo',
        value: '',
        required: true,
      }),
      new TextboxQuestion({
        key: 'message',
        label: 'Mensaje',
        value: '',
        required: true,
      }),
    ],
  };
};

// export const user_repesentative = (user_role: UserRoles) => {
//   let data: IQuestions = {
//     title: 'Agregar Representativo',
//     subtitle: '',
//     questions: [],
//     action: '',
//   };
//   return {
//     title: 'Crear Representativo',
//     subtitle: '',
//     questions: [

//       new TextboxQuestion({
//         key: 'message',
//         label: 'Mensaje',
//         value: '',
//         required: true,
//       }),
//     ],
//   };
// }
