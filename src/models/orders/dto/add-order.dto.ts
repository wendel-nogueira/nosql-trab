import { IsString, IsNotEmpty } from "class-validator";

export class AddOrderDto {
  @IsString({
    message: "Cart id must be a string",
  })
  @IsNotEmpty({
    message: "Cart id is required",
  })
  cartId?: string;
}
