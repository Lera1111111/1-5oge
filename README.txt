ШИНЫ v2 — интерактивный тренажёр ОГЭ

Основные изменения:
- постоянная левая панель этапов;
- облачка возле чисел + стрелки к рисунку;
- перемешанные варианты B/H/d/D и рисунок рядом;
- D=d+2H ребёнок сначала собирает сам;
- диаметр и радиус показываются вместе с рисунком;
- новая маркировка заполняется самостоятельно;
- №1 решается прямо по таблице;
- №2 использует KaTeX и пошаговые выводы;
- №3 и №4 сначала дают самостоятельную попытку, подсказки раскрываются постепенно;
- GIF исправлен: колесо едет вправо и вращается по часовой стрелке;
- №5: вывод отношения C2/C1=D2/D1 и способ через пропорцию процентов;
- самостоятельный режим всегда показывает текст, рисунки и таблицу рядом;
- кнопка «Подсказка» есть у каждого самостоятельного задания;
- после разбора ошибки возвращаемся только к ошибочному номеру, ответы остальных номеров сохраняются.

Загрузка на GitHub Pages:
1. Распаковать ZIP.
2. Заменить файлы в корне репозитория: index.html, styles.css, app.js и папку assets.
3. GitHub Pages остаётся main / root.

KaTeX подключается через CDN.


v3 changes:
- №1: wrong column/cell is red, only correct answer becomes green.
- №2: B and p explained again with the OGE diagram; formula origin explained.
- Formula derivations shown in one line with ? buttons over transitions.
- Old/new markings are explicitly labeled 1 and 2.
- №3 and №4 now contain full task wording.
- Theory for each numbered task is kept on one long page instead of splitting across screens.
- №5 derivations are inline and explainable step by step.
- New-marking check accepts 55, 55%, or 0.55 for the percentage field and only D/2 (or D:2) for radius.
