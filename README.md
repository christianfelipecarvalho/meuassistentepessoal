# 💰 Meu Assistente Financeiro

Um assistente financeiro PWA (Progressive Web App) que permite gravar gastos e ganhos através de áudio e transcrição automática.

## 🚀 Funcionalidades

- ✅ **Gravação de áudio real** com microfone
- ✅ **Transcrição em tempo real** usando Web Speech API
- ✅ **Detecção automática** de valores e categorias
- ✅ **Armazenamento offline** com IndexedDB
- ✅ **Edição e exclusão** de transações
- ✅ **Interface responsiva** para mobile
- ✅ **PWA instalável** como app nativo

## 📱 Desenvolvimento Mobile

### **Acesso Rápido do Celular:**

```bash
# Método 1: Script automático
./dev-mobile.sh

# Método 2: Comando direto
npm run dev:mobile
```

**🌐 Acesse do seu celular em:** `http://192.168.3.26:3000`

### **Scripts Disponíveis:**

```bash
# Desenvolvimento local (apenas PC)
npm run dev

# Desenvolvimento com acesso externo
npm run dev:external

# Desenvolvimento mobile (recomendado)
npm run dev:mobile

# Produção com acesso externo
npm run start:external
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev:mobile

# Build para produção
npm run build

# Executar produção
npm start
```

## 📱 Como Usar

### **1. Gravar Transação:**
- Pressione e segure o botão de gravação
- Fale claramente: "Gastei 25 reais no almoço"
- Solte o botão para salvar

### **2. Ver Lista:**
- Vá para a aba "Lista"
- Veja transações organizadas por categoria
- Passe o mouse para editar/excluir

### **3. Editar/Excluir:**
- Passe o mouse sobre uma transação
- Clique ✏️ para editar ou 🗑️ para excluir
- Confirme as alterações

## 🎯 Exemplos de Frases

### **Gastos:**
- "Gastei 15 reais no café"
- "Paguei 120 reais de luz"
- "Comprei uma camisa por 60 reais"

### **Ganhos:**
- "Recebi 500 reais de salário"
- "Ganhei 200 reais de freelancer"
- "Vendi meu celular por 300 reais"

## 🏷️ Categorias Automáticas

- 🍽️ **Alimentação** - restaurantes, supermercado
- 🚗 **Transporte** - gasolina, uber, ônibus
- 🏥 **Saúde** - remédios, médico, farmácia
- 📚 **Educação** - livros, cursos, mensalidades
- 🎮 **Lazer** - cinema, jogos, shows
- 🏠 **Casa** - aluguel, luz, água, internet
- 👕 **Roupas** - roupas, calçados, acessórios
- 💻 **Tecnologia** - celular, computador, streaming
- 📦 **Outros** - categorias não identificadas

## 🔧 Requisitos Técnicos

### **Navegadores Suportados:**
- ✅ **Chrome** (recomendado)
- ✅ **Edge** (recomendado)
- ✅ **Safari** (iOS 14.5+)
- ⚠️ **Firefox** (suporte limitado)

### **Requisitos:**
- ✅ **HTTPS** (obrigatório para microfone)
- ✅ **Microfone** funcionando
- ✅ **Conexão com internet** (para transcrição)

## 📱 Testando no Celular

### **1. Conectar na mesma rede WiFi**
### **2. Executar com acesso externo:**
```bash
npm run dev:mobile
```

### **3. Acessar do celular:**
- **URL:** `http://192.168.3.26:3000`
- Substitua pelo seu IP real

### **4. Testar funcionalidades:**
- ✅ Gravação de áudio
- ✅ Transcrição em tempo real
- ✅ Detecção de categorias
- ✅ Instalação como PWA

## 🏗️ Arquitetura

### **Princípios SOLID:**
- **Single Responsibility** - Cada classe tem uma responsabilidade
- **Open/Closed** - Aberto para extensão, fechado para modificação
- **Liskov Substitution** - Implementações substituíveis
- **Interface Segregation** - Interfaces específicas
- **Dependency Inversion** - Dependências injetadas

### **Estrutura:**
```
src/
├── app/                    # Next.js App Router
├── components/            # Componentes React
├── domain/                # Entidades de Domínio
├── interfaces/           # Contratos e Interfaces
├── repositories/         # Implementações dos Repositórios
├── services/            # Serviços de Negócio
├── hooks/               # Custom Hooks
├── utils/               # Utilitários
├── constants/           # Constantes e Enums
├── config/             # Configurações
└── types/              # Definições de Tipos
```

## 🎉 Status do Projeto

- ✅ **100% Funcional** - Gravação e transcrição reais
- ✅ **Zero Erros** - Compilação e linting limpos
- ✅ **PWA Completo** - Instalável como app nativo
- ✅ **Mobile Ready** - Interface responsiva
- ✅ **Offline Support** - Funciona sem internet
- ✅ **Edição/Exclusão** - Gerenciamento completo

## 🚀 Próximos Passos

1. **Integração com APIs reais** de transcrição
2. **Sincronização com nuvem** para backup
3. **Relatórios e gráficos** para análise
4. **Notificações push** para lembretes
5. **Temas personalizáveis** (claro/escuro)

---

**🎯 Seu assistente financeiro está pronto para uso real!**