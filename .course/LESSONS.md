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
