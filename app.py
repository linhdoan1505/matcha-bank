import json
import os

from dotenv import load_dotenv
from flask import Flask, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user

from extensions import db, login_manager, oauth
from models import SavedRecipe, User

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///" + os.path.join(app.instance_path, "matcha.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

os.makedirs(app.instance_path, exist_ok=True)

db.init_app(app)
login_manager.init_app(app)
oauth.init_app(app)

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

def google_configured():
    return bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)


def safe_next(target):
    if target and target.startswith("/") and not target.startswith("//"):
        return target
    return None


@app.context_processor
def inject_oauth_flags():
    return {"google_enabled": google_configured()}


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith("/api/"):
        return {"error": "Login required."}, 401
    return redirect(url_for("login", next=request.path))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/studio")
def studio():
    return render_template("studio.html")


@app.route("/gallery")
def gallery():
    return render_template("gallery.html")


# ---- Email / password auth ----
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for("profile"))
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not name or not email or len(password) < 8:
            flash("Please fill in your name, a valid email, and a password of at least 8 characters.", "error")
            return render_template("signup.html", name=name, email=email)

        if User.query.filter_by(email=email).first():
            flash("An account with that email already exists — try logging in instead.", "error")
            return render_template("signup.html", name=name, email=email)

        user = User(name=name, email=email, provider="email")
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect(safe_next(request.args.get("next")) or url_for("profile"))

    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("profile"))
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            flash("That email and password combination doesn't match an account.", "error")
            return render_template("login.html", email=email)

        login_user(user)
        return redirect(safe_next(request.args.get("next")) or url_for("profile"))

    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


# ---- Google OAuth ----
@app.route("/login/google")
def login_google():
    if not google_configured():
        flash("Sign in with Google isn't configured on this deployment yet.", "error")
        return redirect(url_for("login"))
    redirect_uri = url_for("auth_google_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@app.route("/auth/google/callback")
def auth_google_callback():
    token = oauth.google.authorize_access_token()
    userinfo = token.get("userinfo") or oauth.google.parse_id_token(token)

    email = (userinfo.get("email") or "").lower()
    if not email:
        flash("Google didn't share an email address, so we couldn't sign you in.", "error")
        return redirect(url_for("login"))

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            email=email,
            name=userinfo.get("name") or email.split("@")[0],
            avatar_url=userinfo.get("picture"),
            provider="google",
            provider_id=userinfo.get("sub"),
        )
        db.session.add(user)
        db.session.commit()

    login_user(user)
    return redirect(url_for("profile"))


# ---- Profile & saved recipes ----
@app.route("/profile")
@login_required
def profile():
    recipes = [
        {**r.__dict__, "ingredients": json.loads(r.ingredients_json)} for r in current_user.recipes
    ]
    return render_template("profile.html", recipes=recipes)


@app.route("/api/recipes", methods=["POST"])
@login_required
def save_recipe():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "My Matcha Creation").strip()[:120]
    ingredients = data.get("ingredients") or []
    if not ingredients:
        return {"error": "Add at least one ingredient before saving."}, 400

    recipe = SavedRecipe(
        user_id=current_user.id,
        name=name,
        ingredients_json=json.dumps(ingredients),
        sweetness=data.get("sweetness", 0),
        caffeine=data.get("caffeine", 0),
        earthiness=data.get("earthiness", 0),
    )
    db.session.add(recipe)
    db.session.commit()
    return {"ok": True, "id": recipe.id}


@app.route("/api/recipes/<int:recipe_id>", methods=["DELETE"])
@login_required
def delete_recipe(recipe_id):
    recipe = db.session.get(SavedRecipe, recipe_id)
    if not recipe or recipe.user_id != current_user.id:
        return {"error": "Recipe not found."}, 404
    db.session.delete(recipe)
    db.session.commit()
    return {"ok": True}


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "1") == "1")
