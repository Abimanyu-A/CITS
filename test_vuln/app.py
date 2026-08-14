from flask import Flask, request
import sqlite3

app = Flask(__name__)


@app.route("/lookup")
def lookup():
    username = request.args.get("username")
    conn = sqlite3.connect("app.db")
    cur = conn.cursor()
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cur.execute(query)
    return str(cur.fetchall())


if __name__ == "__main__":
    app.run()