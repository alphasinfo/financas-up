/**
 * Helper de Validação
 * 
 * Funções de validação para:
 * - CPF/CNPJ
 * - Email
 * - Telefone
 * - CEP
 * - Dados financeiros
 * - Campos obrigatórios
 */

export interface ValidationOptions {
  allowNegative?: boolean;
  minDate?: Date;
  maxDate?: Date;
  min?: number;
  max?: number;
  exact?: number;
  integer?: boolean;
}

/**
 * Validar CPF
 */
export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

/**
 * Validar CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned.charAt(13))) return false;
  
  return true;
}

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validar telefone
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (telefone fixo ou celular)
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Validar CEP
 */
export function validateCEP(cep: string): boolean {
  if (!cep) return false;
  
  // Remove caracteres não numéricos
  const cleaned = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  return cleaned.length === 8;
}

/**
 * Validar valor monetário
 */
export function validateCurrency(
  value: any,
  options: ValidationOptions = {}
): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  let numValue: number;
  
  if (typeof value === 'string') {
    // Remove caracteres de formatação
    const cleaned = value.replace(/[^\d,.-]/g, '');
    numValue = parseFloat(cleaned.replace(',', '.'));
  } else if (typeof value === 'number') {
    numValue = value;
  } else {
    return false;
  }
  
  if (isNaN(numValue)) return false;
  
  // Verificar se permite valores negativos
  if (!options.allowNegative && numValue < 0) return false;
  
  return true;
}

/**
 * Validar data
 */
export function validateDate(
  date: any,
  options: ValidationOptions = {}
): boolean {
  if (!date) return false;
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return false;
  }
  
  // Verificar se é uma data válida
  if (isNaN(dateObj.getTime())) return false;
  
  // Verificar data mínima
  if (options.minDate && dateObj < options.minDate) return false;
  
  // Verificar data máxima
  if (options.maxDate && dateObj > options.maxDate) return false;
  
  return true;
}

/**
 * Validar campo obrigatório
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length > 0;
  }
  
  return true;
}

/**
 * Validar comprimento
 */
export function validateLength(
  value: string,
  options: ValidationOptions = {}
): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const length = value.length;
  
  // Comprimento exato
  if (options.exact !== undefined) {
    return length === options.exact;
  }
  
  // Comprimento mínimo
  if (options.min !== undefined && length < options.min) {
    return false;
  }
  
  // Comprimento máximo
  if (options.max !== undefined && length > options.max) {
    return false;
  }
  
  return true;
}

/**
 * Validar número
 */
export function validateNumeric(
  value: any,
  options: ValidationOptions = {}
): boolean {
  if (value === null || value === undefined || value === '') return false;
  
  let numValue: number;
  
  if (typeof value === 'string') {
    numValue = parseFloat(value);
  } else if (typeof value === 'number') {
    numValue = value;
  } else {
    return false;
  }
  
  if (isNaN(numValue)) return false;
  
  // Verificar se deve ser inteiro
  if (options.integer && !Number.isInteger(numValue)) return false;
  
  // Verificar valor mínimo
  if (options.min !== undefined && numValue < options.min) return false;
  
  // Verificar valor máximo
  if (options.max !== undefined && numValue > options.max) return false;
  
  return true;
}

/**
 * Validar URL
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar senha forte
 */
export function validateStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      isValid: false,
      errors: ['Senha é obrigatória'],
      strength: 'weak',
    };
  }
  
  // Comprimento mínimo
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  } else {
    score += 1;
  }
  
  // Letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  } else {
    score += 1;
  }
  
  // Letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }
  
  // Número
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  } else {
    score += 1;
  }
  
  // Caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  } else {
    score += 1;
  }
  
  // Determinar força
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 3) {
    strength = 'weak';
  } else if (score < 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validar múltiplos campos
 */
export function validateFields(
  data: Record<string, any>,
  rules: Record<string, {
    required?: boolean;
    type?: 'email' | 'phone' | 'cpf' | 'cnpj' | 'cep' | 'currency' | 'date' | 'url';
    min?: number;
    max?: number;
    custom?: (value: any) => boolean | string;
  }>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
} {
  const errors: Record<string, string[]> = {};
  
  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    const fieldErrors: string[] = [];
    
    // Verificar se é obrigatório
    if (rule.required && !validateRequired(value)) {
      fieldErrors.push(`${field} é obrigatório`);
      errors[field] = fieldErrors;
      return;
    }
    
    // Se não é obrigatório e está vazio, pular validações
    if (!rule.required && !validateRequired(value)) {
      return;
    }
    
    // Validações por tipo
    switch (rule.type) {
      case 'email':
        if (!validateEmail(value)) {
          fieldErrors.push(`${field} deve ser um email válido`);
        }
        break;
      case 'phone':
        if (!validatePhone(value)) {
          fieldErrors.push(`${field} deve ser um telefone válido`);
        }
        break;
      case 'cpf':
        if (!validateCPF(value)) {
          fieldErrors.push(`${field} deve ser um CPF válido`);
        }
        break;
      case 'cnpj':
        if (!validateCNPJ(value)) {
          fieldErrors.push(`${field} deve ser um CNPJ válido`);
        }
        break;
      case 'cep':
        if (!validateCEP(value)) {
          fieldErrors.push(`${field} deve ser um CEP válido`);
        }
        break;
      case 'currency':
        if (!validateCurrency(value)) {
          fieldErrors.push(`${field} deve ser um valor monetário válido`);
        }
        break;
      case 'date':
        if (!validateDate(value)) {
          fieldErrors.push(`${field} deve ser uma data válida`);
        }
        break;
      case 'url':
        if (!validateURL(value)) {
          fieldErrors.push(`${field} deve ser uma URL válida`);
        }
        break;
    }
    
    // Validação customizada
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        fieldErrors.push(customResult);
      } else if (!customResult) {
        fieldErrors.push(`${field} é inválido`);
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
/**
 * Função de validação de request usando Zod (compatível com testes)
 */
export function validateRequest<T>(
  schema: any,
  data: any
): { success: true; data: T } | { success: false; error: any; response?: any } {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error, response: result.error };
    }
  } catch (error) {
    return { success: false, error, response: error };
  }
}

/**
 * Schemas comuns para validação (compatível com testes)
 */
export const commonSchemas = {
  email: {
    safeParse: (value: string) => ({
      success: validateEmail(value)
    })
  },
  senha: {
    safeParse: (value: string) => {
      // Validação mais simples para senha forte
      if (!value || value.length < 8) return { success: false };
      if (!/[a-z]/.test(value)) return { success: false };
      if (!/[A-Z]/.test(value)) return { success: false };
      if (!/\d/.test(value)) return { success: false };
      return { success: true };
    }
  },
  nome: {
    safeParse: (value: string) => ({
      success: validateLength(value, { min: 3, max: 100 })
    })
  },
  valor: {
    safeParse: (value: number) => {
      // Validação mais rigorosa para valores
      if (typeof value !== 'number') return { success: false };
      if (isNaN(value) || !isFinite(value)) return { success: false };
      if (value < 0) return { success: false };
      return { success: true };
    }
  },
  tipo: {
    safeParse: (value: string) => ({
      success: ['RECEITA', 'DESPESA', 'TRANSFERENCIA'].includes(value)
    })
  }
};

/**
 * Função para sanitizar input (compatível com testes)
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}