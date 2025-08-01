# Relatório de Fluxo de Dados e Arquitetura do Sistema

Este documento descreve a arquitetura de dados e o fluxo de informações do sistema de gestão da clínica. Após a refatoração, o modelo foi otimizado para ser mais limpo, seguro e escalável, utilizando o Supabase como a fonte única da verdade.

## 1. Filosofia da Arquitetura e Segurança de Dados

O sistema é construído sobre um princípio fundamental: **centralização, especialização e segurança em camadas**.

- **`auth.users` (Supabase Auth):** É a base de tudo. Controla exclusivamente a **autenticação** (login, senha, e-mail de acesso). Nenhuma informação pessoal, exceto o e-mail, é armazenada aqui.
- **`public.profiles`:** É o coração do sistema. Representa cada **indivíduo** no sistema, seja ele um administrador, médico ou paciente. Esta tabela estende `auth.users` com dados de perfil e de sistema (função/`role`, status).
- **Tabelas Especializadas (`patients`, `professionals`):** Representam **papéis específicos** que um indivíduo pode ter. Elas contêm informações exclusivas daquele papel e se vinculam à tabela `profiles`.

### Como Garantimos a Segurança dos Dados Sensíveis?

Este manual descreve a *estrutura* do sistema, mas não concede acesso a nenhum dado. A segurança é garantida por três pilares:

1.  **Autenticação Obrigatória:** Ninguém acessa o sistema sem um login e senha válidos.
2.  **Controle de Acesso Baseado em Função (RBAC):** O `role` de um usuário (`admin`, `doctor`, `patient`) define quais partes da interface ele pode ver e usar. Um paciente nunca verá os botões de administração.
3.  **Segurança a Nível de Linha (RLS):** Esta é a nossa garantia mais forte. **Todas as tabelas com dados sensíveis têm RLS ativada.** Isso significa que, mesmo que um usuário tente acessar os dados diretamente, o banco de dados só retornará as linhas que pertencem a ele. Um usuário só pode ver seus próprios dados, e um administrador só pode ver tudo porque sua função (`role`) permite. É impossível um usuário acessar dados de outro.

---

## 2. Manual de Instalação e Execução (Marco Zero)

Este guia fornece um passo a passo completo para configurar e executar o projeto a partir do zero.

### 2.1. Pré-requisitos

Antes de começar, garanta que você tenha o seguinte software instalado em sua máquina:
- **Node.js**: Versão 18.x ou superior.
- **npm**: Geralmente vem instalado com o Node.js.

### 2.2. Configuração do Ambiente

**Passo 1: Obtenha os Arquivos do Projeto**
- Para obter uma cópia local de todo o projeto, incluindo este `README.md`, clique no menu **"Hostinger Horizons"** no canto superior esquerdo e selecione **"Exportar Projeto"**.

**Passo 2: Instale as Dependências**
- Após exportar e descompactar o projeto, abra um terminal na pasta raiz e execute o comando:
  ```bash
  npm install
  ```

**Passo 3: Configure as Variáveis de Ambiente**
- Crie um arquivo chamado `.env` na raiz do projeto.
- Você precisará das suas credenciais do Supabase. Crie um projeto em [supabase.com](https://supabase.com).
- No seu projeto Supabase, vá para `Project Settings > API`.
- Copie os seguintes valores e adicione-os ao seu arquivo `.env`:

  ```
  VITE_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
  VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
  ```

### 2.3. Configuração do Banco de Dados Supabase

Para que a aplicação funcione, o banco de dados precisa ter as tabelas, funções e políticas de segurança corretas.

**Passo 1: Execute os Scripts SQL**
- No seu painel do Supabase, navegue até o `SQL Editor`.
- Copie e cole o conteúdo dos seguintes arquivos SQL (que estarão no seu projeto exportado na pasta `database/`) e execute-os **na ordem especificada**:
  1.  `database/01_types.sql`
  2.  `database/02_core_tables.sql`
  3.  `database/03_appointment_tables.sql`
  4.  `database/04_communication_tables.sql`
  5.  `database/05_permission_and_availability_tables.sql`
  6.  `database/06_resource_management_tables.sql`
  7.  `database/07_document_and_settings_tables.sql`
  8.  `database/functions.sql`
  9.  `database/policies.sql`
  10. `database/triggers.sql`

  *Nota: Execute cada arquivo um por um. Isso ajuda a identificar qualquer erro durante a configuração inicial.*

### 2.4. Primeira Execução e Testes

Com o ambiente e o banco de dados configurados, você está pronto para iniciar a aplicação.

**Passo 1: Inicie a Aplicação**
- No terminal, na raiz do projeto, execute:
  ```bash
  npm run dev
  ```
- A aplicação estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

**Passo 2: Roteiro de Testes Essenciais**
Siga o roteiro abaixo para garantir que tudo está funcionando como esperado.

1.  **Configuração Inicial (Primeiro Acesso):**
    *   **Cenário:** Acesse a aplicação pela primeira vez.
    *   **Resultado Esperado:** Você deve ser redirecionado para a página `/setup`.
    *   **Ação:** Preencha o formulário para criar a conta de **Administrador Principal**.
    *   **Verificação:** Após o sucesso, você será redirecionado para a tela de login.

2.  **Login e Acesso do Administrador:**
    *   **Ação:** Faça login com as credenciais de administrador recém-criadas.
    *   **Resultado Esperado:** Acesso bem-sucedido ao **Dashboard do Administrador** (`/admin/dashboard`).

3.  **Criação de Novos Funcionários (como Admin):**
    *   **Ação:** Navegue para "Usuários" (`/admin/users`) e crie um novo usuário com o cargo de "Médico".
    *   **Verificação:** O usuário deve aparecer na lista e um e-mail de convite deve ser enviado.

4.  **Fluxo do Novo Funcionário (Médico):**
    *   **Ação:** Use o link do convite para definir uma senha e faça login.
    *   **Verificação:** O login deve ser bem-sucedido, e o usuário deve ser direcionado para o dashboard da clínica (`/dashboard`), sem acesso às áreas de admin.

5.  **Cadastro Público de Paciente:**
    *   **Ação:** Deslogue e use a rota de cadastro público (`/cadastro-paciente`).
    *   **Verificação (como Admin):** Faça login como admin e verifique se o novo paciente aparece como "Pendente" na gestão de usuários. Aprove o cadastro.
    *   **Verificação (como Paciente):** Faça login com as credenciais do paciente; o acesso deve ser concedido.

---

## 3. Segurança dos Dados: Código vs. Dados Vivos

É crucial entender a diferença entre o que você "baixa" e o que está "vivo" no seu banco de dados.

- **O que você baixa (Exportar Projeto):** Você está baixando o **código-fonte da aplicação** e os **scripts de criação do banco de dados**. Isso inclui:
    - O código React (HTML, CSS, JavaScript).
    - O `README.md` (este manual).
    - A pasta `database/` com os arquivos `.sql` (`01_types.sql`, etc.).
    - **NENHUM DADO SENSÍVEL DE PACIENTES OU USUÁRIOS ESTÁ INCLUÍDO NESTE DOWNLOAD.**

- **Onde estão os dados sensíveis?**
    - Os dados sensíveis (informações de pacientes, agendamentos, etc.) residem exclusivamente no seu **projeto Supabase na nuvem**.
    - Este projeto Supabase é protegido por:
        1.  **Autenticação.**
        2.  **Segurança a Nível de Linha (RLS).**
        3.  **Credenciais de API** que você configura no seu arquivo `.env`.

**Conclusão:** O download do projeto é uma ferramenta para você ter o controle total sobre o código e a estrutura do seu sistema. Ele não compromete a segurança dos dados que estão armazenados de forma protegida no seu Supabase.