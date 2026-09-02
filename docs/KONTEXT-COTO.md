# Trvalý kontext projektu COTO

Tento dokument shrnuje současný stav aplikace a pravidla, která je nutné zachovat při další práci. Podrobné produktové požadavky zůstávají ve `SPECIFIKACE_COTO.md`, stručná závazná paměť v `PROJEKTOVA_PAMET.md` a chronologie změn ve `VYVOJOVY_DENIK.md`.

## Účel COTO

COTO je systém pro spravedlivou výměnu informací mezi množinou správců a účastníků. Jeho základem je TVL: třídílný, tisknutelný nosič komunikace odvozený z původní papírové předlohy. Web nemá TVL zjednodušit na obyčejný formulář, ale digitálně oživit jeho propojené části, společné údaje, kontrolní prvky a návaznost mezi správcem a účastníkem.

Aplikace je nyní funkční prototyp. Neprovádí skutečné hlasování ani platby a nemá připojené trvalé serverové ukládání, bankovní identitu ani skutečné ověření v ARES.

## Role

### Správce

Správce zakládá a připravuje aktivitu. V současné variantě PN vyplní nejvýše tři návrhy nebo otázky, jejich podrobné popisy a každému přidělí vlastní prioritu v hodnotě 1–3 Kč ze svého účtu na propagaci. Tato částka není hlas účastníka. Správce určuje také počáteční pondělí týdne platnosti, kontroluje celý TVL v náhledu a aktivitu potvrzuje. Potvrzenou aktivitu už smí otevřít jen ke čtení a kopírování.

### Účastník

Účastník vybere správce a jeho živou aktivitu, otevře úplné popisy řádků C1–C3 a každému nezávisle přidělí 1–9 bodů. Po odeslání získá časové razítko a osobní kontrolní kód pro pozdější dohledání svého řádku a dopadu názoru. Současný prototyp opakování stejného počtu bodů nezakazuje; konečné pravidlo dosud nebylo schváleno.

## Varianty COTO

COTO počítá se čtyřmi společnými variantami:

- **PN – Průzkum názorů**: první a aktuálně rozpracovaná funkční varianta;
- **PP – Pořadí priorit**: v nabídce je viditelná, ale zatím nepřístupná;
- **DD – Dárce daru**: v nabídce je viditelná, ale zatím nepřístupná;
- **VO – Volba občana**: v nabídce je viditelná, ale zatím nepřístupná.

Další vývoj má zachovat společný systém variant a nesmí odstranit povinný vstupní průchod. Současná práce se soustředí na PN1 – Průzkum návrhů a otázek.

## Navigace aplikací

Povinný začátek tvoří ikona COTO se smajlíkem, samostatné logo COTO a volba role **Správce / Účastník**.

Průchod správce pokračuje takto:

1. interní kontrola IČO správce v kroku ARES;
2. nabídka variant PN, PP, DD a VO;
3. otevření pracovní šablony PN;
4. editace projektů a souběžná kontrola všech tří dílů TVL;
5. náhled celého TVL a vznik časového razítka;
6. případný návrat k opravám, nebo potvrzení PN1;
7. přehled správce se sloupci živých a ukončených průzkumů.

Průchod účastníka vede z volby role na seznam správců, dále na živé aktivity vybraného správce a poté na hodnocení konkrétní PN. Horní přepínač rolí umožňuje v prototypu přecházet mezi pohledem správce a účastníka.

## ARES

ARES je v současnosti pouze interní, zkušební krok navigace správce. Zobrazuje připravené IČO a předává identitu správce do okna A, ale nevolá skutečnou službu ARES. Tento krok je součástí povinného toku a nesmí se přeskočit ani odstranit jen proto, že externí integrace ještě není hotová.

## TVL: POUKÁZKA, INVESTICE a DOKLAD

Jeden TVL se skládá ze tří propojených dílů:

1. **POUKÁZKA** – jediná část, do které patří adresa, rodné číslo nebo osobní QR kód účastníka;
2. **INVESTICE** – základ pracovní šablony správce a hlavní místo jeho práce;
3. **DOKLAD** – kontrolní a účetní část bez osobních údajů.

Společné údaje a obsah projektů se během editace propisují do všech tří dílů. Všechny díly jednoho TVL nesou shodný anonymizační kód složený ze 17+4 symbolů. Při dávkovém tisku správce dostane každý výtisk nový kód B; účastník může tisknout pouze svůj vyplněný TVL.

## Okna A–E

- **A – správce a aktivace:** vlevo obsahuje ověřenou identifikaci správce z kroku ARES. Vpravo zobrazuje datum, běžící čas s tisícinami sekundy a časové razítko ukončení editace.
- **B – anonymizér:** obsahuje společný kód 17+4 symboly, shodný ve všech třech dílech konkrétního TVL. Každý další tisk nebo stažení musí získat nový kód.
- **C – obsah PN:** obsahuje nejvýše tři samostatné návrhy nebo otázky. Každý má nadpis, úplný popis, oddělenou prioritu správce 1–3 Kč a hodnocení účastníka 1–9 bodů.
- **D – osobní údaje:** adresa a další osobní údaje účastníka smějí být pouze v POUKÁZCE.
- **E – původní volební pole:** zachovává názvy „Číslo volené strany“ a „Číslo voleného zástupce“, dvě číslicová okénka pro stranu a pět pro kandidáta. Z tohoto okna se odvozuje označení PN1 v horním řádku.

## Náhled, časové razítko a uzamčení

Otevření celého náhledu vytvoří přesné časové razítko, zapíše je do okna A a dočasně ukončí editaci. V náhledu jsou dvě cesty:

- **ZPĚT K OPRAVÁM** zruší razítko, odemkne obsah a vrátí správce k editaci;
- **POTVRDIT PN1** zveřejní aktivitu mezi živými projekty a zachová ji uzamčenou.

Potvrzení tedy nevytváří náhled: následuje až po náhledu. Již potvrzený průzkum nesmí správce měnit; z přehledu jej otevírá jen ke čtení a kopírování.

## Živé a ukončené projekty

PN je živá jeden týden, od pondělí 00:00 do neděle 23:59:59,999. Po potvrzení se PN1 objeví ve sloupci **Živé průzkumy** a je dostupná účastníkům. Po konci týdne má přejít do sloupce **Ukončené průzkumy** a do historie účastníka. Rozhraní obou sloupců existuje, ale automatický časový přesun zatím není implementován a data se neukládají trvale.

## Současné testovací nasazení

Aplikace se sestavuje jako statický export s cestou `/COTO-testovac` a slouží jako testovací verze. GitHub Actions při pull requestu do `main` spouští povinný build **Build application**. Po sloučení do `main` stejný workflow vytvoří statický výstup a nasadí jej na GitHub Pages. Samostatná automatika u způsobilého pull requestu pouze zapne GitHub auto-merge metodou `merge`; samotné sloučení musí počkat na úspěšný povinný build a nesmí proběhnout při konfliktu nebo neúspěšné kontrole.
