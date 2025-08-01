# 🚀 Deploy Instructions - Clínica Prontuários

## 📋 Pré-requisitos

### 1. Configurar Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na ordem:
   - `database/01_types.sql`
   - `database/02_core_tables.sql` 
   - `database/03_appointment_tables.sql`
   - `database/04_communication_tables.sql`
   - `database/05_permission_and_availability_tables.sql`
   - `database/06_resource_management_tables.sql`
   - `database/07_document_and_settings_tables.sql`
   - `database/functions.sql`
   - `database/policies.sql`
   - `database/triggers.sql`

3. Anote suas credenciais:
   - `VITE_SUPABASE_URL`: URL do seu projeto
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima

### 2. Variáveis de Ambiente
Crie um arquivo `.env` com:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_APP_TITLE=Clínica Prontuários
VITE_APP_DESCRIPTION=Sistema de Gestão de Clínica Médica
```

## 🌐 Deploy Options

### Option 1: Vercel (Recomendado)
```bash
# 1. Fazer login no Vercel
npx vercel login

# 2. Deploy
npx vercel

# 3. Para produção
npx vercel --prod
```

### Option 2: Netlify
```bash
# 1. Build
npm run build

# 2. Deploy via Netlify CLI
npx netlify deploy --dir=dist --prod
```

### Option 3: Railway
```bash
# 1. Deploy
npx @railway/cli deploy
```

### Option 4: Firebase Hosting
```bash
# 1. Build
npm run build

# 2. Deploy
npx firebase deploy
```

## ⚙️ Configuração no Deploy

### Vercel
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Netlify
1. Conecte seu repositório
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Configure Environment Variables

## 🔧 Scripts Disponíveis

- `npm run dev` - Desenvolvimento local
- `npm run build` - Build para produção
- `npm run preview` - Preview do build local

## 🔐 Segurança

- ✅ RLS (Row Level Security) configurado
- ✅ Políticas de acesso por role
- ✅ Autenticação via Supabase Auth
- ✅ HTTPS obrigatório em produção

## 📞 Suporte

Para dúvidas sobre o deploy, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Vite](https://vitejs.dev/guide/)
