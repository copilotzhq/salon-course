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
