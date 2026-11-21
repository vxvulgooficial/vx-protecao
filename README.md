# VX VULGO • Central de Proteção (site)

Painel web completo para gerenciar o aparelho protegido. Funciona no GitHub Pages, sem servidor, sem banco de dados e sem dependências externas.

**CRIADO POR VX VULGO** • v2.8.0 • OBSIDIAN & EMERALD CYBER.

---

## 1. O que o painel faz

Tudo que é avançado fica aqui, não no celular:

- **Visão geral** — estado da proteção e ações rápidas.
- **Comandos** — ativar proteção (com ou sem alerta), liberar aparelho, trocar mensagem, trocar autor, reaplicar proteção e liberar formatação. Cada comando sai assinado.
- **Tela e autor** — texto da tela e nome do autor exibido na proteção. O aparelho não fala.
- **Atualizações** — lê o APK, calcula o SHA-256 e gera o manifesto com versão, comando e assinatura.
- **Conexão** — consulta o manifesto publicado e mostra o que o aparelho vai encontrar.
- **Administração** — troca de PIN e palavra-chave, opções do desenvolvedor, atualização automática e encerramento da proteção.
- **Histórico** — registro local das ações feitas no navegador.
- **Configurações** — segredo de assinatura e endereço das atualizações.

O aplicativo no celular só cuida da proteção em si. Quem decide, configura e envia é este painel.

---

## 2. Publicar no GitHub

1. Crie um repositório público chamado **`vx-protecao`** na sua conta `vxvulgooficial`.
2. Envie o conteúdo da pasta `site` para a **raiz** do repositório — não coloque dentro de outra pasta. São 6 arquivos: `index.html`, `style.css`, `app.js`, `README.md`, `update-manifest.json` e `assets/vx-dono.apk`.
3. Na raiz do projeto, rode:

   ```powershell
   .\publicar-site.cmd
   ```

   O `.cmd` só chama o PowerShell com a política de execução liberada. O script pede o token de forma segura no terminal, envia os arquivos e nunca grava a credencial. Se preferir não digitar na hora:

   ```powershell
   $env:VX_GH_TOKEN = 'seu_token_novo'
   .\publicar-site.cmd
   ```

   Também dá para arrastar os arquivos pelo site do GitHub. Depois de publicar uma vez, o painel passa a publicar o manifesto sozinho.

4. No GitHub, abra **Settings → Pages**.
5. Em **Build and deployment**, deixe **Deploy from a branch**.
6. Escolha **Branch: main** e **Folder: / (root)**. Salve.
7. O endereço será:

   ```
   https://vxvulgooficial.github.io/vx-protecao/
   ```

8. O manifesto fica em:

   ```
   https://vxvulgooficial.github.io/vx-protecao/update-manifest.json
   ```

Esse mesmo endereço já é o padrão configurado no aplicativo.

### Publicação automática (um clique)

Depois de publicar o site uma vez, abra **CONFIGURAÇÕES → PUBLICAÇÃO AUTOMÁTICA** e preencha:

| Campo | Valor |
|---|---|
| Token do GitHub | token com permissão **Contents: write** só no repo `vx-protecao` |
| Dono | `vxvulgooficial` |
| Repositório | `vx-protecao` |
| Branch | `main` |
| Arquivo | `update-manifest.json` |

Clique em **TESTAR PUBLICAÇÃO**. Depois disso, os botões **APLICAR** (Visão Geral, Comandos e Administração) geram a assinatura e publicam o manifesto sozinhos. O aparelho pega a ordem na próxima verificação automática.

O token fica salvo apenas no `localStorage` deste navegador e nunca entra no comando, no manifesto ou no histórico. Use um token **fine-grained** limitado a esse repositório. Se ele vazar, revogue e gere outro.

> ⚠️ Nunca cole token do GitHub em conversa, print ou arquivo do projeto.

### Testar antes de publicar

Abra um terminal dentro da pasta `site` e rode:

```powershell
python -m http.server 8080
```

Depois acesse `http://localhost:8080`. O `crypto.subtle` (usado para SHA-256 e assinatura) exige HTTPS ou `localhost` — por isso não abra o `index.html` direto com duplo clique.

---

## 3. Primeiro acesso

| Campo | Valor inicial |
|---|---|
| PIN | `2026` |
| Palavra-chave | `VX-VULGO` |
| Segredo de assinatura | `VX-VULGO-2026-REMOTO` |

A troca de PIN e palavra-chave do aparelho é feita na aba **ADMINISTRAÇÃO**. O segredo de assinatura do site fica em **CONFIGURAÇÕES** e precisa ser **exatamente igual** ao usado pelo aparelho, senão os comandos são recusados.

As chaves de login deste painel são independentes das chaves de liberação do aparelho: trocar o PIN no aparelho não altera o PIN de acesso ao site.

> Não coloque o arquivo `vx.keystore` neste repositório. Ele é a chave de assinatura do APK e nunca deve ser publicada.

---

## 4. Enviando um comando

1. Abra **COMANDOS** (ou use uma ação rápida na Visão Geral).
2. Escolha o tipo de comando. O formulário se ajusta sozinho ao que cada comando precisa.
3. Preencha o que aparecer e clique em **APLICAR AGORA**.
4. O painel gera o `commandId`, calcula a assinatura HMAC e publica o `update-manifest.json` no GitHub. O aparelho pega a ordem na próxima verificação automática.

Se não quiser publicar automaticamente, use **SÓ GERAR (MANUAL)**:

- **Comando direto**: copie o texto em *COMANDO DIRETO* e execute onde você costuma enviar comandos ao aparelho.
- **Manifesto**: copie o JSON em *MANIFESTO COM COMANDO* e publique como `update-manifest.json` na mão.

### Mensagem, autor e alerta, afinal

- **Mensagem** é o texto que aparece na tela do aparelho.
- **Autor** é o nome em destaque como responsável pela proteção. Você define em **TELA E AUTOR** e ele já vem preenchido nos comandos. Para mudar só o autor, use `AUTOR`.
- **O aparelho não fala.** `LOCK` abre a tela em silêncio. `ALERT` abre a mesma tela com **som de alerta e vibração**.
- `MESSAGE` troca só o texto da tela. `AUTOR` troca só o nome do autor.
- Em `CHAVES`, `TECNICO`, `ATUALIZAR` e `AUTOR`, o campo de mensagem vira os dados do comando. O próprio formulário mostra o formato.
- Em `RELEASE`, `PROTECT`, `UNLOCKFORMAT` e `REMOVER` não tem nada para preencher.

Os valores salvos em **TELA E AUTOR** são o padrão: já vêm preenchidos quando você escolhe `LOCK` ou `ALERT`, e podem ser mudados só na hora.

O número `commandId` evita que um comando antigo seja aplicado de novo.

Na aba **ADMINISTRAÇÃO**, os botões de `CHAVES`, `TECNICO`, `ATUALIZAR` e `REMOVER` já montam o formato correto, assinam e publicam o comando direto no GitHub.

---

## 5. Atualizando o APK

1. Gere o APK final na ferramenta (`build.ps1`).
2. No painel, abra **ATUALIZAÇÕES**.
3. Selecione o arquivo `vx-dono.apk`. O painel calcula o SHA-256 sozinho.
4. Confira `versionCode`, `versionName` e a URL do APK.
5. Se quiser, embuta um comando (proteção da tela, mensagem etc.).
6. Clique em **GERAR MANIFESTO** e depois em **BAIXAR JSON**.
7. Suba o JSON como `update-manifest.json` e o APK em `assets/vx-dono.apk`.

O aparelho só instala se o SHA-256 bater e a assinatura do APK for a mesma do aplicativo instalado.

---

## 6. Formatação e recuperação

A proteção contra formatação fica ativa por padrão. Para formatar com autorização:

1. No painel, gere o comando `UNLOCKFORMAT`.
2. Envie ao aparelho pelo manifesto ou pelo comando direto.
3. Depois de formatar, baixe o APK em **VISÃO GERAL → BAIXAR APK** e reinstale o aplicativo.
4. Gere `PROTECT` para reaplicar a proteção.

Sem essa autorização, a formatação não é liberada pelo aparelho.

---

## 7. Arquivos

```
site/
├── index.html            painel completo
├── style.css             tema Obsidian & Emerald
├── app.js                assinatura, SHA-256, comandos e manifesto
├── update-manifest.json  manifesto publicado
├── assets/
│   └── vx-dono.apk       APK pronto para reinstalar (v2.8.0)
└── README.md             este guia
```

---

## 8. Problemas comuns

| Situação | Causa provável | Solução |
|---|---|---|
| Login não aceita | Chaves de acesso ao painel divergentes | Use os valores atuais ou limpe os dados do site no navegador |
| “Use HTTPS ou localhost” | Abriu o HTML direto do disco | Rode `python -m http.server 8080` e acesse `localhost` |
| Comando recusado no aparelho | Segredo de assinatura diferente | Confira o segredo em CONFIGURAÇÕES |
| Comando não chega | Manifesto ainda não atualizado | Publique o JSON e aguarde a próxima verificação |
| APK não instala | SHA-256 ou assinatura diferentes | Gere o manifesto de novo com o APK final |
| Sem conexão na aba CONEXÃO | Endereço errado ou site ainda não publicado | Confira a URL e aguarde o GitHub Pages publicar |

---

**CRIADO POR VX VULGO**
