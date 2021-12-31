export interface IPolicy {
  gastos_extraordinarios: string;
  remocion_escombros: string;
  cristales: string;
  contenidos: string;
  robo: string;
  elctrodomestico: string;
  edificio: string;
}

export enum POLICY_TYPE {
  BASIC,
  PLUS,
  MAX,
}
export enum POLICY_PAYMENT {
  MENSUAL,
  SEMESTRAL,
  ANUAL,
}

export interface iHouseQuote {
  zip?: string;
  colonia?: string;
  street?: string;
  estate?: string;
  house_ext?: string;
  house_int?: string;
  rfc?: string;
  name?: string;
  lname1?: string;
  lname2?: string;
  email?: string;
  sex?: boolean;
  phone?: string;
  //  status: Status;
  price?: string;
  floors?: string;
  dob?: string;
  type?: POLICY_TYPE;
  payment_type?: POLICY_PAYMENT;
  //  comission: string
}
