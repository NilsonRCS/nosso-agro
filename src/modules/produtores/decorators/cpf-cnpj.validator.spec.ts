import { validate } from 'class-validator';
import { IsCPF, IsCNPJ } from './cpf-cnpj.validator';

class TestDto {
  @IsCPF()
  cpf?: string | null;

  @IsCNPJ()
  cnpj?: string | null;
}

describe('CPF/CNPJ Validators', () => {
  let dto: TestDto;

  beforeEach(() => {
    dto = new TestDto();
  });

  describe('IsCPF', () => {
    it('should pass with valid CPF', async () => {
      dto.cpf = '529.982.247-25';
      const errors = await validate(dto);
      const cpfErrors = errors.filter((error) => error.property === 'cpf');
      expect(cpfErrors).toHaveLength(0);
    });

    it('should fail with invalid CPF', async () => {
      dto.cpf = '111.111.111-11';
      const errors = await validate(dto);
      const cpfErrors = errors.filter((error) => error.property === 'cpf');
      expect(cpfErrors).toHaveLength(1);
      expect(cpfErrors[0].constraints).toHaveProperty('isCPF', 'CPF inválido');
    });

    it('should pass with null CPF', async () => {
      dto.cpf = null;
      const errors = await validate(dto);
      const cpfErrors = errors.filter((error) => error.property === 'cpf');
      expect(cpfErrors).toHaveLength(0);
    });
  });

  describe('IsCNPJ', () => {
    it('should pass with valid CNPJ', async () => {
      dto.cnpj = '11.444.777/0001-61';
      const errors = await validate(dto);
      const cnpjErrors = errors.filter((error) => error.property === 'cnpj');
      expect(cnpjErrors).toHaveLength(0);
    });

    it('should fail with invalid CNPJ', async () => {
      dto.cnpj = '11.111.111/1111-11';
      const errors = await validate(dto);
      const cnpjErrors = errors.filter((error) => error.property === 'cnpj');
      expect(cnpjErrors).toHaveLength(1);
      expect(cnpjErrors[0].constraints).toHaveProperty(
        'isCNPJ',
        'CNPJ inválido',
      );
    });

    it('should pass with null CNPJ', async () => {
      dto.cnpj = null;
      const errors = await validate(dto);
      const cnpjErrors = errors.filter((error) => error.property === 'cnpj');
      expect(cnpjErrors).toHaveLength(0);
    });
  });
}); 