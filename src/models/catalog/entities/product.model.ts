import { Image } from "./image.model";
import { Details } from "./details.model";

export interface Product {
  id: string;
  main_category: string;
  title: string;
  average_rating: number;
  rating_number: number;
  features: string[];
  description: string[];
  price: number;
  images: Image[];
  videos: string[];
  store: string;
  categories: string[];
  details: Details;
  parent_asin: string;
  bought_together: any;
}
