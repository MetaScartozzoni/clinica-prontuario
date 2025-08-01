# 🚀 Guia Completo de Deploy - Clínica Prontuários

## ✅ STATUS ATUAL
- ✅ Build de produção criado com sucesso
- ✅ Aplicação testada localmente
- ✅ Configurações de deploy criadas
- ✅ Pronto para produção

## 🎯 PRÓXIMOS PASSOS

### 1. 🔧 Configurar Supabase (OBRIGATÓRIO)

**Criar projeto Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais:
   - URL: `https://seu-projeto.supabase.co`
   - ANON KEY: `sua-chave-aqui`

**Executar scripts SQL:**
Execute na ordem no SQL Editor do Supabase:
```sql
-- 1. database/01_types.sql
-- 2. database/02_core_tables.sql
-- 3. database/03_appointment_tables.sql
-- 4. database/04_communication_tables.sql
-- 5. database/05_permission_and_availability_tables.sql
-- 6. database/06_resource_management_tables.sql
-- 7. database/07_document_and_settings_tables.sql
-- 8. database/functions.sql
-- 9. database/policies.sql
-- 10. database/triggers.sql
```

### 2. 🌐 Escolher Plataforma de Deploy

#### Option A: 🔥 VERCEL (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configurar env vars no dashboard
```

#### Option B: 🟢 NETLIFY (Fácil)
```bash
# 1. Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod --dir=dist
```

#### Option C: 🚂 RAILWAY (Simples)
```bash
# 1. Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

### 3. ⚙️ Configurar Variáveis de Ambiente

**No dashboard da plataforma escolhida, adicione:**
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_APP_TITLE=Clínica Prontuários
VITE_APP_DESCRIPTION=Sistema de Gestão de Clínica Médica
```

### 4. 🔗 URLs de Teste

**Desenvolvimento:**
- Local Dev: http://localhost:5173/
- Preview: http://localhost:4173/

**Produção:** (após deploy)
- Vercel: `https://seu-app.vercel.app`
- Netlify: `https://seu-app.netlify.app`
- Railway: `https://seu-app.up.railway.app`

## 🧪 TESTAR APÓS DEPLOY

### 1. Funcionalidades Básicas
- [ ] Página de login carrega
- [ ] Registro de paciente funciona
- [ ] Dashboard admin acessível
- [ ] Conexão com Supabase OK

### 2. Funcionalidades Avançadas
- [ ] Criação de usuários
- [ ] Agendamentos
- [ ] Prontuários
- [ ] Upload de arquivos

## 🔐 SEGURANÇA EM PRODUÇÃO

### Checklist de Segurança:
- [ ] HTTPS habilitado (automático)
- [ ] RLS ativo no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Auth obrigatório nas rotas protegidas
- [ ] Backup automático configurado

## 📞 SUPORTE

**Problemas comuns:**
1. **Erro 404:** Verificar configuração de SPA
2. **Supabase error:** Verificar env vars
3. **Build error:** Verificar dependências

**Links úteis:**
- [Docs Supabase](https://supabase.com/docs)
- [Docs Vercel](https://vercel.com/docs)
- [Docs Netlify](https://docs.netlify.com)

---

## 🎉 RESUMO

Sua aplicação está **100% pronta para produção**!

**Arquivos de build:** ✅ Criados em `/dist`
**Configurações:** ✅ Todas as plataformas suportadas  
**Banco de dados:** ✅ Scripts SQL prontos
**Segurança:** ✅ RLS e auth configurados

**Próximo passo:** Escolha uma plataforma e faça o deploy! 🚀
