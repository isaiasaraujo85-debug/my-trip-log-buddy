# PROJETO 2

🔹 DESCRIÇÃO GERAL DO APLICATIVO

Criar um aplicativo Android para uso pessoal, sem necessidade de publicação na Play Store, com o objetivo de controlar KM rodado, gastos com pedágio e gastos com refeição, gerando relatórios semanais e em PDF.

O aplicativo deve funcionar offline, salvando todos os dados localmente no próprio celular.

🔹 ESTRUTURA DO APLICATIVO

O aplicativo deve ter 3 abas principais:

KM

Pedágio

Refeição

Deve existir um logo da empresa/usuário, exibido:

No topo do aplicativo

No topo de todos os relatórios

🛣️ ABA 1 — CONTROLE DE KM
Campos obrigatórios:

Placa do veículo

Proprietário

Número da chapa do proprietário

Data (selecionável por calendário)

KM inicial

KM final

KM percorrido (campo automático)

Regras:

O campo KM percorrido deve ser calculado automaticamente:

KM percorrido = KM final - KM inicial


O usuário não pode editar manualmente o KM percorrido.

Todos os campos devem ser salvos localmente no dispositivo.

Ações:

Botão Salvar KM

Cada dia salvo deve virar um novo registro

O usuário deve poder lançar dados de segunda a sexta

📄 Relatório de KM

Opção para selecionar data inicial e data final

Mostrar todos os registros do período

Calcular automaticamente:

KM total percorrido no período

Gerar relatório em PDF, contendo:

Logo no topo

Período selecionado

Tabela com os dias

Total de KM percorridos

Permitir visualizar, salvar e imprimir o PDF

🚧 ABA 2 — PEDÁGIO
Campos:

Data

Valor do pedágio

Funcionalidades:

Botão Adicionar pedágio

Possibilidade de adicionar vários pedágios no mesmo dia

Todos os dados devem ser salvos localmente

📄 Relatório de Pedágio

Seleção de data inicial e final

Lista de pedágios do período

Cálculo automático:

Total gasto com pedágio

Geração de relatório em PDF com logo

Opção de imprimir ou compartilhar o PDF

🍽️ ABA 3 — REFEIÇÃO
Campos:

Data

Valor da refeição

Funcionalidades:

Botão Adicionar refeição

Possibilidade de vários lançamentos no mesmo dia

Dados salvos localmente

📄 Relatório de Refeição

Seleção de período

Lista dos valores lançados

Soma total dos gastos com refeição

Relatório em PDF com logo

Opção de imprimir ou compartilhar

🔐 ARMAZENAMENTO DE DADOS

Todos os dados devem ser armazenados localmente no dispositivo

O aplicativo deve funcionar sem internet

Os dados devem permanecer salvos mesmo após fechar o app

🎨 INTERFACE

Interface simples e clara

Campos alinhados (label à esquerda, campo à direita)

Navegação fácil entre abas

Relatórios organizados e legíveis

Layout profissional

📦 EXPORTAÇÃO

Possibilidade de gerar o aplicativo em APK

O APK deve poder ser instalado manualmente no celular Android

🔹 OBJETIVO FINAL

Facilitar o controle diário de deslocamentos e despesas, permitindo gerar relatórios semanais confiáveis e profissionais para uso pessoal ou prestação de contas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://my-trip-log-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7b3da8c3-e97e-4e7f-bb93-3927c9a55b67).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
