# Getting Started: the lessons

Ten video lessons, one per chapter of Getting Started (`.course/docs/getting-started/`), each a tag
of this repository (`chapter-1` … `chapter-10`, from `chapter-0`, the empty start). Each lesson is
an outline of 6 to 9 beats, in the order of compass-course's lesson scripts: intro, pain, problem,
solution, check, what this unlocks, challenge. A beat says what's on screen (`show`) and what's
said, in English and Portuguese. These are outlines to write the scripts from, not scripts.

On screen:

- `title`: the lesson's title card;
- `card`: a card with a title and up to 3 points;
- `type <file>`: the file typed in, with the others it shows after;
- `run <command>`: a terminal recording;
- `browser`: a browser recording.

## 1 · One booking · Uma reserva

Chapter 1 (`01-one-booking.md`), tag `chapter-1`. Files: `plugins/bookings/{mod,actions,views}.ts`,
`app.ts`, `hello.ts`, `package.json` (`hello`).

1. **intro** · `title`
   - EN: In this course you build one app, a salon's bookings, and open it to people and to AI. It
     starts with one booking.
   - PT: Neste curso você constrói um app, as reservas de um salão, e abre ele pra pessoas e pra IA.
     Começa com uma reserva.
2. **pain** · `card` "Three ways to book" (the page, the bot, the integration; two customers, one
   Tuesday)
   - EN: Each way in books a little differently. One day two customers hold the same Tuesday, and
     nobody knows who booked it.
   - PT: Cada entrada reserva de um jeito. Um dia dois clientes ficam com a mesma terça, e ninguém
     sabe quem reservou.
3. **problem** · `card` "One place" (what a booking is; how one is made; who made it)
   - EN: One place says what a booking is and how one is made, and every booking remembers who.
   - PT: Um lugar só diz o que é uma reserva e como se faz, e toda reserva lembra quem fez.
4. **solution** · `type plugins/bookings/mod.ts`, then `actions.ts`
   - EN: A plugin is plain objects: a collection, an Action, a View, a resource. The Action is the
     only way to book, and its `allow` says who may call it.
   - PT: Um plugin é objeto simples: uma collection, uma Action, uma View, um resource. A Action é o
     único jeito de reservar, e o `allow` diz quem pode chamar.
5. **solution** · `type app.ts`, then `hello.ts`
   - EN: The salon's slots are settings, a later plugin's resource. And every call is someone's:
     Sam, a person.
   - PT: Os horários do salão são configuração, o resource de um plugin depois. E toda chamada é de
     alguém: o Sam, uma pessoa.
6. **check** · `run npm run hello`
   - EN: Booked, refused the second time, and the record: five events, each with Sam on it.
   - PT: Reservado, recusado na segunda vez, e o registro: cinco eventos, cada um com o Sam.
7. **unlocks** · `card` "What this unlocks" (one way to book; who did it, always; settings, not
   code)
   - EN: Every way in you add will call this Action, and the record will say who.
   - PT: Toda entrada que você adicionar vai chamar essa Action, e o registro vai dizer quem.
8. **challenge** · `card` "Your challenge" (add Sat 11:00; book `sun-10`; next: customers)
   - EN: Add Saturday at 11, and book a slot that doesn't exist. Next: customers, who see only their
     own.
   - PT: Adicione sábado às 11, e reserve um horário que não existe. Próximo: clientes, que só veem
     as suas.

## 2 · Who sees what · Quem vê o quê

Chapter 2 (`02-who-sees-what.md`), tag `chapter-2`. Files: `plugins/bookings/*` (`contract.ts` new),
`app.ts` (`openDesk`), `tests/kit.ts` (`sam`, at the desk), `tests/bookings.test.ts`,
`package.json`; `hello.ts` goes.

1. **intro** · `title`
   - EN: Customers arrive, and now bookings are private. Staff see all; a customer sees their own.
   - PT: Chegam os clientes, e as reservas viram privadas. A equipe vê todas; o cliente, só as dele.
2. **pain** · `card` "A filter in every handler"
   - EN: The usual fix is an `if` in every handler. The fifth way in forgets it.
   - PT: O conserto de sempre é um `if` em cada handler. A quinta entrada esquece.
3. **problem** · `card` "At the data" (once; every caller; taken, not whose)
   - EN: The rule belongs where the data is: written once, holding for every caller. And "taken"
     must never say by whom.
   - PT: A regra mora onde o dado mora: escrita uma vez, valendo pra todo mundo. E "ocupado" nunca
     diz por quem.
4. **solution** · `type app.ts` (`access`, `openDesk`)
   - EN: People are staff, the desk is a space, Sam manages it. Customers are contacts, each with a
     chat of their own.
   - PT: Pessoas são a equipe, o balcão é um space, o Sam gerencia. Clientes são contatos, cada um
     com sua conversa.
5. **solution** · `type plugins/bookings/mod.ts` (`shared`, `slot_taken`, `guard`), then
   `actions.ts`
   - EN: One line: a booking lives in the desk and is part of its chat. Reads are filtered, writes
     checked. The Action runs as its caller, where the call is, in one transaction.
   - PT: Uma linha: a reserva mora no balcão e faz parte da conversa. Leituras filtradas, escritas
     conferidas. A Action roda como quem chama, onde a chamada está, numa transação.
6. **solution** · `card` "Who may call" (`peopleOrContacts`; asked of tools too; `inPerson`)
   - EN: `allow` is asked of every caller, the app's own tools too. An agent calls only what it and
     its customer may.
   - PT: O `allow` é perguntado a todo mundo que chama, até às ferramentas do próprio app. Um agente
     só chama o que ele e o cliente dele podem.
7. **check** · `run npm test`
   - EN: Sam sees three bookings, Bia one, Caio one. Caio's tries are refused, by the rule, not by
     an `if`.
   - PT: O Sam vê três reservas, a Bia uma, o Caio uma. As tentativas do Caio são recusadas, pela
     regra, não por um `if`.
8. **unlocks** · `card` "What this unlocks" (rules that come with the data; no leaks; all or
   nothing)
   - EN: Every way in you add inherits the rule, with no line of its own.
   - PT: Toda entrada nova herda a regra, sem uma linha própria.
9. **challenge** · `card` "Your challenge" (`booking.move`; next: the web page)
   - EN: Write `booking.move`, and test that Caio can't move Bia's. Next: the desk on the web.
   - PT: Escreva o `booking.move`, e teste que o Caio não move a da Bia. Próximo: o balcão na web.

## 3 · Its own web page · Uma página só sua

Chapter 3 (`03-its-own-web-page.md`), tag `chapter-3`. Files: `plugins/bookings/queries.ts` and
`web.tsx` (new), `views.ts`, `mod.ts`, `contract.ts`, `front.ts`, `browser.tsx`, `server.ts`,
`tsx.ts`, `tests/kit.ts`, `tests/web.test.ts`, `package.json` (`dev`, `test`).

1. **intro** · `title`
   - EN: The desk gets a screen: a Bookings tab, live, whose buttons are the same Actions.
   - PT: O balcão ganha uma tela: uma aba de reservas, ao vivo, com botões que são as mesmas
     Actions.
2. **pain** · `card` "A second home for the rules" (an endpoint per screen; polling)
   - EN: A screen usually means an endpoint, a frontend that repeats the server, and a timer that
     polls.
   - PT: Uma tela costuma ser um endpoint, um frontend que repete o servidor, e um timer
     perguntando.
3. **problem** · `card` "As its reader" (what the reader may see; live; the same Actions)
   - EN: The page should read as its reader, follow every change, and never read what it can't:
     `slot_taken`.
   - PT: A página deve ler como quem lê, seguir cada mudança, e nunca ler o que não pode: o
     `slot_taken`.
4. **solution** · `type plugins/bookings/queries.ts`
   - EN: Two named queries, run on the server as the reader. One read, for every medium.
   - PT: Duas queries nomeadas, no servidor, como quem lê. Uma leitura pra todo meio.
5. **solution** · `type plugins/bookings/web.tsx`, then `front.ts`, `browser.tsx`, `server.ts`
   - EN: The View reads in its own body and hands a React component the result. One `spaceTabs`
     entry puts the tab on the desk, and its Book is where the page is: the desk.
   - PT: A View lê no próprio corpo e entrega o resultado a um componente React. Uma entrada em
     `spaceTabs` põe a aba no balcão, e o Reservar dela é onde a página está: o balcão.
6. **check** · `browser`: sign in as `sam`, Bookings tab, Book Tue 10:00
   - EN: Sign in as Sam, open Bookings, press Book. The tab redraws, with no reload.
   - PT: Entre como Sam, abra Reservas, aperte Reservar. A aba se redesenha, sem recarregar.
7. **check** · `run npm test`
   - EN: The test presses the same buttons, and a customer books elsewhere: the tab follows.
   - PT: O teste aperta os mesmos botões, e um cliente reserva em outro lugar: a aba acompanha.
8. **unlocks** · `card` "What this unlocks" (a View per medium; live by default; no second home)
   - EN: Text for models, React for people, the same reads under both.
   - PT: Texto pra modelos, React pra pessoas, as mesmas leituras por baixo.
9. **challenge** · `card` "Your challenge" (two windows; link to the chat; next: an agent)
   - EN: Open two windows and book in one. Next: the salon's own agent.
   - PT: Abra duas janelas e reserve numa. Próximo: o agente do salão.

## 4 · Its own agent · Um agente só seu

Chapter 4 (`04-its-own-agent.md`), tag `chapter-4`. Files: `app.ts` (the concierge, `Settings`),
`plugins/bookings/tools.ts` and `terminal.ts` (new), `views.ts` (`tool:` Views), `mod.ts`,
`contract.ts`, `server.ts`, `terminal.ts`, `tests/kit.ts` (`scripted`), `tests/agent.test.ts` (a
staff-only tool, last), `package.json` (`terminal`).

1. **intro** · `title`
   - EN: The salon gets an agent, the concierge, and it books with the customer's limits, not the
     database's.
   - PT: O salão ganha um agente, o concierge, que reserva com os limites do cliente, não do banco.
2. **pain** · `card` "A bot with a master key"
   - EN: A bot with a service account cancels anyone's booking, if it's asked nicely.
   - PT: Um bot com conta de serviço cancela a reserva de qualquer um, se pedirem com jeito.
3. **problem** · `card` "For someone" (reach what they reach; the same Actions; short text)
   - EN: The agent acts for the person it talks with. And a model reads differently: short lines,
     with ids.
   - PT: O agente age pela pessoa com quem fala. E um modelo lê diferente: linhas curtas, com ids.
4. **solution** · `type app.ts` (agent, model alias)
   - EN: The concierge: instructions, a model by its alias, four tools.
   - PT: O concierge: instruções, um modelo pelo apelido, quatro ferramentas.
5. **solution** · `type plugins/bookings/tools.ts`, then `views.ts`
   - EN: Each tool calls an Action, as the agent for its customer. After each one, the model reads
     its View.
   - PT: Cada ferramenta chama uma Action, como o agente pelo cliente. Depois de cada uma, o modelo
     lê a View dela.
6. **solution** · `type tests/kit.ts` (`scripted`), then `tests/agent.test.ts`
   - EN: A scripted model plays the agent's moves. Told to cancel Bia's slot, Caio's concierge can't
     find it. Given a staff-only tool, it's refused in Bia's chat, and runs for Sam.
   - PT: Um modelo roteirizado faz os lances do agente. Mandado cancelar o horário da Bia, o
     concierge do Caio não acha. Com uma ferramenta só da equipe, ele é recusado na conversa da Bia,
     e roda pro Sam.
7. **check** · `run npm run terminal`: "Book Thursday 9 for Rui", then `/bookings`
   - EN: In the terminal, with a real model: it lists, it books, and `/bookings` shows Rui.
   - PT: No terminal, com um modelo de verdade: lista, reserva, e o `/bookings` mostra o Rui.
8. **unlocks** · `card` "What this unlocks" (tool, Action, the world; the customer's limits; tests
   without a model)
   - EN: Tell the agent anything: it reaches what its customer reaches, calls only what they may,
     and the record says for whom.
   - PT: Diga qualquer coisa ao agente: ele alcança o que o cliente alcança, só chama o que ele
     pode, e o registro diz por quem.
9. **challenge** · `card` "Your challenge" (`next_free`; next: MCP)
   - EN: Give it a `next_free` tool. Next: the same tools, for ChatGPT, Claude and Gemini.
   - PT: Dê a ele uma ferramenta `next_free`. Próximo: as mesmas ferramentas, pro ChatGPT, Claude e
     Gemini.

## 5 · ChatGPT, Claude and Gemini, over MCP · ChatGPT, Claude e Gemini, por MCP

Chapter 5 (`05-chatgpt-claude-and-gemini-over-mcp.md`), tag `chapter-5`. Files: `app.ts` (`mcp`,
`links`), `server.ts`, `terminal.ts`, `tests/kit.ts` (`LINKS`), `tests/ways.ts` (new),
`tests/mcp.test.ts`, `.env.example`.

1. **intro** · `title`
   - EN: Customers ask ChatGPT, Claude and Gemini. The salon answers there too, with the same tools.
   - PT: Os clientes perguntam ao ChatGPT, ao Claude e ao Gemini. O salão responde lá também, com as
     mesmas ferramentas.
2. **pain** · `card` "An integration per assistant"
   - EN: A separate integration per assistant is a third copy of the booking logic.
   - PT: Uma integração por assistente é uma terceira cópia da lógica de reservas.
3. **problem** · `card` "Strangers, safely" (the same tools; its own bookings; the desk sees)
   - EN: The same tools, the same rules, each conversation with its own bookings only.
   - PT: As mesmas ferramentas, as mesmas regras, cada conversa só com as suas reservas.
4. **solution** · `type app.ts` (`mcp.salon`, `links`)
   - EN: A few lines of settings: a server at `/mcp/salon`, its space, the tools it offers, each
     with its View, or the app won't start.
   - PT: Umas linhas de configuração: um servidor em `/mcp/salon`, o space, as ferramentas que
     oferece, cada uma com a sua View, ou o app não sobe.
5. **solution** · `card` "A conversation is a contact" (no sign-in yet; handles; "for Assistant")
   - EN: There's no MCP sign-in yet, so each conversation is a contact, and the desk says "for
     Assistant". Honest, and safe.
   - PT: Ainda não há login por MCP, então cada conversa é um contato, e o balcão diz "for
     Assistant". Honesto, e seguro.
6. **solution** · `card` "Connecting" (Claude Code; ChatGPT through a tunnel; Gemini's limits)
   - EN: Claude Code takes the local address. ChatGPT needs a tunnel. Gemini takes it in English,
     with Keep Activity on, and confirms every write.
   - PT: O Claude Code aceita o endereço local. O ChatGPT precisa de um túnel. O Gemini aceita em
     inglês, com a Atividade ligada, e confirma cada escrita.
7. **check** · `run curl` (book, a new conversation's cancel, `my_bookings` with the handle) beside
   `browser` (the desk's tab)
   - EN: Book with curl, and watch Sam's tab. Another conversation can't cancel it.
   - PT: Reserve com curl, e veja a aba do Sam. Outra conversa não consegue cancelar.
8. **unlocks** · `card` "What this unlocks" (presence in assistants; strangers, safely; honest about
   who)
   - EN: Presence in the assistants, from the same code, under the same rules.
   - PT: Presença nos assistentes, com o mesmo código, sob as mesmas regras.
9. **challenge** · `card` "Your challenge" (Claude Code books Friday; next: every way in)
   - EN: Connect Claude Code and book Friday with the desk open. Next: every way in, at once.
   - PT: Conecte o Claude Code e reserve sexta com o balcão aberto. Próximo: todas as entradas de
     uma vez.

## 6 · The same bookings, every way in · As mesmas reservas, por toda entrada

Chapter 6 (`06-the-same-bookings-every-way-in.md`), tag `chapter-6`. Files:
`tests/every-way-in.test.ts` and `scripts/tour.ts` (new), `tests/kit.ts` (`bookedBy`),
`package.json` (`tour`).

1. **intro** · `title`
   - EN: The payoff: one test, three ways in, one desk, one record.
   - PT: A recompensa: um teste, três entradas, um balcão, um registro.
2. **pain** · `card` "Several apps, one database"
   - EN: Each way in passed its own tests. Nobody can show the rules hold at all of them.
   - PT: Cada entrada passou nos seus testes. Ninguém mostra que as regras valem em todas.
3. **problem** · `card` "One test" (every change seen; who, for whom; refused everywhere)
   - EN: One test, every way in, three checks: live, recorded, refused.
   - PT: Um teste, toda entrada, três conferências: ao vivo, registrado, recusado.
4. **solution** · `type tests/every-way-in.test.ts` (the first test)
   - EN: Sam's tab stays open. The page, the agent and an assistant book. The tab follows each.
   - PT: A aba do Sam fica aberta. A página, o agente e um assistente reservam. A aba acompanha cada
     uma.
5. **solution** · `type tests/kit.ts` (`bookedBy`), then the second test
   - EN: The record says who, and for whom. Then every door tries Bia's booking, and every door
     refuses.
   - PT: O registro diz quem, e por quem. Depois toda porta tenta a reserva da Bia, e toda porta
     recusa.
6. **check** · `run node --test tests/every-way-in.test.ts`
   - EN: Two tests, about a second, offline.
   - PT: Dois testes, cerca de um segundo, offline.
7. **check** · `run npm run tour`
   - EN: The tour, with a real model: what each said, what the desk sees, and the record.
   - PT: O tour, com um modelo de verdade: o que cada um disse, o que o balcão vê, e o registro.
8. **unlocks** · `card` "What this unlocks" (one app, for people and for AI; proof; an audit trail)
   - EN: One app, for people and for AI. Proven, not hoped.
   - PT: Um app, pra pessoas e pra IA. Provado, não esperado.
9. **challenge** · `card` "Your challenge" (`cancelledBy`; next: the widget)
   - EN: Have Sam cancel the assistant's booking, and read who did it. Next: three more ways in, and
     the app doesn't change.
   - PT: Faça o Sam cancelar a reserva do assistente, e leia quem fez. Próximo: mais três entradas,
     e o app não muda.

## 7 · A widget in the assistant · Um widget no assistente

Chapter 7 (`07-a-widget-in-the-assistant.md`), tag `chapter-7`. Files: `widget.tsx` (new),
`plugins/bookings/web.tsx` (`bookingsWidget`), `app.ts` (`widgets`, the server's tools),
`server.ts`, `tests/kit.ts` (`widgets`), `tests/mcp.test.ts`, `tests/every-way-in.test.ts`.

1. **intro** · `title`
   - EN: The desk's screen, drawn inside ChatGPT and Claude, under the answer that booked.
   - PT: A tela do balcão, desenhada dentro do ChatGPT e do Claude, embaixo da resposta que
     reservou.
2. **pain** · `card` "A second frontend"
   - EN: A widget usually means a second frontend, with its own calls and its own idea of the user.
   - PT: Um widget costuma ser um segundo frontend, com chamadas próprias e uma ideia própria do
     usuário.
3. **problem** · `card` "The same View, the person's buttons" (as the customer; same Actions; not
   the model's)
   - EN: Draw the View you have, as the conversation's customer. Its buttons are theirs, not the
     model's.
   - PT: Desenhe a View que você já tem, como o cliente da conversa. Os botões são dele, não do
     modelo.
4. **solution** · `type plugins/bookings/web.tsx` (`bookingsWidget`), then `widget.tsx`
   - EN: A third View, the same `salon()`: the item is the call, the chat is the conversation's.
   - PT: Uma terceira View, o mesmo `salon()`: o item é a chamada, a conversa é a do assistente.
5. **solution** · `type app.ts` (`widget`, `{ action }` entries), then `server.ts`
   - EN: Which tools draw it, and which Actions its buttons call, each with a grant.
   - PT: Quais ferramentas desenham, e quais Actions os botões chamam, cada uma com uma permissão.
6. **solution** · `card` "Answered ahead" (reads in the View's body; nothing pushed;
   `copilotz_read`)
   - EN: The answer carries what the View reads, already answered as the customer. That's why it
     reads in its own body.
   - PT: A resposta já leva o que a View lê, respondido como o cliente. Por isso ela lê no próprio
     corpo.
7. **check** · `run` the tool's answer (`_meta`), then `run npm test`
   - EN: The snapshot, the grant, and a forged press refused.
   - PT: O snapshot, a permissão, e um clique forjado recusado.
8. **unlocks** · `card` "What this unlocks" (your screen in the assistant; buttons that are Actions;
   nothing to sync)
   - EN: One View, three places, and the rules come along. Not yet drawn in a real host: said
     plainly.
   - PT: Uma View, três lugares, e as regras vêm junto. Ainda não desenhado num host de verdade:
     dito com todas as letras.
9. **challenge** · `card` "Your challenge" (widget on `cancel_booking`; next: the site)
   - EN: Give `cancel_booking` the widget. Next: a chat on the salon's own site.
   - PT: Dê o widget ao `cancel_booking`. Próximo: um chat no site do salão.

## 8 · A chat on your site · Um chat no seu site

Chapter 8 (`08-a-chat-on-your-site.md`), tag `chapter-8`. Files: `plugins/site/web.tsx` (new),
`plugins/bookings/web.tsx` (`bookings.panel`), `app.ts` (`webLines`, `web`), `front.ts` (`site`),
`browser.tsx`, `server.ts`, `tests/ways.ts` (`visitor`), `tests/site.test.ts` (new),
`tests/every-way-in.test.ts`, `scripts/tour.ts`.

1. **intro** · `title`
   - EN: Anyone who opens the salon's site can chat with the concierge, and book beside the chat.
   - PT: Quem abrir o site do salão conversa com o concierge, e reserva do lado da conversa.
2. **pain** · `card` "A vendor's widget, a form"
   - EN: A vendor's chat knows nothing of your bookings, and a form knows nothing of the chat.
   - PT: O chat de um fornecedor não sabe das suas reservas, e um formulário não sabe do chat.
3. **problem** · `card` "A stranger, a customer" (no account; their own chat; the desk sees)
   - EN: The first message makes a visitor a customer, with a chat of their own and nothing else.
   - PT: A primeira mensagem faz do visitante um cliente, com uma conversa só dele e nada mais.
4. **solution** · `type app.ts` (`web.site`)
   - EN: One setting declares the site's chat: its space, its agent, what its chats are called.
   - PT: Uma configuração declara o chat do site: o space, o agente, o nome das conversas.
5. **solution** · `type plugins/site/web.tsx`, then `front.ts`, `browser.tsx`
   - EN: The web shell doesn't draw a visitor's page yet, so the salon draws its own: the chat
     beside the panel.
   - PT: O shell da web ainda não desenha a página de um visitante, então o salão desenha a sua: o
     chat do lado do painel.
6. **check** · `browser`: a visitor's two messages, Book beside Fri 14:00
   - EN: Ask, book by hand, ask again: the concierge sees what the panel did.
   - PT: Pergunte, reserve na mão, pergunte de novo: o concierge vê o que o painel fez.
7. **check** · `run npm test`
   - EN: The test is a browser: it comes in, keeps its cookie, and draws the page as the visitor.
   - PT: O teste é um navegador: entra, guarda o cookie, e desenha a página como o visitante.
8. **unlocks** · `card` "What this unlocks" (your site, open to anyone; chat and buttons together;
   the same View)
   - EN: Open to anyone, and still each visitor reaches only their own.
   - PT: Aberto pra qualquer um, e cada visitante só alcança o seu.
9. **challenge** · `card` "Your challenge" (a New chat button; next: WhatsApp)
   - EN: Add a New chat button, and see what the panel shows. Next: WhatsApp.
   - PT: Adicione um botão de Nova conversa, e veja o que o painel mostra. Próximo: WhatsApp.

## 9 · WhatsApp · WhatsApp

Chapter 9 (`09-whatsapp.md`), tag `chapter-9`. Files: `app.ts` (`whatsapp`), `server.ts`,
`tests/kit.ts` (`fetch`), `tests/ways.ts` (`graph`, `whatsapp`), `tests/whatsapp.test.ts` (new),
`tests/every-way-in.test.ts`, `scripts/tour.ts`, `.env.example`.

1. **intro** · `title`
   - EN: Customers write to the salon's number, and the concierge books for them.
   - PT: Os clientes escrevem pro número do salão, e o concierge reserva pra eles.
2. **pain** · `card` "A bot of its own"
   - EN: A WhatsApp bot is usually its own server, its own sessions, and the booking logic again.
   - PT: Um bot de WhatsApp costuma ser um servidor próprio, sessões próprias, e a lógica de
     reservas de novo.
3. **problem** · `card` "Meta on both ends" (anyone a customer; signed deliveries; offline tests)
   - EN: Anyone who writes is a customer. Deliveries are checked as Meta's. And tests play Meta on
     both ends.
   - PT: Quem escreve é cliente. As entregas são conferidas como da Meta. E os testes fazem a Meta
     dos dois lados.
4. **solution** · `type app.ts` (the number), then `server.ts`
   - EN: A setting and a plugin. The bookings plugin doesn't know WhatsApp exists.
   - PT: Uma configuração e um plugin. O plugin de reservas nem sabe que o WhatsApp existe.
5. **solution** · `type tests/ways.ts` (`graph`, `whatsapp`), then `tests/whatsapp.test.ts`
   - EN: Meta's webhook, signed, in. Meta's API, a fake `fetch`, out. No network.
   - PT: O webhook da Meta, assinado, entrando. A API da Meta, um `fetch` falso, saindo. Sem rede.
6. **check** · `run npm run tour`
   - EN: Five ways in, one desk, one record, with a real model.
   - PT: Cinco entradas, um balcão, um registro, com um modelo de verdade.
7. **check** · `run curl` (the webhook check, an unsigned post)
   - EN: The server answers Meta's check, and refuses what Meta didn't sign.
   - PT: O servidor responde à verificação da Meta, e recusa o que a Meta não assinou.
8. **unlocks** · `card` "What this unlocks" (WhatsApp without booking code; tested offline; one
   desk)
   - EN: The hardest way in, tested offline, and no booking code of its own.
   - PT: A entrada mais difícil, testada offline, e sem código de reserva próprio.
9. **challenge** · `card` "Your challenge" (a delivery sent twice; next: online)
   - EN: Send the same message twice, as Meta sometimes does. Next: the salon goes online.
   - PT: Mande a mesma mensagem duas vezes, como a Meta às vezes faz. Próximo: o salão vai pro ar.
