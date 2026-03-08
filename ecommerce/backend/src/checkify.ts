import fetch from 'node-fetch';

export async function consultCpf(cpf: string) {
  const CHECKIFY_API_URL = 'https://api.checkify.space/api/v1/consultas/cpf';
  const API_KEY = process.env.CHECKIFY_API_KEY || 'ck_8addbb6bd353a7a0aa184cacf6668dde09fa4500b99ff4828d2affb923c91b16';

  // Limpa tudo o que não for número
  const cleanCpf = cpf.replace(/\D/g, '');

  try {
    const response = await fetch(`${CHECKIFY_API_URL}/${cleanCpf}`, {
      method: 'GET',
      headers: {
        'checkify-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data: any = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Erro ao consultar CPF na Checkify');
    }

    return data.resultado;
  } catch (error) {
    console.error('Checkify API Error:', error);
    throw error;
  }
}
