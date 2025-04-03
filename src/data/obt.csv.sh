git clone https://gist.github.com/908d9834c9400b24037670d4b23364cc.git src/.observablehq/cache/obt-data || true

find src/.observablehq/cache/obt-data -type f -exec stat --format="%n" {} \;
