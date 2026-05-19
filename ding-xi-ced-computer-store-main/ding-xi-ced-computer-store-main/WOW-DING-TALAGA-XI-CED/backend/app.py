from flask import Flask, request, redirect, url_for, session, render_template, jsonify
from flask_bcrypt import Bcrypt, generate_password_hash
from db import get_connection
import mysql.connector
import config
import os

BASE = os.path.dirname(__file__)
TMPL = os.path.join(BASE, "..", "templates")
STAT = os.path.join(BASE, "..", "statistics")

app = Flask(__name__,
    template_folder=TMPL,
    static_folder=STAT,
    static_url_path=""
)
app.secret_key = config.SECRET_KEY
bcrypt = Bcrypt(app)


# ── Helpers 
def logged_in():
    return "user_id" in session


# ── Home 
@app.route("/")
def index():
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM categories ORDER BY name")
    categories = cursor.fetchall()

    cursor.execute("""
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id DESC
    """)
    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template("index.html",
        products=products,
        categories=categories,
        user=session.get("email"),
        logged_in=logged_in()
    )


# ── Register ─────────────────────────────────────────────────────────────────
@app.route("/register", methods=["GET", "POST"])
def register():
    error   = None
    success = None

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email    = request.form.get("email",    "").strip()
        password = request.form.get("password", "").strip()

        if not username or not email or not password:
            error = "All fields are required."

        elif len(password) < 6:
            error = "Password must be at least 6 characters."

        else:
            hashed = generate_password_hash(password).decode("utf-8")
            try:
                conn   = get_connection()
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                    (username, email, hashed)
                )
                conn.commit()
                cursor.close()
                conn.close()
                return render_template("login.html",
                    error=None,
                    success="Account created! You can now login."
                )

            except mysql.connector.errors.IntegrityError:
                error = "Email or username is already registered."

            except mysql.connector.Error as e:
                error = f"Database error: {str(e)}"

    return render_template("register.html", error=error)


# ── Login ─────────────────────────────────────────────────────────────────────
@app.route("/login", methods=["GET", "POST"])
def login():
    if logged_in():
        return redirect(url_for("index"))

    error = None
    if request.method == "POST":
        email    = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()

        if not email or not password:
            error = "All fields are required."
        else:
            conn   = get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            cursor.close()
            conn.close()

            if user and bcrypt.check_password_hash(user["password"], password):
                session["user_id"]  = user["user_id"]
                session["email"]    = user["email"]
                session["username"] = user["username"]
                return redirect(url_for("index"))
            else:
                error = "Invalid email or password."

    return render_template("login.html", error=error)


# ── Logout ────────────────────────────────────────────────────────────────────
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ── Dashboard (protected) ─────────────────────────────────────────────────────
@app.route("/dashboard")
def dashboard():
    if not logged_in():
        return redirect(url_for("login"))
    return redirect(url_for("index"))


# ── Shop Page ────────────────────────────────────────────────────────────────
@app.route("/shop")
def shop():

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c
        ON p.category_id = c.category_id
    """)

    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template(
        "shop.html",
        products=products
    )

#cart 
@app.route("/cart")
def cart():
    return render_template("cart.html",
        user=session.get("email"),
        logged_in=logged_in()
    )

#user profile
@app.route("/user")
def user():
    if not logged_in():
        return redirect(url_for("login"))
    return render_template("user.html",
        user=session.get("email"),
        logged_in=logged_in()
    )


# ── Products API ──────────────────────────────────────────────────────────────
@app.route("/api/products")
def api_products():
    category_id = request.args.get("category_id")
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    if category_id:
        cursor.execute("""
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.category_id = %s
            ORDER BY p.product_id DESC
        """, (category_id,))
    else:
        cursor.execute("""
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.product_id DESC
        """)

    products = cursor.fetchall()
    cursor.close()
    conn.close()

    for p in products:
        if p.get("price"):
            p["price"] = float(p["price"])

    return jsonify(products)


# ── Contact Form ──────────────────────────────────────────────────────────────
@app.route("/contact", methods=["POST"])
def contact():
    name    = request.form.get("name", "").strip()
    email   = request.form.get("email", "").strip()
    message = request.form.get("message", "").strip()
    # TODO: save to DB or send email
    return redirect(url_for("index") + "#contact")


if __name__ == "__main__":
    app.run(debug=True)