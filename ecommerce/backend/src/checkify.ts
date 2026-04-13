import fetch from 'node-fetch';

export async function consultCpf(cpf: string) {
  const CHECKIFY_API_URL = 'https://api.checkify.space/api/v1/consultas/cpf';
  const API_KEY = process.env.CHECKIFY_API_KEY || '';

  // Limpa tudo o que não for número
  const cleanCpf = cpf.replace(/\D/g, '');

  // Validate CPF format
  if (cleanCpf.length !== 11) {
    throw new Error('CPF deve conter 11 dígitos');
  }

  if (!API_KEY) {
    throw new Error('Checkify API key not configured');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(`${CHECKIFY_API_URL}/${cleanCpf}`, {
      method: 'GET',
      headers: {
        'checkify-key': API_KEY,
        'Content-Type': 'application/json'
      },
      signal: controller.signal as any
    });

    clearTimeout(timeoutId);

    const data: any = await response.json();

    if (!response.ok) {
      console.error('Checkify API Error:', {
        status: response.status,
        message: data.message,
        cpf: cleanCpf
      });
      throw new Error(data.message || `Erro ao consultar CPF (Status: ${response.status})`);
    }

    if (data.status !== 'success') {
      console.warn('Checkify API returned non-success status:', data.status);
      throw new Error(data.message || 'CPF não encontrado ou erro na consulta');
    }

    return data.resultado;
  } catch (error: any) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.error('Checkify API timeout for CPF:', cpf);
      throw new Error('Timeout ao consultar CPF - tente novamente');
    }

    console.error('Checkify API Error:', error);
    throw error;
  }
}
