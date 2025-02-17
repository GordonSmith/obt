git clone https://gist.github.com/38579c76f1e3efc7f2bb91907ed8bc5d.git src/.observablehq/cache/obt-data || true

find src/.observablehq/cache/obt-data -type f -exec stat --format="%n" {} \;
