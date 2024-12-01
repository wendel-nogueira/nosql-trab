import { IsString, IsNotEmpty, IsNumber, Min, Max } from "class-validator";

export class AddProductDto {
  @IsString({
    message: "Product id must be a string",
  })
  @IsNotEmpty({
    message: "Product id is required",
  })
  productId?: string;

  title?: string;

  price?: number;

  image?: string;

  @IsNumber({}, { message: "Quantity must be a number" })
  @Min(1, { message: "Quantity must be at least 1" })
  @Max(100, { message: "Quantity must be at most 10" })
  @IsNotEmpty({
    message: "Quantity is required",
  })
  quantity?: number;
}
