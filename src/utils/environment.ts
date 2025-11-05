/**
 * Utilitários para identificar o ambiente da aplicação
 */

/**
 * Verifica se a aplicação está rodando em ambiente de desenvolvimento
 */
export function isDevEnvironment(): boolean {
  // Verificar variável de ambiente
  if (typeof window !== 'undefined') {
    // Client-side: verificar hostname ou variável de ambiente
    const hostname = window.location.hostname;
    
    // Verificar se é ambiente de desenvolvimento pelo hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.0.') || hostname.startsWith('172.')) {
      return true;
    }
    
    // Verificar variável de ambiente no cliente
    const env = process.env.NEXT_PUBLIC_ENV;
    if (env === 'development' || env === 'dev') {
      return true;
    }
    
    // Verificar NODE_ENV
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
  }
  
  // Server-side ou build-time: verificar variável de ambiente
  if (typeof process !== 'undefined') {
    const env = process.env.NEXT_PUBLIC_ENV;
    if (env === 'development' || env === 'dev') {
      return true;
    }
    
    // Verificar NODE_ENV
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
  }
  
  return false;
}

/**
 * Verifica se a aplicação está rodando em ambiente de homologação
 * Pode ser verificado através de:
 * - Variável de ambiente NEXT_PUBLIC_ENV
 * - Hostname da URL
 * - Branch atual (através de build-time)
 */
export function isHomologEnvironment(): boolean {
  // Não mostrar homologação se estiver em dev
  if (isDevEnvironment()) {
    return false;
  }
  
  // Verificar variável de ambiente
  if (typeof window !== 'undefined') {
    // Client-side: verificar hostname ou variável de ambiente
    const hostname = window.location.hostname;
    
    // Verificar se é ambiente de homologação pelo hostname
    if (hostname.includes('homolog') || hostname.includes('staging') || hostname.includes('hml')) {
      return true;
    }
    
    // Verificar variável de ambiente no cliente
    const env = process.env.NEXT_PUBLIC_ENV;
    if (env === 'homolog' || env === 'staging') {
      return true;
    }
  }
  
  // Server-side ou build-time: verificar variável de ambiente
  if (typeof process !== 'undefined') {
    const env = process.env.NEXT_PUBLIC_ENV;
    if (env === 'homolog' || env === 'staging') {
      return true;
    }
  }
  
  return false;
}

/**
 * Retorna o nome do ambiente atual
 */
export function getEnvironmentName(): string {
  if (isDevEnvironment()) {
    return 'DESENVOLVIMENTO';
  }
  if (isHomologEnvironment()) {
    return 'HOMOLOGAÇÃO';
  }
  return 'PRODUÇÃO';
}

/**
 * Retorna a cor do badge baseado no ambiente
 */
export function getEnvironmentColor(): string {
  if (isDevEnvironment()) {
    return '#ef4444'; // Vermelho para desenvolvimento
  }
  if (isHomologEnvironment()) {
    return '#f59e0b'; // Laranja/Amarelo para homologação
  }
  return '#22c55e'; // Verde para produção
}

/**
 * Verifica se deve mostrar o badge de ambiente
 */
export function shouldShowEnvironmentBadge(): boolean {
  return isDevEnvironment() || isHomologEnvironment();
}

