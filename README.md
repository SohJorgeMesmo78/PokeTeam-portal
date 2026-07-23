# ⚡ PokéTeam Portal

Aplicação Web Single Page (SPA) moderna e responsiva desenvolvida em **Angular 19** (com **Standalone Components**, **Angular Signals** e **Vanilla CSS**). O portal consome a **[PokeTeam API](https://github.com/SohJorgeMesmo78/PokeTeam-api)** para oferecer uma experiência completa de Pokédex, criação de times e personalização de Pokémon.

---

## 🌟 Funcionalidades do Portal

### 📖 1. Pokédex Interativa
- **1025 Pokémon com Filtros Dinâmicos**: Busca por nome, filtro multi-tipo, gerações (Gen 1-9), Pokédex Regional por jogo e filtro *"Apenas Última Evolução"*.
- **Infinite Scroll**: Carregamento contínuo e fluido de novos Pokémon ao rolar a página.
- **Ficha Técnica Detalhada**:
  - Matriz de Fraquezas & Resistências elementais calculada dinamicamente.
  - Cadeia Evolutiva visual com requisitos de evolução.
  - Ataques aprendidos organizados por abas (*Nível*, *TM/HM*, *Egg*, *Tutor*).
  - Tradução sob demanda para Português de descrições não traduzidas.

### 🎮 2. Exclusivos de Versão
- Destaque em badges de Pokémon exclusivos no card (ex: `Exclusivo RED`, `Exclusivo FIRERED`).
- Galeria de comparação de jogos oficiais e suas Pokédex Regionais.

### 🛡️ 3. Montador de Times (Team Builder)
- **Fluxo em 2 Passos**:
  - *Passo 1*: Escolha da Pokédex (Geral ou Jogo Específico).
  - *Passo 2*: Grade com 6 retângulos de integrantes com suporte a movimentação (*shifting*) e substituição.
- **Configuração Técnica Avançada**:
  - Personalização de **Apelido**, **Natureza** (com modificadores visuais **▲ Vermelho (+10%)** e **▼ Azul (-10%)**), **Habilidade** (cards clicáveis com descrição) e **4 Golpes** (com tipo, categoria ⚔️/✨/🛡️, PP, Dano e Acc %).

### 💖 4. Meus Pokémon Salvos
- Biblioteca pessoal para cadastrar e gerenciar preferências avulsas de Pokémon.
- **Apelidos Únicos**: Validação e auto-sugestão sequencial (*Milotic #2*, etc.).
- **Importação de Times**: Modal em 3 passos para extrair Pokémon de um time criado com verificação de duplicatas exatas.

### 💡 5. Sugestão de Presets ao Montar Times
- Ao escolher um Pokémon para um time, o portal detecta se o usuário possui pré-configurações salvas daquela espécie e sugere a aplicação direta no slot com 1 clique.

### 🔔 6. Toastrs & Responsividade Mobile First
- Notificações flutuantes animadas (Sucesso, Erro, Alerta, Info).
- Interface 100% responsiva para smartphones com barra de navegação em pílulas deslizantes (`overflow-x: auto`) e cabeçalho mobile.

---

## 🛠️ Tecnologias Utilizadas

- **Angular 19** (Standalone Components)
- **Angular Signals** (`signal()`, `computed()`)
- **RxJS**
- **Vanilla CSS** (Design tokens, Glassmorphism, Dark Theme)
- **Phosphor Icons**

---

## 🟢 Como Executar o Portal

### 1. Clonar o repositório
```bash
git clone https://github.com/SohJorgeMesmo78/PokeTeam-portal.git
cd PokeTeam-portal
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Executar o servidor de desenvolvimento
```bash
npm start
```

Acesse o portal no navegador: `http://localhost:4200`

> 💡 *Certifique-se de que a **PokeTeam API** está rodando em `http://localhost:3000`.*

---

## 🏗️ Estrutura de Componentes

```
src/app/
├── components/
│   ├── config-modal/         # Modal de configurações de tradução
│   ├── game-versions/        # Tela de versões e Pokémon exclusivos
│   ├── login/                # Tela de Login de usuários
│   ├── pokemon-card/         # Card individual do Pokémon com badges
│   ├── pokemon-detail-modal/ # Modal de ficha técnica completa e evoluções
│   ├── pokemon-list/         # Pokédex principal com infinite scroll
│   ├── register/             # Tela de Cadastro de novos usuários
│   ├── saved-pokemon-list/   # Biblioteca "Meus Pokémon Salvos" e Importação
│   ├── team-builder/         # Galeria de times do usuário
│   ├── team-creator/         # Montador de times em 2 passos e presets
│   └── toast-container/      # Sistema de notificações Toastr flutuante
├── interceptors/
│   └── auth.interceptor.ts   # Interceptor HTTP para JWT
└── services/
    ├── auth.service.ts       # Autenticação e sessão do usuário
    ├── poke-api.service.ts   # Integração com backend PokéTeam API
    ├── saved-pokemon.service.ts # CRUD de Pokémon salvos
    ├── team.service.ts       # CRUD de times do usuário
    └── toast.service.ts      # Serviço de notificações Toastr
```

---

## 👨‍💻 Autor

Desenvolvido por **[Jorge Pereira](https://jf-pereira.vercel.app/)**.
