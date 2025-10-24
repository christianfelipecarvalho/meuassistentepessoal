# Configuração para Acesso Externo (Mobile)

## 🚀 Scripts Disponíveis:

### **📱 Para Desenvolvimento Mobile:**
```bash
npm run dev:mobile
```
- **Host:** 0.0.0.0 (acesso externo)
- **Porta:** 3000
- **URL:** http://SEU_IP:3000

### **🌐 Para Desenvolvimento Externo:**
```bash
npm run dev:external
```
- **Host:** 0.0.0.0 (acesso externo)
- **Porta:** Automática (geralmente 3000)

### **💻 Para Desenvolvimento Local:**
```bash
npm run dev
```
- **Host:** localhost (apenas local)
- **Porta:** Automática

## 📱 Como Acessar do Celular:

### **1. Descobrir seu IP:**
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

### **2. Executar com acesso externo:**
```bash
npm run dev:mobile
```

### **3. Acessar do celular:**
- **URL:** `http://SEU_IP:3000`
- **Exemplo:** `http://192.168.1.100:3000`

## 🔒 HTTPS para PWA (Opcional):

Para funcionalidades PWA completas (microfone, etc.), você pode usar HTTPS:

### **Instalar mkcert:**
```bash
# Ubuntu/Debian
sudo apt install mkcert

# macOS
brew install mkcert

# Windows
choco install mkcert
```

### **Gerar certificados:**
```bash
mkcert -install
mkcert localhost 192.168.1.100 SEU_IP
```

### **Configurar Next.js com HTTPS:**
```bash
npm install --save-dev https
```

## 🎯 Dicas Importantes:

### **📱 Para PWA Mobile:**
- Use HTTPS para funcionalidades completas
- Teste a gravação de áudio no celular
- Verifique se o microfone funciona
- Teste a instalação como PWA

### **🌐 Rede:**
- Certifique-se que o celular está na mesma rede WiFi
- Desative firewall temporariamente se necessário
- Use porta 3000 para evitar conflitos

### **🔧 Troubleshooting:**
- Se não conectar, verifique o IP
- Teste primeiro no navegador do PC
- Verifique se a porta não está bloqueada
- Use `netstat -an | grep 3000` para verificar se está ouvindo

## 🚀 Comandos Rápidos:

```bash
# Desenvolvimento mobile
npm run dev:mobile

# Verificar IP
hostname -I

# Verificar porta
netstat -tulpn | grep 3000
```

**🎯 Agora você pode testar o PWA diretamente no seu celular!**
