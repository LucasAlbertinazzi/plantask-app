# PlanTask

Protótipo de interface para **organização de plantões, pacientes e tarefas**, desenvolvido com **Next.js, React e TypeScript**.

O foco é demonstrar navegação, componentes responsivos, filtros, estados de tarefas e organização visual de uma passagem de plantão. Os registros iniciais são exemplos declarados como fictícios no código.

## Funcionalidades do protótipo

- Visão geral de pacientes e prioridades.
- Lista e criação de tarefas, com alteração de estado.
- Detalhes de pacientes e visualização de passagem de plantão.
- Tela de equipe e perfil.
- Tema claro/escuro e adaptação a telas móveis.
- Estado compartilhado com React Context e persistência local dos dados centrais via `localStorage`.

## Stack

- Next.js 16 e React 19.
- TypeScript e Tailwind CSS 4.
- React Context para estado compartilhado.
- ESLint para análise estática.

As versões efetivamente resolvidas estão em `package-lock.json`.

## Executar localmente

Com uma versão LTS do Node.js compatível com o Next.js 16:

```bash
npm ci
npm run dev
```

Abra o endereço local exibido pelo Next.js.

```bash
npm run lint
npm run build
npm start
```

`npm start` serve o build já gerado. Esses comandos são instruções de execução; não foram executados durante a preparação deste README.

## Estrutura

```text
app/                    rotas e telas com App Router
components/AppLayout.tsx navegação e estrutura compartilhada
hooks/                  hooks de interface
lib/store.tsx            estado, tipos e dados demonstrativos
lib/utils.ts            utilitários de apresentação
```

## Dados e limites

Este repositório apresenta um **protótipo de portfólio**, sem integração com prontuários ou backend clínico. Nomes, leitos, equipe e informações clínicas dos exemplos são dados demonstrativos; não devem ser substituídos por dados reais de pacientes.

As alterações persistidas no navegador pertencem àquela origem e àquele dispositivo. Limpar os dados do site pode removê-las. O protótipo não implementa autenticação, controle de acesso ou sincronização entre usuários.

Os resumos exibidos fazem parte dos exemplos locais; a aplicação não chama um modelo de IA. O template original inclui `@google/genai` e um `.env.example`, mas nenhuma chave é necessária para os fluxos demonstrativos implementados. Credenciais reais devem permanecer fora do Git.

## Autor

[Lucas Albertinazzi](https://github.com/LucasAlbertinazzi) · [LinkedIn](https://www.linkedin.com/in/LucasAlbertinazzi)
