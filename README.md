
# 🏥 Clínica Prontuários

Sistema completo de gestão de clínica médica desenvolvido com **React + Supabase**.

## 🚀 **Características:**
- ✅ **React 18** + Vite
- ✅ **Supabase** (Backend + Database)
- ✅ **Tailwind CSS** (Styling)
- ✅ **Radix UI** (Components)
- ✅ **Multi-role system** (Admin, Doctor, Secretary)
- ✅ **Row-Level Security** (RLS)

## 👥 **Perfis de Usuário:**
- **👨‍💼 Administrador:** Gestão completa do sistema
- **👨‍⚕️ Médico:** Consultas, prontuários, avaliações
- **👩‍💼 Secretária:** Agendamentos, pacientes, comunicação

## 🧩 **Módulos:**
- 📅 **Agendamentos** - Sistema completo de consultas
- 👥 **Gestão de Pacientes** - Cadastro e acompanhamento
- 📋 **Prontuários** - Histórico médico completo
- 💰 **Orçamentos** - Gestão financeira
- 🏥 **Cirurgias** - Agendamento e acompanhamento
- 📊 **Dashboards** - Analytics personalizados
- 💬 **Comunicação** - Mensagens internas
- ⚙️ **Configurações** - Sistema flexível

## 🛠️ **Tecnologias:**
- **Frontend:** React, Vite, Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Charts:** Chart.js, React-ChartJS-2
- **Calendar:** FullCalendar, React-Big-Calendar
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 🚀 **Como executar:**

### **Pré-requisitos:**
- Node.js 16+
- Projeto Supabase configurado

### **Instalação:**
```bash
# Clone o repositório
git clone https://github.com/SEU_USERNAME/clinica-prontuarios.git
cd clinica-prontuarios

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Execute o projeto
npm run dev
```

### **Build para produção:**
```bash
npm run build
npm run preview
```

## 🗄️ **Configuração do Banco:**
Execute os scripts SQL na ordem (pasta `database/`):
1. `01_types.sql` - `10. triggers.sql`

Ver `DEPLOY_GUIDE.md` para instruções detalhadas.

## 🔐 **Segurança:**
- ✅ Autenticação via Supabase Auth
- ✅ Autorização baseada em roles (RBAC)  
- ✅ Row-Level Security (RLS) no banco
- ✅ Políticas de acesso granulares

## 📦 **Deploy:**
Pronto para deploy em: **Vercel**, **Netlify**, **Railway**

## 🎯 **Status:** ✅ **Pronto para produção**

---

## 1. Visão Geral e Filosofia da Arquitetura

O sistema foi projetado com uma arquitetura moderna e segura, utilizando o Supabase como backend e o React para uma interface de usuário dinâmica e reativa.

### 1.1. Princípios Fundamentais

*   **Fonte Única da Verdade:** O banco de dados Supabase é o coração do sistema. Todas as informações são centralizadas nele, garantindo consistência e evitando duplicação de dados.
*   **Segurança em Camadas:** A segurança é uma prioridade e é implementada em três níveis:
    1.  **Autenticação (Auth):** Gerenciada pelo Supabase Auth, garante que apenas usuários validados acessem o sistema.
    2.  **Autorização (RBAC - Role-Based Access Control):** A interface se adapta à função (`role`) do usuário (`admin`, `doctor`, `receptionist`), mostrando apenas os menus e funcionalidades permitidas.
    3.  **Políticas de Acesso a Dados (RLS - Row-Level Security):** A camada mais forte de segurança. O banco de dados filtra os dados na fonte, garantindo que um usuário SÓ POSSA ver ou modificar as informações que lhe pertencem, mesmo que tente acessar os dados diretamente.
*   **Escalabilidade:** A separação clara entre frontend, backend e funções de negócio permite que o sistema cresça de forma organizada, facilitando a adição de novos módulos ou portais no futuro.

### 1.2. Estrutura de Dados Principal

*   `auth.users`: Tabela nativa do Supabase que controla apenas o acesso (e-mail e senha).
*   `public.profiles`: Tabela central que estende `auth.users`. Contém o perfil de CADA indivíduo no sistema (nome, cargo, status, etc.) e define sua `role`.
*   Tabelas Especializadas (`patients`, `professionals`, `appointments`): Contêm dados específicos de cada entidade e se relacionam com `profiles`.

---

## 2. Funcionalidades Implementadas (v1.0)

A versão atual do sistema inclui os seguintes módulos principais:

*   **Setup Inicial:** Uma tela de configuração segura para o primeiro administrador criar sua conta e inicializar o sistema.
*   **Autenticação Completa:**
    *   Login seguro por e-mail e senha.
    *   Cadastro público para pacientes (com aprovação de admin).
    *   Fluxo de recuperação de senha.
*   **Dashboards por Perfil:**
    *   **Administrador:** Visão geral do sistema, gestão de usuários e configurações.
    *   **Médico:** Foco em agendamentos, pacientes e prontuários.
    *   **Secretaria:** Ferramentas para agendamento, gestão de pacientes e comunicação.
*   **Gestão de Usuários (Admin):**
    *   Criação de novos funcionários (Médicos, Secretárias) via convite por e-mail.
    *   Ativação, desativação e edição de perfis de usuários.
    *   Aprovação de novos pacientes cadastrados.
*   **Gestão de Pacientes:**
    *   Cadastro e edição de informações detalhadas dos pacientes.
    *   Busca e filtragem da base de pacientes.
*   **Dossiê do Paciente 360°:**
    *   Visualização centralizada de todo o histórico do paciente.
    *   Linha do tempo com consultas, orçamentos, cirurgias e documentos.
    *   Gestão de orçamentos e contratos.
    *   Canal de comunicação interna da equipe.
    *   Upload e gerenciamento de documentos.
*   **Agenda Unificada:**
    *   Calendário visual que combina consultas e cirurgias.
    *   Criação, edição e cancelamento de agendamentos.
    *   Filtro por profissional.
    *   Verificação de conflitos de horário em tempo real.
*   **Fluxo de Atendimento:**
    *   Atendimento rápido e avaliação médica completa.
    *   Registro de informações clínicas que alimentam o prontuário.
*   **Orçamentos e Cirurgias:**
    *   Criação e gerenciamento de orçamentos.
    *   Fluxo integrado: um orçamento aceito pode ser convertido diretamente em um agendamento de cirurgia.

---

## 3. Manual de Instalação e Publicação

### 3.1. Publicação do Projeto

Para colocar o sistema no ar e torná-lo acessível publicamente, o processo é direto:

1.  **Clique no botão "Publish"** localizado no canto superior direito da interface do Hostinger Horizons.
2.  O sistema será automaticamente compilado, otimizado e implantado no seu plano de hospedagem.
3.  Após a publicação, você receberá a URL final do seu sistema.

### 3.2. Configuração Pós-Publicação (Obrigatório)

Após publicar e obter sua URL final (ex: `https://suaclinica.com`), você **precisa** configurar o Supabase para que o login funcione corretamente no seu domínio.

1.  Acesse seu projeto no [Supabase](https://supabase.com).
2.  Navegue até **Authentication -> URL Configuration**.
3.  No campo **Site URL**, insira a URL do seu site publicado.
4.  Em **Redirect URLs**, adicione a mesma URL.
5.  Clique em **Save**.

### 3.3. Executando o Projeto Localmente (Para Desenvolvimento)

Se você precisar rodar o projeto em sua máquina local para futuras customizações:

1.  **Exporte o Projeto:** No menu "Hostinger Horizons", clique em "Exportar Projeto".
2.  **Instale as Dependências:** Abra um terminal na pasta do projeto e rode `npm install`.
3.  **Configure o `.env`:** Crie um arquivo `.env` na raiz e adicione suas chaves do Supabase:
    ```
    VITE_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
    VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
    ```
4.  **Inicie o Servidor:** Rode `npm run dev`.

---

## 4. Segurança dos Dados e Acesso

É crucial entender que o código-fonte exportado **NÃO CONTÉM DADOS SENSÍVEIS**.

*   **O Código Exportado:** Contém a lógica da aplicação (React, HTML, CSS) e os scripts para **criar a estrutura** do banco de dados.
*   **Os Dados Vivos:** Informações de pacientes, prontuários e finanças residem **exclusivamente** no seu banco de dados Supabase na nuvem, protegidos por múltiplas camadas de segurança.

O acesso a esses dados só é possível através da aplicação, que força a autenticação e aplica as regras de segurança (RLS) a cada requisição.
