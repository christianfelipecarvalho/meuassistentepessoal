# 🔧 Configuração de Ambientes (Desenvolvimento, Homologação e Produção)

Este documento explica como configurar e identificar os diferentes ambientes da aplicação.

## 📋 Como Funciona

O sistema detecta automaticamente o ambiente através de:

1. **Variável de Ambiente** `NEXT_PUBLIC_ENV` ou `NODE_ENV`
2. **Hostname da URL** (verifica localhost, IPs locais, ou palavras-chave como "homolog", "staging")

## 🎯 Ambientes Suportados

### 🛠️ Desenvolvimento (DEV)
- **Cor do Badge:** Vermelho (#ef4444)
- **Ícone:** ⚙️
- **Texto:** "DESENVOLVIMENTO"
- **Detecção automática:** 
  - `localhost`, `127.0.0.1`
  - IPs locais (192.168.x.x, 10.0.x.x, 172.x.x.x)
  - `NODE_ENV === 'development'`
  - `NEXT_PUBLIC_ENV === 'development'` ou `'dev'`

### 🧪 Homologação (HOMOLOG)
- **Cor do Badge:** Laranja (#f59e0b)
- **Ícone:** ⚠️
- **Texto:** "HOMOLOGAÇÃO"
- **Detecção automática:**
  - Hostname contém "homolog", "staging" ou "hml"
  - `NEXT_PUBLIC_ENV === 'homolog'` ou `'staging'`

### 🚀 Produção (PROD)
- **Badge:** Não aparece
- **Ambiente padrão quando não é dev ou homolog**

## 🚀 Configuração

### 🛠️ Desenvolvimento (Automático)

O ambiente de desenvolvimento é detectado automaticamente quando:

- Rodando em `localhost` ou `127.0.0.1`
- Acessando via IP local (192.168.x.x, 10.0.x.x, 172.x.x.x)
- `NODE_ENV === 'development'` (padrão do Next.js em dev)

**Não é necessário configurar nada!** O badge vermelho aparecerá automaticamente.

### 🧪 Homologação

#### Opção 1: Variável de Ambiente (Recomendado)

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_ENV=homolog
```

Ou configure no seu ambiente de deploy/hosting:

```bash
NEXT_PUBLIC_ENV=homolog
```

#### Opção 2: Hostname

Se o hostname da URL contiver "homolog", "staging" ou "hml", o sistema detectará automaticamente.

Exemplos:
- `https://homolog.meuapp.com`
- `https://staging.meuapp.com`
- `https://app-hml.example.com`

## 🎨 Indicador Visual

Badges de ambiente aparecem no topo da aplicação:

### 🛠️ Desenvolvimento
```
⚙️ DESENVOLVIMENTO
```
- **Cor:** Vermelho (#ef4444)
- **Aparece automaticamente** em `localhost` ou IPs locais

### 🧪 Homologação
```
⚠️ HOMOLOGAÇÃO
```
- **Cor:** Laranja (#f59e0b)
- **Aparece quando** configurado via variável de ambiente ou hostname

### Características dos Badges:
- ✅ São fixos no topo da tela
- ✅ Têm animação de entrada
- ✅ São responsivos para mobile
- ✅ **Não aparecem em produção**

## 🔍 Verificação

O sistema verifica o ambiente através das funções em `src/utils/environment.ts`.

### Uso no Código

```typescript
import { 
  isDevEnvironment, 
  isHomologEnvironment, 
  getEnvironmentName,
  shouldShowEnvironmentBadge 
} from '@/utils/environment';

// Verificar ambiente específico
if (isDevEnvironment()) {
  console.log('Rodando em desenvolvimento');
}

if (isHomologEnvironment()) {
  console.log('Rodando em homologação');
}

// Obter nome do ambiente
console.log(`Ambiente: ${getEnvironmentName()}`);

// Verificar se deve mostrar badge
if (shouldShowEnvironmentBadge()) {
  console.log('Badge de ambiente será exibido');
}
```

## ✅ Checklist de Ambientes

### 🛠️ Desenvolvimento
- [x] Badge "DESENVOLVIMENTO" aparece automaticamente em localhost
- [x] Detecção automática por hostname/IP
- [ ] Testes locais executados
- [ ] Validação de funcionalidades

### 🧪 Homologação
- [ ] Variável `NEXT_PUBLIC_ENV=homolog` configurada
- [ ] Badge "HOMOLOGAÇÃO" aparece no topo
- [ ] Testes funcionais executados
- [ ] Validação de regras de negócio
- [ ] Testes de integração com APIs
- [ ] Validação de performance
- [ ] Testes em diferentes navegadores
- [ ] Testes em dispositivos móveis

### 🚀 Produção
- [ ] Badge **NÃO aparece** (confirmar)
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Testes finais executados
- [ ] Monitoramento ativo

## 🚨 Importante

- ⚠️ Os badges **NÃO aparecem em produção**
- ⚠️ Em produção, todas as funções de ambiente retornam `false`
- ⚠️ Sempre verifique se o badge está visível antes de testar
- ⚠️ **Desenvolvimento tem prioridade:** Se detectado como dev, o badge de homologação não aparece

## 📝 Notas

- O badge é renderizado apenas no cliente (client-side)
- A detecção funciona tanto em build-time quanto em runtime
- O sistema é seguro: em produção, o badge nunca aparecerá

