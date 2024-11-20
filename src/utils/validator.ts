import { validateOrReject } from "class-validator";
import { BadRequestException } from "./exceptions";
import { plainToInstance } from "class-transformer";

export async function ValidateDto<T>(
  object: unknown,
  objectType: new () => T
): Promise<T> {
  const instance = plainToInstance(objectType, object);

  await validateOrReject(instance as object).catch((errors) => {
    const allErrors = getErrors(errors);

    throw new BadRequestException("Fields invalid", allErrors);
  });

  return instance;
}

function getErrors(errors: any): any {
  const errorList: any = [];

  errors.map((error: { property: any; constraints: any; children: any }) => {
    if (error.constraints) {
      Object.values(error.constraints).map((constraint: any) => {
        errorList.push(constraint);
      });
    } else if (error.children) {
      const errors = getErrors(error.children);
      errorList.push(errors);
    }
  });

  const flatErrors = errorList.flat();

  return flatErrors;
}
