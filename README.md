# Bar do Mimico Delivery — versão 2

## O que mudou
- Loja com visual claro, mobile-first, inspirado em padrões de apps de delivery (sem copiar identidade do Zé Delivery).
- Endereço e referência fixos na página.
- Carrinho e checkout.
- Pedidos gravados no Supabase e enviados ao WhatsApp.
- Painel admin com atualização em tempo real e alerta sonoro repetido enquanto houver pedido com status `novo`; para ao confirmar.

## Configuração necessária para pedidos persistentes
1. Crie um projeto em https://supabase.com.
2. No SQL Editor, execute `supabase_schema.sql`.
3. Em Project Settings > API, copie Project URL e anon/public key.
4. Cole em `config.js` nos campos `SUPABASE_URL` e `SUPABASE_ANON_KEY`. Nunca use service_role no navegador.
5. Em Authentication > Users, crie o usuário e senha do responsável.
6. Abra `admin.html`, entre com esse usuário. Clique uma vez em "Ativar som de alerta" para permitir áudio no navegador.
7. Cadastre os produtos na tabela `products` (ou use Table Editor). O cardápio público lê os produtos ativos.
8. Publique todos os arquivos na Vercel na raiz do projeto.

## Limitações / notas
- O site salva o pedido no banco antes de abrir o WhatsApp. O cliente ainda precisa tocar em enviar no WhatsApp.
- O frete fica como "a confirmar pelo bar" nesta versão, pois não foi fornecido cálculo por bairro/raio. Defina a regra e atualize antes da operação.
- Para que o painel toque som continuamente, mantenha `admin.html` aberto em um dispositivo/aba com som permitido. Navegadores podem suspender áudio em segundo plano; o botão "Ativar som" exige interação inicial.
- Imagens iniciais de demonstração; substitua por fotos reais dos produtos.
- Ative confirmação de maioridade, políticas de privacidade e regras de entrega antes de operar.
