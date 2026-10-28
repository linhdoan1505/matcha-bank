# Matcha Bar Studio — AI Agent Instructions

**Project**: A Flask-based matcha recipe builder with social gallery and multi-provider authentication.

## Architecture Overview

The app follows a classic monolithic Flask pattern with three main layers:

- **Backend** (`app.py`): Flask server with ~10 routes for auth (email/Google/Apple OAuth), recipe management, and page rendering
- **Database** (`models.py`): SQLAlchemy ORM with two core entities: `User` (with multi-provider support) and `SavedRecipe` (JSON-serialized ingredients)
- **Extensions** (`extensions.py`): Centralized Flask extension setup (SQLAlchemy, Flask-Login, OAuth via Authlib)
- **Frontend** (`templates/`, `static/`): Vanilla HTML/CSS/JS with no build step (Jinja2 templates, no framework)

## Critical Architecture Decisions

### Multi-Provider Authentication Pattern
The app uses **Authlib** for OAuth (Google/Apple) + local email/password:
- **Google**: Standard OIDC flow → extract user info from token
- **Apple**: Custom JWT-based client secret (see `auth_utils.py`) + Apple's form_post response mode
- **Email/password**: Direct credential validation with werkzeug's password hashing
- All flows converge on `User` model with `provider` field to avoid duplicate accounts per auth method

**Key file**: [app.py](../app.py) lines 46-205 (login routes); [auth_utils.py](../auth_utils.py) for Apple JWT generation

### Data Model: JSON Serialization for Ingredients
Recipes store ingredient metadata as JSON string in `SavedRecipe.ingredients_json` rather than a separate ingredients table. This keeps the schema simple for MVP but risks N+1 queries on gallery views.

**File**: [models.py](../models.py#L22-L31)

### Frontend State Management
Frontend is vanilla JS—no state library. Component state is stored as data attributes on DOM elements or passed via template context from Flask. Recipe data flows: form → JavaScript validation → POST `/api/recipes` → Flask model → DB.

**Key files**: [templates/studio.html](../templates/studio.html), [static/js/script.js](../static/js/script.js)

## Critical Workflows

### Local Development Setup
```bash
python3 -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
export FLASK_DEBUG=1  # optional, defaults to 1
python app.py
```
App runs at `http://127.0.0.1:5000`. SQLite database auto-creates in `instance/matcha.db`.

### Environment Configuration
Copy `.env.example` → `.env`. Required for OAuth:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional—app degrades gracefully)
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (optional)
- `SECRET_KEY`, `DATABASE_URL` (defaults to SQLite)

OAuth providers are checked at startup via `google_configured()` and `apple_configured()` helpers; template context gets flags to show/hide buttons.

### Debugging Authentication Issues
- **Email/password failures**: Check werkzeug hash validation in [app.py](../app.py#L128-L136)
- **Google OAuth fails**: Verify client ID/secret in Google Cloud Console; check `server_metadata_url` OIDC discovery
- **Apple OAuth fails**: Validate JWT generation in [auth_utils.py](../auth_utils.py#L5-L17); Apple's `form_post` response mode requires POST endpoint with `request.form.get("code")` and optional `request.form.get("user")` (name info sent only on first auth)

### Common Tasks

| Task | Location |
|------|----------|
| Add new route | [app.py](../app.py) with `@app.route()` decorator |
| Update User schema | [models.py](../models.py#L4-L18); run `db.create_all()` on first boot |
| Add new ingredient/profile metric | Extend `SavedRecipe` model; update frontend form in `studio.html` |
| Style changes | [static/css/style.css](../static/css/style.css) |
| Template updates | [templates/](../templates/) (Jinja2 syntax; context vars injected by Flask routes) |

## Project-Specific Conventions

### Recipe Storage Convention
Ingredient objects use this schema (validated on frontend, but not enforced in backend):
```javascript
{ name: string, category: string, quantity?: number }
```
Stored as `json.dumps()` in database; deserialized in [app.py](../app.py#L216) as `json.loads(r.ingredients_json)`.

### URL Safety Pattern
The `safe_next()` helper in [app.py](../app.py#L54-58) validates redirect URLs to prevent open redirect attacks. Always use it for post-auth redirects.

### Blueprint vs. Routes Pattern
App uses flat route registration (not blueprints), which is fine for this size (~300 LOC). If it grows, consider refactoring into blueprints (auth, recipes, pages).

## Dependencies & Versions

| Dependency | Version | Purpose |
|------------|---------|---------|
| Flask | 3.1.0 | Web framework |
| Flask-SQLAlchemy | 3.1.1 | ORM |
| Flask-Login | 0.6.3 | Session management |
| Authlib | 1.3.2 | OAuth2 client |
| PyJWT + cryptography | 2.9.0 + 43.0.3 | Apple client secret signing (ES256) |
| python-dotenv | 1.0.1 | Environment config |

**Key integration point**: Authlib's Flask client at [extensions.py](../extensions.py)—all OAuth config happens here.

## Testing & Validation

- No automated tests in codebase yet (manual QA only)
- Password validation: minimum 8 characters (enforced at signup)
- Recipe validation: at least 1 ingredient required before saving
- OAuth error handling: graceful degradation if provider env vars missing

## Common Pitfalls & Gotchas

1. **Apple Sign In name handling**: Apple only sends user name on *first* authorization. Store it immediately in your User record; subsequent logins won't refresh it.
2. **Email normalization**: All emails are `.lower()`-ed on auth to prevent duplicate accounts (email@example.com ≠ Email@Example.com).
3. **Recipe ownership**: Always check `recipe.user_id == current_user.id` before delete/update to prevent cross-user access.
4. **Debugging OAuth locally**: Use `http://127.0.0.1:5000` (not `localhost`); OAuth providers may reject mismatched redirect URIs.

## AI Agent Quick Starts

**For new routes**: Use the pattern in [app.py](../app.py) lines 73–88 (studio/gallery); remember `@login_required` for protected routes and `url_for("route_name")` for links.

**For database changes**: Modify [models.py](../models.py), then rely on `db.create_all()` called at app startup (line 290 in app.py).

**For OAuth issues**: Check `google_configured()`/`apple_configured()` flags first, then trace token extraction in the callback routes.
