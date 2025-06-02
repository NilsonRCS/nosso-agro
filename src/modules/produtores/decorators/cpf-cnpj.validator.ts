import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { cpf, cnpj } from 'cpf-cnpj-validator';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true; // Permite valor nulo
          return cpf.isValid(value);
        },
        defaultMessage() {
          return 'CPF inválido';
        },
      },
    });
  };
}

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCNPJ',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true; // Permite valor nulo
          return cnpj.isValid(value);
        },
        defaultMessage() {
          return 'CNPJ inválido';
        },
      },
    });
  };
} 