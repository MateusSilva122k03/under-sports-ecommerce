# Tech Stack: Under Sports

## Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS v4
- **Animações**: Framer Motion (via `motion`)
- **Ícones**: Lucide React
- **Roteamento**: React Router DOM v7

## Backend
- **Runtime**: Node.js (>=20.0.0)
- **Framework**: Express
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (`pg`)
- **Pagamentos**: SafefyPay SDK, MercadoPago
- **E-mail**: Resend
- **Ferramentas**: `tsx` para desenvolvimento, `tsc` para build.

## Infraestrutura & Deploy
- **Containerização**: Docker, Docker Compose
- **Orquestração/PaaS**: Dokploy
- **CI/CD**: Dokploy Pipelines (`ecommerce-pipeline.yaml`)
- **Servidor Web**: Nginx (para o frontend e proxy reverso)
