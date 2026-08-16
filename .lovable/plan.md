# Plano de Implementação: Configuração de Intervalo de AutoSave

Este plano detalha a adição de uma opção para definir o intervalo do salvamento automático (autosave) nas configurações do jogo, permitindo que o jogador escolha entre 15s, 30s e 60s.

## Alterações Propostas

### 1. Persistência da Configuração
- Modificar o sistema de salvamento para armazenar a preferência de intervalo de autosave no `localStorage`.
- Valor padrão inicial: 60 segundos (60000ms).

### 2. Interface de Configuração
- Adicionar uma nova seção no componente `SaveManager` para "Configurações de AutoSave".
- Incluir um seletor (botões de opção ou similar) permitindo escolher entre as opções: 15s, 30s, 60s.

### 3. Integração com o Game Loop
- Atualizar o `GameContainer` para reagir à mudança de configuração.
- O timer de autosave será reiniciado sempre que o intervalo for alterado ou o jogo for carregado.

### 4. Atualização Informativa
- Atualizar o rodapé informativo na página principal (`src/routes/index.tsx`) para refletir que o intervalo agora é configurável.

## Detalhes Técnicos

- **Storage Key**: `monkey-long-autosave-interval`.
- **Componentes Afetados**:
    - `src/components/game/save-management/SaveManager.tsx`: Adição da UI de configuração.
    - `src/components/game/GameContainer.tsx`: Lógica para ler a configuração e ajustar o `setInterval`.
    - `src/routes/index.tsx`: Atualização do texto descritivo.
