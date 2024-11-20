import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ArrayNotEmpty,
  IsIn,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class FiltersDto {
  @IsArray({
    message: "Categories must be an array of strings",
  })
  @IsString({
    message: "Each category must be a string",
    each: true,
  })
  @IsOptional()
  categories?: string[];

  @IsArray({
    message: "Brands must be an array of strings",
  })
  @IsString({
    message: "Each brand must be a string",
    each: true,
  })
  @IsOptional()
  brands?: string[];

  @IsArray({
    message: "Price must be an array of numbers",
  })
  @IsNumber({}, { each: true, message: "Each price must be a number" })
  @Min(0, { each: true, message: "Each price must be greater than 0" })
  @Max(1000000, { each: true, message: "Each price must be less than 1000000" })
  @ArrayNotEmpty({
    message: "Price must not be empty",
  })
  @IsOptional()
  price?: [number, number];

  @IsArray({ message: "Rating must be an array of numbers" })
  @IsNumber({}, { each: true, message: "Each rating must be a number" })
  @Min(0, { each: true, message: "Each rating must be greater than 0" })
  @Max(5, { each: true, message: "Each rating must be less than 5" })
  @ArrayNotEmpty({
    message: "Rating must not be empty",
  })
  @IsOptional()
  rating?: [number, number];
}

export class GetProductsDto {
  @ValidateNested()
  @Type(() => FiltersDto)
  @IsOptional()
  filters?: FiltersDto;

  @IsNumber({}, { message: "Limit must be a number" })
  @Min(1, { message: "Limit must be greater than 0" })
  limit?: number;

  @IsNumber(
    {},
    {
      message: "Offset must be a number",
    }
  )
  @Min(0, {
    message: "Offset must be greater than or equal to 0",
  })
  offset?: number;

  @IsString({
    message: "Sort must be a string",
  })
  @IsIn(["default", "price-asc", "price-desc", "rating-asc", "rating-desc"], {
    message:
      "Sort must be one of default, price-asc, price-desc, rating-asc, rating-desc",
  })
  sort?: string;
}
