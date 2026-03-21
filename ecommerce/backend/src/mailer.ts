import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Instantiate Resend - using provided key for reliability in this environment
const resend = new Resend('re_w63VRPYM_B7zEQQMYYTX5bjKF2RLu4wwd');

export const sendPixEmail = async (data: {
  email: string;
  name: string;
  orderId: string;
  amount: string;
  pixCode: string;
}) => {
  try {
    const templatePath = path.join(__dirname, '../templates/email_pix.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    htmlContent = htmlContent
      .replace(/{{nome_do_cliente}}/g, data.name)
      .replace(/{{numero_do_pedido}}/g, data.orderId)
      .replace(/{{valor_total}}/g, data.amount)
      .replace(/{{codigo_pix_copia_e_cola}}/g, data.pixCode)
      .replace(/{{cpf_mascarado}}/g, '***.***.***-**')
      .replace(/{{telefone_cliente}}/g, 'Não informado')
      .replace(/{{rua_numero_complemento}}/g, 'Endereço registrado')
      .replace(/{{bairro}}/g, '-')
      .replace(/{{cidade}}/g, '-')
      .replace(/{{estado}}/g, '-')
      .replace(/{{cep}}/g, '-')
      .replace(/{{resumo_itens_carrinho}}/g, 'Camisas Under Sports')
      .replace(/{{link_pagamento_pix}}/g, '#');

    await resend.emails.send({
      from: 'Under Sports <contato@undersports.shop>', // Needs a verified domain on Resend
      to: [data.email],
      subject: `Under Sports - Pague seu PIX para garantir seu pedido #${data.orderId}`,
      html: htmlContent,
    });
    console.log(`✉️ PIX email sent to ${data.email}`);
  } catch (error) {
    console.error('Error sending PIX email:', error);
  }
};

export const sendPaymentApprovedEmail = async (data: {
  email: string;
  name: string;
  orderId: string;
  amount: string;
}) => {
  try {
    const templatePath = path.join(__dirname, '../templates/email_pago.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    htmlContent = htmlContent
      .replace(/{{nome_do_cliente}}/g, data.name)
      .replace(/{{numero_do_pedido}}/g, data.orderId)
      .replace(/{{valor_total}}/g, data.amount)
      .replace(/{{cpf_mascarado}}/g, '***.***.***-**')
      .replace(/{{telefone_cliente}}/g, 'Não informado')
      .replace(/{{rua_numero_complemento}}/g, 'Endereço registrado')
      .replace(/{{bairro}}/g, '-')
      .replace(/{{cidade}}/g, '-')
      .replace(/{{estado}}/g, '-')
      .replace(/{{cep}}/g, '-')
      .replace(/{{resumo_itens_carrinho}}/g, 'Camisas Under Sports');

    await resend.emails.send({
      from: 'Under Sports <contato@undersports.shop>', // Needs a verified domain on Resend
      to: [data.email],
      subject: `✅ Pagamento Confirmado! Pedido #${data.orderId} - Under Sports`,
      html: htmlContent,
    });
    console.log(`✉️ Payment approved email sent to ${data.email}`);
  } catch (error) {
    console.error('Error sending payment approved email:', error);
  }
};
