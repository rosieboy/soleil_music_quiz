# Egen Fredagslåten på Netlify

Den här versionen använder grenen `codex/netlify-own-quiz` i
`rosieboy/soleil_music_quiz`. Kollegans Vercel-app och PR-grenen
`codex/quiz-ui-and-presentation` är separata. Netlify-adaptern 6 stöder Astro 5.

## 1. Skapa en egen Turso-databas

Logga in på https://app.turso.tech och skapa en ny, tom databas.
Kopiera databasens `libsql://...`-adress och skapa en åtkomsttoken för just den
databasen. Använd egna uppgifter, aldrig kollegans produktionsdatabas.

## 2. Förbered databasen en gång

Använd Node.js 22.13 eller senare. Kör `npm ci` i projektmappen.
Kopiera `.env.example` till `.env` och fyll i databasens URL och token.
Generera en privat inloggningsnyckel med `openssl rand -base64 32` och spara den
som `BETTER_AUTH_SECRET` i `.env`. Dela inte nyckeln i chatten eller på GitHub.

Kör sedan:

```sh
npm run db:init
```

Detta skapar alla tabeller i en tom databas, inklusive autentisering och quiz.
Kommandot vägrar ändra en databas som redan innehåller tabeller. Det är ett
engångssteg och ska inte köras i Netlifys byggkommando. Inga demokonton skapas.

## 3. Koppla Netlify till rätt gren

Importera `rosieboy/soleil_music_quiz` i Netlify. Välj
`codex/netlify-own-quiz` som **Production branch**.

- Base directory: projektets rot (lämna tomt).
- Build command: `npm run build`.
- Publish directory: `dist`.
- Node.js: 22 (finns i `netlify.toml`).

Välj sajtens namn innan du fyller i webbadresserna nedan. Använd ett separat
Netlify-projekt. Du behöver inte ändra forkens standardgren.

## 4. Lägg in miljövariabler i Netlify

Lägg värdena i **Project configuration → Environment variables**, tillgängliga
i **Production**-kontexten. På Pro kan de begränsas till **Builds** och
**Functions**. Gratisplanen använder alla scopes; välj den lösningen först efter
att du godkänt den bredare åtkomsten. Secrets Controller kan ställa ytterligare
krav på scopes. Byt inte plan automatiskt:

| Variabel | Värde |
| --- | --- |
| `TURSO_DATABASE_URL` | Din egen `libsql://...`-adress |
| `TURSO_AUTH_TOKEN` | Token för din egen databas |
| `BETTER_AUTH_SECRET` | Den privata, slumpgenererade nyckeln |
| `BETTER_AUTH_URL` | Din fullständiga `https://...netlify.app`-adress |
| `PUBLIC_APP_URL` | Samma adress, utan avslutande snedstreck |

De tre första värdena ska aldrig checkas in. `.env` och `.netlify` ignoreras av Git.
`PUBLIC_APP_URL` byggs in i klientkoden; en ändring kräver en ny deploy.
Byter du domän uppdaterar du båda URL-värdena och bygger om.

Stäng av automatiska deploy previews och branch deploys för detta projekt tills
de har en egen testdatabas och egen URL-konfiguration. Produktionsdatabasen och
inloggningsnyckeln ska inte delas med förhandsbyggen från andra grenar.

## 5. Deploya och kontrollera

Starta en produktionsdeploy efter att databasen och alla variabler är klara.
Astro-adaptern bygger serverfunktionerna; det här är inte en statisk webbplats
som kan publiceras genom att bara dra och släppa `dist`.

Skapa sedan ditt eget konto i appen. Kontrollera att du kan logga in, skapa ett
quiz, lämna en låt, gissa och presentera resultat. Kollegans användare och quiz
följer inte med till den nya databasen.

## Lokal granskning

För den fiktiva demon: följ README:s `demo:seed`-instruktioner och använd den
lokala filen `.astro/ui-demo.db`. Publicera inte demodatabasen eller demokontona.

Dokumentation: https://docs.astro.build/en/guides/deploy/netlify/
och https://docs.turso.tech/quickstart
