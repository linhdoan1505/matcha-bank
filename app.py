import os

from flask import Flask, render_template

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/studio")
def studio():
    return render_template("studio.html")


@app.route("/gallery")
def gallery():
    return render_template("gallery.html")


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", "1") == "1")
