import { Item } from "./item.entity";

export interface Order {
  id?: number | string;
  userId: number;
  date: Date;
  value: number;
  items: Item[];
}
