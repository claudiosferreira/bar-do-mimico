# Bar do Mimico Delivery V3 — configuração com usuário administrativo

## O que está incluído
- Loja jovial e adaptada para celular.
- Cadastro e login de clientes com e-mail e senha.
- Perfil do cliente com WhatsApp, endereço e referência.
- Histórico de pedidos e opção de repetir pedido.
- Sacola, taxa de entrega e checkout.
- Pedido salvo no Supabase e mensagem preparada no WhatsApp.
- Painel administrativo em `admin.html`.
- Cadastro/edição de produtos, preços, descontos, fotos e disponibilidade.
- Controle de loja aberta/fechada e taxa de entrega.
- Pedidos em tempo real e alerta sonoro até confirmar.
- Instagram @Bardomimico e endereço do estabelecimento.

## 1. Criar o projeto Supabase
1. Acesse https://supabase.com/dashboard e crie uma conta ou entre.
2. Clique em **New project**.
3. Nome: `bar-do-mimico`.
4. Escolha uma senha forte para o banco e guarde-a.
5. Região: escolha a mais próxima disponível (por exemplo, South America).
6. Aguarde o projeto ficar pronto.

## 2. Criar as tabelas
1. No menu lateral, abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase_schema.sql`, copie todo o conteúdo e cole no editor.
4. Clique em **Run**. O script cria tabelas, regras de segurança, bucket de fotos e habilita Realtime para pedidos.

## 3. Copiar as chaves públicas
1. No Supabase, abra **Project Settings > API** (ou **Data API / API Keys**, conforme a interface).
2. Copie a **Project URL**.
3. Copie a chave **anon/public** (a chave pública, nunca a `service_role` ou `secret`).
4. Abra `config.js` e substitua:
   - `COLE_AQUI_A_URL_DO_SEU_PROJETO`
   - `COLE_AQUI_A_CHAVE_ANON_PUBLICA`
5. Confira o WhatsApp `98983280371`.
6. O nome de usuário inicial do painel está como `mimico`. Você pode trocar `ADMIN_USERNAME` por outro nome antes de publicar. O login administrativo usa o e-mail interno `admin@bardomimico.com.br`; não é o nome de usuário que o responsável digita.

## 4. Criar a conta administrativa
1. No Supabase, abra **Authentication > Users**.
2. Clique em **Add user** / **Create new user**.
3. Informe o e-mail `admin@bardomimico.com.br` e crie uma senha forte.
4. Se aparecer a opção de confirmar e-mail, marque o usuário como confirmado (ou desative temporariamente a confirmação de e-mail para testes).
5. Abra o **SQL Editor** e execute este comando:

```sql
update public.profiles
set role = 'admin', username = 'mimico'
where id = (
  select id from auth.users
  where email = 'admin@bardomimico.com.br'
);
```

Se você alterou `ADMIN_USERNAME` no `config.js`, use exatamente o mesmo nome no SQL, em letras minúsculas.

**Importante:** a tela do painel pede nome de usuário e senha. O Supabase Auth autentica por e-mail e senha por baixo dos panos; o projeto associa o nome de usuário configurado ao e-mail administrativo. A senha nunca fica gravada no código.

## 5. Testar antes de publicar
1. Abra `index.html` usando um servidor local (não apenas clicando duas vezes no arquivo, se o navegador bloquear recursos).
2. Cadastre um cliente de teste com e-mail e senha.
3. No painel, abra `admin.html` e entre com o usuário `mimico` e a senha criada para a conta administrativa.
4. Cadastre produtos e faça um pedido de teste.
5. Deixe o painel administrativo aberto e clique uma vez em **Ativar som** para liberar o áudio do navegador.

## 6. Publicar na Vercel
1. Envie a pasta do projeto para um repositório GitHub.
2. Na Vercel, importe esse repositório.
3. Como é um site estático, não precisa de comando de build; deixe Build Command vazio e Output Directory como `.`.
4. Depois do deploy, adicione o domínio `bardomimico.com.br` no projeto Vercel e configure os registros DNS solicitados no painel da GoDaddy.
5. Cadastre também `www.bardomimico.com.br` se quiser que a versão com www funcione.

## Observações importantes
- Nunca publique a chave `service_role` ou uma senha de administrador.
- O cliente precisa confirmar o e-mail se a confirmação estiver ativada no Supabase.
- O pedido é gravado antes de abrir o WhatsApp; o cliente ainda precisa tocar em enviar.
- O alerta sonoro depende do painel estar aberto e do navegador permitir áudio.
- A taxa de entrega nesta versão é fixa por pedido.
- Antes de operar comercialmente, publique uma política de privacidade e regras de uso adequadas, inclusive para venda de bebidas alcoólicas e verificação de idade.


## Atualização: editor visual da página inicial
1. No Supabase, abra SQL Editor e execute o arquivo `site_content_migration.sql`.
2. Publique todos os arquivos desta pasta no projeto Vercel conectado ao repositório GitHub (não envie apenas os arquivos antigos).
3. Entre em `/admin.html`, abra `Loja e entrega` e use a seção `Configurações da página inicial`.
4. Edite os textos, cores, imagens e informações e clique em `Salvar e publicar alterações`.

O cardápio agora também atualiza automaticamente quando produtos são inseridos/alterados e exibe mensagem de erro caso a consulta ao banco falhe.
