# 🍵 Matcha Bar Studio

welcome to your lil corner of the internet where matcha is a personality trait and every drink is a whole *mood*. build your own matcha, mix in the syrups + toppings, flex your recipe in the gallery. that's the app. that's the whole vibe. 🎀

## the tea (well, matcha)

- 🧪 **Studio** — drag ingredients into your cup and watch your drink come together IRL (well, on screen)
- 📊 **Drink Profile** — sweetness, caffeine, earthiness meters bc balance is everything
- 🖼️ **Gallery** — save your creations, remix your besties' recipes, get your flowers (♥s)
- 🌸 built with Flask bc even the backend deserves to be cute

## local setup

1. create and activate your virtual environment

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```

2. install dependencies

    ```bash
    pip install -r requirements.txt
    ```

3. create your local environment file from the example

    ```bash
    cp .env.example .env
    ```

4. update `.env` with your own Google OAuth values if you want sign-in enabled

5. start the app

    ```bash
    python app.py
    ```

then pull up `http://127.0.0.1:5000` and start mixing 🧋

## environment variables

- `SECRET_KEY` — required for Flask sessions and should be unique in local/dev/prod
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional for Google login
- `DATABASE_URL` — optional; defaults to a local SQLite file in `instance/matcha.db`

keep `.env` local and do not commit it.

## the stack

python + flask on the backend, vanilla html/css/js on the front — no bloat, just vibes ✨

```
app.py            # the whole vibe curator (routes)
templates/        # the pages
static/css/       # the aesthetic
static/js/        # the sparkle (interactivity)
.env.example      # copy → .env, keep your secrets... secret 🤫
```

## contributing

got a fire recipe idea or a bug that's giving "not it"? open a PR. be nice, be cute, ship good code 💚
