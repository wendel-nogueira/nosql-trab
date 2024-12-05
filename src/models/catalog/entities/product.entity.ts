import { Image } from "./image.entity";
import { Details } from "./details.entity";
import { ObjectId } from "mongodb";

export interface Product {
  _id: string | ObjectId;
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
  stock: number;
}
