# The salon, the course

One app, for people and for AI. In this course you build a salon's bookings on
[Copilotz](https://github.com/copilotzhq/copilotz): the desk books on its own web page, the salon's
agent books in a chat, and ChatGPT, Claude and Gemini book over MCP. Then a widget in the
assistant, a chat on the salon's site and WhatsApp. Every way in calls the same Actions, under the
same rules, and the record says who did what, for whom.

Each chapter is a tag (`chapter-1`, `chapter-2`…). To start a chapter where the last one ended:

```sh
git clone https://github.com/copilotzhq/salon-course && cd salon-course
git switch -c my-chapter-2 chapter-1
npm ci
```

Node 24 or newer. `OPENAI_API_KEY` in `.env` (see `.env.example`) puts the salon's agent on
OpenAI; without it, agents answer with Copilotz's offline fake model, and every test runs without
a key.

The chapters' text is in `.course/docs/getting-started/`.
