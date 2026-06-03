"""Apply a SQL file through `supabase db query` one statement at a time."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def split_sql(sql: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    single_quote = False
    double_quote = False
    dollar_quote = ""
    i = 0

    while i < len(sql):
        ch = sql[i]
        nxt = sql[i + 1] if i + 1 < len(sql) else ""

        if dollar_quote:
            current.append(ch)
            if sql.startswith(dollar_quote, i):
                current.extend(sql[i + 1 : i + len(dollar_quote)])
                i += len(dollar_quote)
                dollar_quote = ""
                continue
            i += 1
            continue

        if single_quote:
            current.append(ch)
            if ch == "'" and nxt == "'":
                current.append(nxt)
                i += 2
                continue
            if ch == "'":
                single_quote = False
            i += 1
            continue

        if double_quote:
            current.append(ch)
            if ch == '"':
                double_quote = False
            i += 1
            continue

        if ch == "-" and nxt == "-":
            while i < len(sql) and sql[i] not in "\r\n":
                current.append(sql[i])
                i += 1
            continue

        if ch == "$":
            end = sql.find("$", i + 1)
            if end != -1:
                tag = sql[i : end + 1]
                if tag == "$$" or (len(tag) > 2 and tag[1:-1].replace("_", "").isalnum()):
                    dollar_quote = tag
                    current.append(tag)
                    i = end + 1
                    continue

        if ch == "'":
            single_quote = True
        elif ch == '"':
            double_quote = True
        elif ch == ";":
            statement = "".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
            i += 1
            continue

        current.append(ch)
        i += 1

    tail = "".join(current).strip()
    if tail:
        statements.append(tail)
    return statements


def preview(statement: str) -> str:
    return " ".join(statement.split())[:100]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python automation/apply_supabase_sql.py <sql-file>", file=sys.stderr)
        return 2

    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url:
        print("SUPABASE_DB_URL is required.", file=sys.stderr)
        return 2

    statements = split_sql(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(f"Applying {len(statements)} SQL statements...")

    for index, statement in enumerate(statements, 1):
        print(f"[{index}/{len(statements)}] {preview(statement)}")
        result = subprocess.run(
            ["npx.cmd", "supabase", "db", "query", "--db-url", db_url],
            input=statement,
            text=True,
            encoding="utf-8",
            capture_output=True,
        )
        if result.returncode != 0:
            sys.stdout.write(result.stdout)
            sys.stderr.write(result.stderr)
            return result.returncode

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
