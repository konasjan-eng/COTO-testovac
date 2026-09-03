# Trvalé instrukce pro projekt COTO

- Veškerá komunikace s uživatelem musí být výhradně česky.
- Také názvy commitů, názvy a popisy pull requestů, souhrny změn a komentáře na GitHubu piš česky, pokud technické rozhraní nevyžaduje jinak.
- Uživatel zadává požadavky běžným jazykem a není programátor. Nepřenášej na něj technická rozhodnutí, která můžeš bezpečně vyřešit sám.
- Zachovávej existující funkce, vzhled a data, pokud zadání výslovně neříká jinak.
- Před změnou si přečti `docs/KONTEXT-COTO.md`.
- Po změně spusť příslušný build nebo test.
- Slovo `nasaď` znamená: dokonči požadovanou změnu, ověř build a testy, commitni změny, připrav nebo vytvoř pull request do `main` a nech existující GitHub automatiku zajistit kontrolu, sloučení a nasazení.
- Pokud test selže, nenasazuj a česky vysvětli příčinu.

## Git workflow
- Nikdy necommituj přímo do `main`. Vytvoř větev `codex/<kratky-popis>`.
- **Před prvním pushem vždy spusť `git ensure-origin`** — pracovní kopie
  v Codexu startuje bez remote `origin`. Když push selže na chybějící
  remote, není to chyba oprávnění: doplň remote a zkus to znovu.
- Push:  `git push -u origin HEAD`
- PR:    `gh pr create --base main --fill`
- CI:    `gh pr checks --watch`
- `gh` je v prostředí přihlášené, token nikam nepředávej.
