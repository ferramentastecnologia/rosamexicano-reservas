# 🌮 Rosa Mexicano - Continuação do Projeto

## 📍 Localização do Projeto
```
/Users/juanminni/meu-repositorio/rosamexicano-reservas
```

## ✅ O que já está feito
- ✅ Projeto base copiado do Mortadella
- ✅ Package.json atualizado para "rosamexicano-reservas"
- ✅ Estrutura completa (formulário, checkout demo, banco de dados)

## 🎯 Próximos Passos

### 1. Atualizar Cores
Substituir em TODOS os arquivos .tsx:
- `#0e9a20` → `#E53935` (verde → vermelho)
- `#0a6b16` → `#B71C1C` (verde escuro → vermelho escuro)
- Adicionar `#FFC107` (amarelo) como cor secundária

**Arquivos principais:**
- `app/page.tsx`
- `app/components/ReservaForm.tsx`
- `app/components/CalendarioReserva.tsx`
- `app/pagamento-demo/PagamentoDemoContent.tsx`
- `app/sucesso/SucessoContent.tsx`

### 2. Atualizar Textos

**Substituições:**
- "Mortadella Ristorante" → "Rosa Mexicano"
- "Mortadella Ristorante & Pizzeria" → "Rosa Mexicano Restaurante"
- "Ristorante Italiano" → "Restaurante Mexicano"
- "Tradição Italiana" → "Sabor Autêntico Mexicano"
- "Celebre o Final do Ano com Tradição e Sabor" → "Celebre o Final do Ano com Sabor Mexicano"

**Informações do Restaurante:**
- Endereço: Rua 7 de Setembro, 1234 - Centro, Blumenau/SC
- Telefone: (47) 3333-4444
- WhatsApp: (47) 99999-8888

### 3. Imagens
- Logo: Buscar logo do Rosa Mexicano
- Fotos: Adicionar fotos de comida mexicana e do restaurante
- Pasta: `public/images/`

### 4. Inicializar Git e Deploy
```bash
cd /Users/juanminni/meu-repositorio/rosamexicano-reservas
git init
git add -A
git commit -m "Initial commit: Rosa Mexicano reservas"
# Criar repositório no GitHub
# Conectar ao Netlify
```

## 📊 Referência - Projeto Mortadella (COMPLETO)
- Site: https://mortadella-reservas.netlify.app
- GitHub: https://github.com/ferramentastecnologia/mortadellareservas
- Pasta: /Users/juanminni/meu-repositorio/mortadella-reservas-final-ano

## 🔧 Comandos Úteis

**Instalar dependências:**
```bash
cd /Users/juanminni/meu-repositorio/rosamexicano-reservas
npm install
```

**Rodar localmente:**
```bash
npm run dev
# Abre em http://localhost:3000
```

**Buscar e substituir cores (exemplo):**
```bash
# Substituir verde por vermelho em todos os arquivos
find app -name "*.tsx" -exec sed -i '' 's/#0e9a20/#E53935/g' {} +
find app -name "*.tsx" -exec sed -i '' 's/#0a6b16/#B71C1C/g' {} +
```

## 📝 Checklist de Conclusão
- [ ] Cores atualizadas (verde → vermelho/amarelo)
- [ ] Todos os textos substituídos
- [ ] Logo Rosa Mexicano adicionado
- [ ] Fotos atualizadas
- [ ] Testado localmente
- [ ] Git inicializado
- [ ] Repositório criado no GitHub
- [ ] Deploy no Netlify
- [ ] Variável DATABASE_URL configurada

## 💡 Dica
Na nova sessão, peça ao Claude:
"Continue o projeto Rosa Mexicano em /Users/juanminni/meu-repositorio/rosamexicano-reservas seguindo o arquivo CONTINUAR-AQUI.md"
