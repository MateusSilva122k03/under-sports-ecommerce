# Implementation Plan: track-004 (Gamified Upsell)

## Objetivo
Criar um sistema de jogo da memória que desbloqueia descontos reais em produtos premium (Álbuns e Kits).

## Componentes a Criar
- `MemoryGameUpsell.tsx`: Lógica do jogo, estados de pares encontrados e exibição das ofertas.
- `ConfettiEffect`: Feedback visual de sucesso.

## Produtos Upsell
1. Álbum Prata (50% OFF)
2. Álbum Ouro (40% OFF)
3. Álbum Luxo (60% OFF)
4. Kit Torcedor (40% OFF)
5. Bola Adidas (50% OFF)

## Regras de Negócio
- O jogo é rápido (10 cartas).
- Cada par libera um botão de compra rápida.
- Ofertas válidas apenas durante a sessão atual.

## Verificação
- Testar mecânica de clique nas cartas.
- Validar se o desconto é aplicado corretamente ao adicionar no carrinho.
- Verificar responsividade em mobile.
