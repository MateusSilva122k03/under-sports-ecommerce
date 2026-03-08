import fetch from 'node-fetch';
import crypto from 'crypto';

const FB_PIXEL_ID = '781406367686573';
const FB_ACCESS_TOKEN = 'EAAXQPCnz93UBQrr4qf9I4YALGkthtfG9QMSwZBAZC5Jqk8ZCEFHJTDLjFNuM2ZAuzQWtKTwv1FcffrOfnCel0eh2oSbB740ti7zsp4ezXz4obqsNI3AiW1F3CcuafzypZCtQhOR325xjEF2pUf3UekFAhv3q6gyLnTGqOcl544rylaSiDJ5KHWs6B2Yf2mAZDZD';

const hashData = (data: string) => {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export const sendCAPIEvent = async (
  eventName: string,
  eventSourceUrl: string,
  userData: {
    email?: string;
    phone?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
  },
  customData: {
    currency?: string;
    value?: number;
    content_ids?: string[];
  }
) => {
  try {
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: eventSourceUrl,
          user_data: {
            em: userData.email ? [hashData(userData.email)] : [],
            ph: userData.phone ? [hashData(userData.phone.replace(/\D/g, '55$1'))] : [], // Assuming Brazilian numbers
            client_ip_address: userData.clientIpAddress || '',
            client_user_agent: userData.clientUserAgent || '',
            fbp: userData.fbp || '',
            fbc: userData.fbc || '',
          },
          custom_data: customData,
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`📡 CAPI Event ${eventName} sent:`, result);
  } catch (error) {
    console.error(`❌ CAPI Error (${eventName}):`, error);
  }
};
