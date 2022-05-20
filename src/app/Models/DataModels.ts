export interface IBrands {
  brand: string;
  buildActive: boolean;
  visible: boolean;
  category: string;
  ranking: number;
  img: string;
  img_circle: string;
  name: string;
  type: string;
  warehouse: string;
  id?: string;
}

export interface ICategory {
  [key: string]: IBrands[];
}


export interface IRecommendedList {
  id: string,
  name: string,
  description: string,
}