/**
 * Test all third-party integrations
 */
export async function testIntegrations() {
  console.log('\n🧪 ========== TESTE DE INTEGRAÇÕES ==========\n');

  const results: Record<string, { status: boolean; message: string }> = {};

  // 1. UTMify
  try {
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
    const utmifyScript = scripts.some(src => src.includes('utmify'));
    const utmifyObject = !!(window as any).utmifyTracking || !!(window as any).UTMify;
    results['UTMify'] = {
      status: utmifyScript && utmifyObject,
      message: utmifyScript && utmifyObject ? 'Script carregado e ativo' : 'Script não carregado ou inativo'
    };
    console.log(`${results['UTMify'].status ? '✅' : '⚠️'} UTMify: ${results['UTMify'].message}`);
  } catch (e) {
    results['UTMify'] = { status: false, message: 'Erro ao testar' };
    console.log('❌ UTMify: Erro ao testar');
  }

  // 2. Facebook Pixel (CAPI)
  try {
    const fbq = !!(window as any).fbq;
    const pixelLoaded = fbq && typeof (window as any).fbq === 'function';
    results['Facebook Pixel (CAPI)'] = {
      status: pixelLoaded,
      message: pixelLoaded ? 'Pixel ID: ' + ((window as any).fbq?.id || 'Detectado') : 'Não inicializado'
    };
    console.log(`${results['Facebook Pixel (CAPI)'].status ? '✅' : '⚠️'} Facebook Pixel (CAPI): ${results['Facebook Pixel (CAPI)'].message}`);
  } catch (e) {
    results['Facebook Pixel (CAPI)'] = { status: false, message: 'Erro ao testar' };
    console.log('❌ Facebook Pixel (CAPI): Erro ao testar');
  }

  // 3. Microsoft Clarity
  try {
    const clarity = (window as any).clarity;
    const clarityLoaded = !!(window as any).clarity && typeof clarity === 'function';
    results['Microsoft Clarity'] = {
      status: clarityLoaded,
      message: clarityLoaded ? 'Sessão rastreada' : 'Não carregado'
    };
    console.log(`${results['Microsoft Clarity'].status ? '✅' : '⚠️'} Microsoft Clarity: ${results['Microsoft Clarity'].message}`);
  } catch (e) {
    results['Microsoft Clarity'] = { status: false, message: 'Erro ao testar' };
    console.log('❌ Microsoft Clarity: Erro ao testar');
  }

  // 4. SafeFyPay API
  try {
    const safepayTest = await fetch('/api/health', { method: 'GET' });
    const safepayOk = safepayTest.ok;
    results['SafeFyPay API'] = {
      status: safepayOk,
      message: safepayOk ? `Status ${safepayTest.status} - Online` : `Status ${safepayTest.status} - Offline`
    };
    console.log(`${results['SafeFyPay API'].status ? '✅' : '❌'} SafeFyPay API: ${results['SafeFyPay API'].message}`);
  } catch (e) {
    results['SafeFyPay API'] = { status: false, message: 'Erro de conexão' };
    console.log('❌ SafeFyPay API: Erro de conexão');
  }

  // 5. Checkify API
  try {
    const checkifyTest = await fetch('/api/consult-cpf/00000000000', { method: 'GET' });
    const checkifyOk = checkifyTest.status !== 404;
    results['Checkify API'] = {
      status: checkifyOk,
      message: checkifyOk ? `Status ${checkifyTest.status} - Online` : `Status ${checkifyTest.status} - Offline`
    };
    console.log(`${results['Checkify API'].status ? '✅' : '❌'} Checkify API: ${results['Checkify API'].message}`);
  } catch (e) {
    results['Checkify API'] = { status: false, message: 'Erro de conexão' };
    console.log('❌ Checkify API: Erro de conexão');
  }

  // 6. Google Analytics
  try {
    const ga = !!(window as any).gtag || !!(window as any).ga;
    results['Google Analytics'] = {
      status: ga,
      message: ga ? 'Carregado' : 'Não configurado'
    };
    console.log(`${results['Google Analytics'].status ? '✅' : '⚠️'} Google Analytics: ${results['Google Analytics'].message}`);
  } catch (e) {
    results['Google Analytics'] = { status: false, message: 'Erro ao testar' };
    console.log('❌ Google Analytics: Erro ao testar');
  }

  // Summary
  console.log('\n📊 RESUMO:');
  const passing = Object.values(results).filter(r => r.status).length;
  const total = Object.keys(results).length;
  console.log(`✅ ${passing}/${total} integrações funcionando`);
  console.log('\n==========================================\n');

  return results;
}
