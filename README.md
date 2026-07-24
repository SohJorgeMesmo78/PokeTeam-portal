# ⚡ PokéTeam Portal

Aplicação Web Single Page (SPA) moderna e de alta performance desenvolvida em **Angular 19** (com **Standalone Components**, **Angular Signals**, **RxJS** e **Vanilla CSS**). O portal consome a **[PokeTeam API](https://github.com/SohJorgeMesmo78/PokeTeam-api)** para oferecer uma experiência completa de Pokédex, criação de times, biblioteca de salvos e personalização de perfil.

---

## 🌟 Funcionalidades do Portal

### 📖 1. Pokédex Interativa & Filtros de Capinhas de Jogos
- **1025 Pokémon com Filtros Dinâmicos**: Busca por nome, filtro multi-tipo, gerações (Gen 1-9), Pokédex Regional por jogo com **Capinhas Oficiais dos Jogos (Box Art)**, seções recolhíveis e filtro *"Apenas Última Evolução"*.
- **Infinite Scroll**: Carregamento contínuo e fluido de novos Pokémon ao rolar a página.
- **Ficha Técnica Detalhada**:
  - Matriz de Fraquezas & Resistências elementais calculada dinamicamente.
  - Cadeia Evolutiva visual com requisitos de evolução.
  - Ataques aprendidos organizados por abas (*Nível*, *TM/HM*, *Egg*, *Tutor*).
  - Tradução sob demanda para Português de descrições não traduzidas.

---

### 👤 2. Perfil de Treinador, Avatares & Pokémon Favorito
- **Galeria de Avatares Treinadores/Treinadoras**: Seleção de avatares com retrato enquadrado no Header (*head & shoulders*) e card de perfil completo.
- **Exibição Dinâmica do Pokémon Favorito por Altura (Porte)**:
  - *Micro (< 1,00m)*, *Pequeno (1,00-1,30m)*, *Médio (1,30-1,70m)* e *Grande (> 1,70m)* com alinhamento dinâmico em `z-index` na frente/atrás do treinador.
- **Modal de Pesquisa de Pokémon Favorito**: Busca com debounce de 350ms e infinite scroll.

---

### 🎮 3. Exclusivos de Versão
- Destaque em badges de Pokémon exclusivos no card (ex: `Exclusivo RED`, `Exclusivo FIRERED`).
- Galeria de comparação de trios/pares de jogos oficiais e suas Pokédex Regionais.

---

### 🛡️ 4. Montador de Times (Team Builder)
- **Fluxo em 2 Passos**:
  - *Passo 1*: Escolha da Pokédex (Geral ou Jogo Específico).
  - *Passo 2*: Grade com 6 retângulos de integrantes com suporte a movimentação (*shifting*) e substituição.
- **Configuração Técnica Avançada**:
  - Personalização de **Apelido**, **Natureza** (com modificadores visuais **▲ Vermelho (+10%)** e **▼ Azul (-10%)**), **Habilidade** (cards clicáveis com descrição) e **4 Golpes** (com tipo, categoria ⚔️/✨/🛡️, PP, Dano e Acc %).

---

### 💖 5. Meus Pokémon Salvos & Presets
- Biblioteca pessoal para cadastrar e gerenciar preferências avulsas de Pokémon.
- **Apelidos Únicos**: Validação e auto-sugestão sequencial (*Milotic #2*, etc.).
- **Importação de Times**: Modal em 3 passos para extrair Pokémon de um time criado com verificação de duplicatas exatas.
- **Sugestão de Presets ao Montar Times**: Ao escolher um Pokémon para um time, o portal detecta pré-configurações salvas daquela espécie e aplica no slot com 1 clique.

---

### 🔔 6. Toastrs & Responsividade Mobile First
- Notificações flutuantes animadas (Sucesso, Erro, Alerta, Info).
- Interface 100% responsiva para smartphones com barra de navegação em pílulas deslizantes (`overflow-x: auto`) e cabeçalho mobile.

---

## 🛠️ Tecnologias Utilizadas

- **Angular 19** (Standalone Components)
- **Angular Signals** (`signal()`, `computed()`)
- **RxJS** (Subjects, debounceTime, distinctUntilChanged)
- **Vanilla CSS** (Design tokens, Glassmorphism, Dark Theme, Micro-animações)
- **Phosphor Icons**

---

## 🟢 Como Executar o Portal

### Em Desenvolvimento:
```bash
cd PokeTeam-portal
npm install
npm start
```
Acesse no navegador: `http://localhost:4200`

### Em Produção (Build de Produção):
```bash
npm run build -- --configuration production
```
Os arquivos otimizados serão gerados no diretório `dist/PokeTeam-portal`.

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
│   ├── pokemon-list/         # Pokédex principal com infinite scroll e capinhas
│   ├── profile/              # Tela de perfil, avatares e Pokémon favorito
│   ├── register/             # Tela de Cadastro de novos usuários
│   ├── saved-pokemon-list/   # Biblioteca "Meus Pokémon Salvos" e Importação
│   ├── team-builder/         # Galeria de times do usuário
│   ├── team-creator/         # Montador de times em 2 passos e presets
│   └── toast-container/      # Sistema de notificações Toastr flutuante
├── interceptors/
│   └── auth.interceptor.ts   # Interceptor HTTP para JWT
└── services/
    ├── auth.service.ts       # Autenticação, sessão e perfil do usuário
    ├── poke-api.service.ts   # Integração com backend PokéTeam API
    ├── saved-pokemon.service.ts # CRUD de Pokémon salvos
    ├── team.service.ts       # CRUD de times do usuário
    └── toast.service.ts      # Serviço de notificações Toastr
```

---

## 👨‍💻 Autor

Desenvolvido por **[Jorge Pereira](https://jfpereira.seteoito.dev/)**.
