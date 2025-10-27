# 🏗️ Arquitetura do Projeto - Meu Assistente Financeiro

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Princípios Aplicados](#princípios-aplicados)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Padrões de Código](#padrões-de-código)
- [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

Este projeto segue os princípios **SOLID**, **Clean Code** e **Design Patterns** para manter o código:
- ✅ **Testável** - Fácil de escrever testes
- ✅ **Manutenível** - Fácil de manter e evoluir
- ✅ **Escalável** - Preparado para crescer
- ✅ **Legível** - Código auto-explicativo

---

## 🧩 Princípios Aplicados

### SOLID

#### 1. **S**ingle Responsibility Principle (SRP)
Cada classe/função tem uma única responsabilidade:

```typescript
// ✅ BOM - Uma responsabilidade
export class TransactionService {
  async addTransaction(transaction: Transaction) { ... }
  async getTransactions() { ... }
}

// ❌ RUIM - Múltiplas responsabilidades
export class TransactionService {
  async addTransaction(transaction: Transaction) { ... }
  formatCurrency(amount: number) { ... }  // ❌ Não é responsabilidade do service
  validateEmail(email: string) { ... }    // ❌ Não é responsabilidade do service
}
```

#### 2. **O**pen/Closed Principle (OCP)
Aberto para extensão, fechado para modificação:

```typescript
// ✅ BOM - Usa interfaces para extensão
interface ITransactionService {
  addTransaction(transaction: Transaction): Promise<number>;
}

export class TransactionService implements ITransactionService { ... }
export class OfflineTransactionService implements ITransactionService { ... }
```

#### 3. **L**iskov Substitution Principle (LSP)
Subtipos devem ser substituíveis por seus tipos base.

#### 4. **I**nterface Segregation Principle (ISP)
Interfaces específicas são melhores que interfaces gerais:

```typescript
// ✅ BOM - Interfaces segregadas
interface ITransactionReader {
  getAll(): Promise<Transaction[]>;
}

interface ITransactionWriter {
  add(transaction: Transaction): Promise<number>;
}

// ❌ RUIM - Interface geral demais
interface ITransactionRepository {
  // Mistura leitura, escrita, validação, formatação, etc.
}
```

#### 5. **D**ependency Inversion Principle (DIP)
Dependa de abstrações, não de implementações:

```typescript
// ✅ BOM - Depende de interface
class TransactionService {
  constructor(private repository: ITransactionRepository) {}
}

// ❌ RUIM - Depende de implementação concreta
class TransactionService {
  constructor(private repository: IndexedDBRepository) {}
}
```

---

## 📁 Estrutura de Pastas

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globais
│
├── components/              # Componentes React
│   ├── CategorySection.tsx
│   ├── RecordingButton.tsx
│   ├── SummaryCards.tsx
│   ├── TransactionItem.tsx
│   └── *.module.css         # CSS Modules (isolados)
│
├── config/                  # Configurações
│   ├── index.ts            # Config geral
│   └── debug.ts            # Config de debug mode
│
├── constants/               # Constantes centralizadas
│   └── index.ts            # Enums, mensagens, validações
│
├── domain/                  # Entidades de domínio
│   └── index.ts            # Money, Transaction, Category entities
│
├── hooks/                   # Custom React Hooks
│   └── useApp.ts           # Hook principal da aplicação
│
├── interfaces/              # Interfaces TypeScript
│   └── index.ts            # Contratos de serviços/repositórios
│
├── lib/                     # Bibliotecas auxiliares
│   ├── audioService.ts     # Gravação de áudio (legado)
│   └── database.ts         # Configuração IndexedDB
│
├── repositories/            # Camada de persistência
│   └── index.ts            # Repository Pattern
│
├── services/                # Lógica de negócio
│   ├── index.ts            # Services (Transaction, Category, etc)
│   ├── audioService.ts     # Speech Recognition
│   └── permissionChecker.ts
│
├── types/                   # Tipos TypeScript
│   └── index.ts            # Types compartilhados
│
└── utils/                   # Utilitários
    ├── index.ts            # Barrel export
    ├── formatters.ts       # Formatação (moeda, data)
    └── logger.ts           # Sistema de logs
```

---

## 🎨 Padrões de Código

### 1. Organização de Imports

```typescript
// 1. Imports externos
import React, { useState, useEffect } from 'react';

// 2. Imports internos (ordenados por caminho)
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils';
import { TransactionService } from '@/services';

// 3. Imports de estilos
import styles from './Component.module.css';
```

### 2. Nomenclatura

```typescript
// Classes: PascalCase
export class TransactionService { }

// Interfaces: PascalCase com prefixo I
export interface ITransactionService { }

// Funções/Variáveis: camelCase
const getUserName = () => { };
const totalAmount = 100;

// Constantes: UPPER_SNAKE_CASE
const MAX_AMOUNT = 999999;
const API_TIMEOUT = 30000;

// Componentes React: PascalCase
export const TransactionItem: React.FC = () => { };

// CSS Modules: camelCase
<div className={styles.transactionItem} />
```

### 3. Comentários

```typescript
/**
 * Documentação JSDoc para funções públicas
 * @param amount - Valor a ser formatado
 * @returns String formatada no formato de moeda
 */
export const formatCurrency = (amount: number): string => {
  // Comentários inline para lógica complexa
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};
```

### 4. Tratamento de Erros

```typescript
// ✅ BOM - Específico e informativo
try {
  await transactionService.addTransaction(transaction);
} catch (error) {
  logger.error('Falha ao salvar transação', error);
  throw new TransactionError('Não foi possível salvar a transação');
}

// ❌ RUIM - Genérico e silencioso
try {
  await transactionService.addTransaction(transaction);
} catch (e) {
  console.log('erro');
}
```

---

## 🎯 Boas Práticas

### CSS Modules

**✅ SIM** - Use CSS Modules no Next.js:
- ✅ Escopo local automático
- ✅ Sem conflitos de nomes
- ✅ Tree-shaking automático
- ✅ TypeScript support

```typescript
// Component.tsx
import styles from './Component.module.css';

export const Component = () => {
  return <div className={styles.container} />;
};
```

### Utilities

**✅ Centralize funções utilitárias:**

```typescript
// ✅ BOM - Importar de @/utils
import { formatCurrency, formatDate } from '@/utils';

// ❌ RUIM - Importar de lugares aleatórios
import { formatCurrency } from '@/lib/audioService';
```

### Logging

**✅ Use o sistema de logs condicional:**

```typescript
// ✅ BOM - Logs aparecem apenas em dev ou debug mode
import { createLogger } from '@/utils';

const logger = createLogger('TransactionService');
logger.info('Transação salva');  // Apenas em dev/debug
logger.error('Erro crítico');    // Sempre aparece

// ❌ RUIM - console.log em produção
console.log('Transação salva'); // ❌ Polui logs em produção
```

### Constants

**✅ Centralize constantes:**

```typescript
// ✅ BOM
import { ERROR_MESSAGES, VALIDATION_RULES } from '@/constants';

if (amount > VALIDATION_RULES.MAX_AMOUNT) {
  throw new Error(ERROR_MESSAGES.INVALID_AMOUNT);
}

// ❌ RUIM - Magic numbers/strings
if (amount > 999999) {
  throw new Error('Valor inválido');
}
```

### Services

**✅ Use Dependency Injection:**

```typescript
// ✅ BOM - Testável e flexível
class TransactionService {
  constructor(
    private repository: ITransactionRepository = RepositoryFactory.get()
  ) {}
}

// ❌ RUIM - Acoplamento direto
class TransactionService {
  private repository = new TransactionRepository(); // ❌ Difícil de testar
}
```

---

## 🔧 Debug Mode

O projeto possui um modo de debug oculto para desenvolvimento:

### Ativar Debug Mode:
1. **Clique 7x rapidamente** no título "💰 Meu Assistente Financeiro"
2. **Atalho:** `Ctrl + Shift + D`

### O que o Debug Mode faz:
- ✅ Mostra logs detalhados na UI
- ✅ Persiste no localStorage
- ✅ Logs condicionais aparecem no console

### Configuração:
```typescript
// src/config/debug.ts
export const DEBUG_CONFIG = {
  CLICK_COUNT_TO_ACTIVATE: 7,
  CLICK_TIMEOUT: 1000,
  KEYBOARD_SHORTCUT: { ctrl: true, shift: true, key: 'D' }
};
```

---

## 📚 Referências

- [Clean Code by Robert C. Martin](https://www.amazon.com.br/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Next.js CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)

---

## 🤝 Contribuindo

Ao contribuir com este projeto, siga:
1. ✅ Princípios SOLID
2. ✅ Clean Code
3. ✅ Testes para novas funcionalidades
4. ✅ Documentação JSDoc
5. ✅ Commits semânticos

---

**Mantido por:** Christian Felipe Carvalho
**Última atualização:** Outubro 2025

