# Trvalý kontext projektu COTO

Tento dokument shrnuje současný stav aplikace a pravidla, která je nutné zachovat při další práci. Podrobné produktové požadavky zůstávají ve `SPECIFIKACE_COTO.md`, stručná závazná paměť v `PROJEKTOVA_PAMET.md` a chronologie změn ve `VYVOJOVY_DENIK.md`.

## Účel COTO

COTO je systém pro spravedlivou výměnu informací mezi množinou správců a účastníků. Jeho základem je TVL: třídílný, tisknutelný nosič komunikace odvozený z původní papírové předlohy. Web nemá TVL zjednodušit na obyčejný formulář, ale digitálně oživit jeho propojené části, společné údaje, kontrolní prvky a návaznost mezi správcem a účastníkem.

Aplikace je nyní funkční prototyp. Neprovádí skutečné hlasování ani platby a nemá připojené trvalé serverové ukládání, bankovní identitu ani skutečné ověření v ARES.

## Role

### Správce

Správce zakládá a připravuje aktivitu. Podmínkou už ve volbě role je IČO a samostatný účet na propagaci. V současné variantě PN vyplní nejvýše tři návrhy nebo otázky, jejich podrobné popisy a každému přidělí vlastní prioritu v hodnotě 1–3 Kč ze svého účtu na propagaci. Tato částka není hlas účastníka. Správce určuje také počáteční pondělí týdne platnosti, kontroluje celý TVL v náhledu a aktivitu potvrzuje. Potvrzenou aktivitu už smí otevřít jen ke čtení a kopírování.

### Účastník

Účastník vybere správce a jeho živou aktivitu, otevře úplné popisy tří nečíslovaných témat okna C a každému nezávisle přidělí 1–9 bodů. Po odeslání získá časové razítko a osobní kontrolní kód. V prostředí účtu na propagaci podle něj zkontroluje řádkové výsledky každého tématu ze svého TVL bez přenosu osobních údajů z okna D. Současný prototyp opakování stejného počtu bodů nezakazuje; konečné pravidlo dosud nebylo schváleno.

## Varianty COTO

COTO počítá se čtyřmi společnými variantami:

- **PN – Průzkum názorů**;
- **VL – Vyber lepší**;
- **PP – Podpora projektu**;
- **VT – Volební tombola**.

Další vývoj má zachovat společný systém variant a nesmí odstranit povinný vstupní průchod. Současná práce se soustředí na PN1 – Průzkum návrhů a otázek.

## Navigace aplikací

Povinný začátek tvoří původní ikona COTO se smajlíkem, samostatné dodané logo COTO bez náhradní kresby, obrazovka **Cíl a filosofie** podle videozáznamu a volba role **Správce / Účastník**. Logo vždy otevře obrazovku cíle a filosofie. Všech deset obrazovek má nenápadné číslo 01–10, aby je autor mohl jednoznačně označit při opravách.

Nad modrým polem SPRÁVCE a zeleným polem ÚČASTNÍK je krátce uvedeno, že COTO slouží nejmenším správním a společenským celkům a že se do nich vracejí výsledky průzkumů. Celá aplikace oslovuje správce i účastníka kamarádsky v jednotném čísle.

Pracovní komunikace autora s Lin není součást veřejné aplikace. Probíhá v pracovním chatu: autor vlevo odešle požadavek a Lin vpravo zopakuje pochopení, doplní související nápovědu a průběžně modeluje měněný krok, vazbu nebo schéma. Veřejná aplikace proto nesmí obsahovat poznámkový sloupec, místní úložiště připomínek ani náhražku odpovědi AI.

Průchod správce pokračuje takto:

1. interní kontrola IČO správce v kroku ARES;
2. nabídka variant PN, VL, PP a VT;
3. otevření živé pracovní šablony INVESTICE;
4. výběr kódu a pořadí použití, hodnoty průzkumu pro správce a data s dobou platnosti přímo u pracovního listu; volba se ihned zobrazí v listu;
5. vyplnění tří nečíslovaných témat okna C;
6. náhled celého TVL a vznik časového razítka;
7. případný návrat k opravám, nebo potvrzení PN1;
8. přehled správce se sloupci živých a ukončených průzkumů.

Na počítači se správci při najetí kurzorem nebo při zaměření klávesnicí ukazuje význam volby. V živé šabloně se popis zobrazuje pod horní trojicí polí a vysvětluje také okamžitý přenos do všech tří dílů, návrat k opravám a okamžik uzamčení.

Průchod účastníka vede z volby role na seznam správců, dále na živé aktivity vybraného správce a poté na hodnocení konkrétní PN. Horní přepínač rolí umožňuje v prototypu přecházet mezi pohledem správce a účastníka.

## ARES

ARES je v současnosti pouze interní, zkušební krok navigace správce. Zobrazuje připravené IČO a předává identitu správce do okna A, ale nevolá skutečnou službu ARES. Tento krok je součástí povinného toku a nesmí se přeskočit ani odstranit jen proto, že externí integrace ještě není hotová.

## TVL: POUKÁZKA, INVESTICE a DOKLAD

Jeden TVL se skládá ze tří propojených dílů:

1. **POUKÁZKA** – jediná část, do které patří adresa, osobní QR kód účastníka a samostatný řádek pro rodné číslo; ve variantě PP se tento řádek používá pro číslo bankovní transakce;
2. **INVESTICE** – základ pracovní šablony správce a hlavní místo jeho práce;
3. **DOKLAD** – kontrolní a účetní část bez osobních údajů.

Společné údaje a obsah projektů se během editace propisují do všech tří dílů. Všechny díly jednoho TVL nesou shodný 17symbolový anonymizační kód vytvořený systémem a čtyři samostatná volitelná políčka účastníka. Při dávkovém tisku správce dostane každý výtisk nový základní kód B; účastník může tisknout pouze svůj vyplněný TVL.

## Okna A–E

- **A – správce a aktivace:** vlevo obsahuje ověřenou identifikaci správce z kroku ARES. Vpravo zobrazuje datum, běžící čas s tisícinami sekundy a časové razítko ukončení editace.
- **B – anonymizér:** obsahuje společný 17symbolový kód vytvořený systémem a čtyři samostatná políčka pro volitelné symboly účastníka. Vyplněné okno B je shodné ve všech třech dílech konkrétního TVL. Každý další tisk nebo stažení musí získat nový základní kód.
- **C – obsah PN:** obsahuje tři nečíslovaná dlouhá pole podobná oknu B. Každé má nadpis, úplný popis a právě jedno samostatné čtvercové pole pro hodnocení účastníka 1–9 bodů; priorita správce 1–3 Kč zůstává součástí obsahu tématu.
- **D – osobní údaje:** adresa a další osobní údaje účastníka smějí být pouze v POUKÁZCE.
- **E – původní volební pole:** zachovává názvy „Číslo volené strany“ a „Číslo voleného zástupce“, dvě číslicová okénka pro stranu a pět pro kandidáta. Z tohoto okna se odvozuje označení PN1 v horním řádku.

## Náhled, časové razítko a uzamčení

Otevření celého náhledu vytvoří přesné časové razítko, zapíše je do okna A a dočasně ukončí editaci. V náhledu jsou dvě cesty:

- **ZPĚT K OPRAVÁM** zruší razítko, odemkne obsah a vrátí správce k editaci;
- **POTVRDIT PN1** zveřejní aktivitu mezi živými projekty a zachová ji uzamčenou.

Potvrzení tedy nevytváří náhled: následuje až po náhledu. Již potvrzený průzkum nesmí správce měnit; z přehledu jej otevírá jen ke čtení a kopírování.

POUKÁZKA nesmí být proti dalším dílům nelogicky roztažená. Její okna A, B a C mají stejnou hustotu a zarovnání jako v INVESTICI a DOKLADU; navíc obsahuje pouze nezbytné okno D. Pod jejími okny zůstává vysvětlující text, upozornění na neplatnost přepisovaného listu a samostatná čárkovaná střihová linka s nůžkami. POUKÁZKA, INVESTICE a DOKLAD se vždy tisknou společně na jedinou A4.

Vyplněný nebo zobrazený TVL má přímo dostupné tlačítko tisku. Na telefonu může účastník zvolit u tisku uložení do PDF a tento soubor přiložit ke zprávě SMS nebo MMS. Tlačítko s globusem sdílí veřejný odkaz **COTO – živá aplikace**; na telefonu otevře systémovou nabídku sdílení a na počítači bez této nabídky zkopíruje odkaz.

V celém náhledu jsou názvy dílů výrazně barevné: POUKÁZKA zeleně, INVESTICE červeně a DOKLAD modře. Střihové linky jsou zesílené a mají nůžky na obou okrajích podle papírového originálu.

## Živé a ukončené projekty

PN je živá jeden týden, od pondělí 00:00 do neděle 23:59:59,999. Po potvrzení se PN1 objeví ve sloupci **Živé průzkumy** a je dostupná účastníkům. Po konci týdne má přejít do sloupce **Ukončené průzkumy** a do historie účastníka. Rozhraní obou sloupců existuje, ale automatický časový přesun zatím není implementován a data se neukládají trvale.

Další správce může z potvrzeného průzkumu převzít jeden, dva nebo všechny tři náměty okna C. Kopírují se pouze označené názvy a popisy; jejich vazba na společný součtový výsledek zůstává zachována ve všech použitých TVL.

U každého průzkumu se správci i účastníkovi červeně zobrazuje orientační údaj **Kopírováno 0×** a jeho průběžná hodnota. Není to výsledek hlasování ani přesný statistický součet; slouží jako upozornění na zájem o průzkum a pobídka k jeho převzetí pod identitou jiného správce. Když jiný správce na údaj klikne, otevře se seznam variant se zvýrazněnou shodnou variantou. Jejím výběrem vznikne čistá pracovní šablona se zápisem **Variace**, který zachová původní kód a přesné časové razítko kopie. Po potvrzení kopie do seznamu se orientační počet zvýší.

## Současné testovací nasazení

Aplikace se sestavuje jako statický export s cestou `/COTO-testovac` a slouží jako testovací verze. GitHub Actions při pull requestu do `main` spouští povinný build **Build application**. Po sloučení do `main` stejný workflow vytvoří statický výstup a nasadí jej na GitHub Pages. Samostatná automatika u způsobilého pull requestu pouze zapne GitHub auto-merge metodou `merge`; samotné sloučení musí počkat na úspěšný povinný build a nesmí proběhnout při konfliktu nebo neúspěšné kontrole.
