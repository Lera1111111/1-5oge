
const $ = s=>document.querySelector(s);
const appEl=$("#app"), progressBar=$("#progressBar"), progressText=$("#progressText"), crumb=$("#crumb");
const state={section:"intro",intro:0,lesson:1,lessonStep:0,examQ:1,examAnswers:{},hints:{}};

const introSteps=[
 {title:"Сначала просто прочитай условие", lead:"Пока ничего не нужно запоминать. Прочитай условие и попробуй понять, какая информация здесь может пригодиться для решения задач.",type:"read"},
 {title:"Смотрим на 195",lead:"Первое число маркировки связано с шириной шины.",type:"call",mark:"m195",head:"195 — ширина шины",text:"Первое число показывает ширину шины в миллиметрах.",formula:"B = 195 мм"},
 {title:"Теперь смотрим на 65",lead:"Второе число связано с высотой боковины.",type:"call",mark:"m65",head:"65 — это процент",text:"Высота боковины составляет 65% от ширины шины.",formula:"H = 195 · 65 / 100 = 126,75 мм",warn:"65 — не 65 мм."},
 {title:"Что означает R",lead:"Не вся информация из большого условия обязательно участвует в вычислениях.",type:"call",mark:"mR",head:"R — радиальная конструкция",text:"Буква R описывает конструкцию шины. Для вычислений сама буква почти не нужна."},
 {title:"Смотрим на 15",lead:"Число после R показывает диаметр диска.",type:"call",mark:"m15",head:"15 — диаметр диска",text:"Диаметр диска d указан в дюймах.",formula:'d = 15"'},
 {title:"Переводим дюймы",lead:"Используем ещё один факт из исходного текста.",type:"call",mark:"inch",head:"1 дюйм = 25,4 мм",text:"Чтобы получить миллиметры, умножаем количество дюймов на 25,4.",formula:"15 · 25,4 = 381 мм"},
 {title:"Попробуй перевести сам",lead:"16 дюймов = ? мм",type:"inch"},
 {title:"Теперь читаем рисунок",lead:"Свяжем обозначения на рисунке с тем, что уже нашли в тексте.",type:"diagram"},
 {title:"Проверь обозначения",lead:"Перетащи подписи к B, H, d и D.",type:"drag"},
 {title:"Из чего состоит диаметр D?",lead:"Полный диаметр проходит через верхнюю боковину, диск и нижнюю боковину.",type:"formulaIntro"},
 {title:"Собери формулу диаметра",lead:"Собери её прямо по рисунку.",type:"formula"},
 {title:"Диаметр и радиус",lead:"Радиус — половина диаметра.",type:"radius"},
 {title:"Сравни радиусы",lead:"Если диаметры 640 мм и 660 мм, на сколько отличаются радиусы?",type:"radiusDiff"},
 {title:"Новая маркировка",lead:"Проверь, умеешь ли ты читать маркировку самостоятельно.",type:"newMark"},
 {title:"С условием разобрались",lead:"Теперь будем собирать знакомые действия в настоящих заданиях №1–5.",type:"introDone"}
];

function ogeBase(){
 return `<div class="stage card">
   <div class="grid2">
    <div class="ogeText">
      <p>Автомобильное колесо представляет из себя металлический диск с установленной на него резиновой шиной. Диаметр диска совпадает с диаметром внутреннего отверстия в шине.</p>
      <p>Для маркировки автомобильных шин применяется единая система обозначений. Например,
      <span id="m195" class="mark">195</span>/<span id="m65" class="mark">65</span> <span id="mR" class="mark">R</span><span id="m15" class="mark">15</span>.
      Первое число означает ширину шины в миллиметрах (размер B на рис. 2). Второе число — высота боковины H в процентах от ширины шины.</p>
      <p>Например, шина 195/65 R15 имеет B=195 мм и H=195·0,65=126,75 мм.</p>
      <p>Буква R означает, что шина имеет радиальную конструкцию.</p>
      <p>За буквой R следует диаметр диска d в дюймах (<span id="inch" class="mark">в одном дюйме 25,4 мм</span>). Общий диаметр колеса D можно найти, зная диаметр диска и высоту боковины.</p>
      <p>Завод устанавливает на автомобили колёса с шинами 195/60 R16.</p>
    </div>
    <div>
      <div class="figure"><img src="assets/fig1.png"><div class="cap">Рис. 1 · маркировка на шине</div></div>
      <div class="figure"><img src="assets/fig2.png"><div class="cap">Рис. 2 · B, H, d и D</div></div>
    </div>
   </div>
 </div>`;
}

function common(title,lead,body,back=true,next=true){
 return `<h1>${title}</h1><div class="lead">${lead}</div>${body}
 <div class="nav">${back?`<button class="btn secondary" onclick="app.prev()">Назад</button>`:"<span></span>"}${next?`<button id="nextBtn" class="btn primary" onclick="app.next()">Дальше →</button>`:""}</div>`;
}

function renderIntro(){
 crumb.textContent="Шины · Разбираем условие";
 let st=introSteps[state.intro];
 progressText.textContent=`Введение · ${state.intro+1} из ${introSteps.length}`;
 progressBar.style.width=`${(state.intro+1)/introSteps.length*100}%`;
 let body="";
 if(st.type==="read"){
   body=ogeBase()+`<div class="card notes"><b>Что ты считаешь важным в этом условии?</b><textarea id="notes" placeholder="Числа, обозначения, факты или мысли..."></textarea><div class="mini">Ответ не проверяется.</div></div>`;
 }
 if(st.type==="call"){
   body=ogeBase()+`<div class="callout" style="position:relative;margin-top:18px;max-width:560px">
    <h3>${st.head}</h3><p>${st.text}</p>${st.formula?`<div class="formula">${st.formula}</div>`:""}${st.warn?`<div class="warn">${st.warn}</div>`:""}</div>`;
   setTimeout(()=>{let m=document.getElementById(st.mark); if(m)m.classList.add("active")},0);
 }
 if(st.type==="inch"){
   body=ogeBase()+exerciseBlock("16 дюймов = ? мм","406,4","inchPractice","мм");
 }
 if(st.type==="diagram"){
   body=`<div class="card split"><div><div class="sectionTitle">B, H, d и D</div>
    <div class="stepEq">B — ширина шины<small>Размер поперёк шины.</small></div>
    <div class="stepEq">H — высота боковины<small>От края диска до внешнего края шины.</small></div>
    <div class="stepEq">d — диаметр диска<small>Только внутренний металлический диск.</small></div>
    <div class="stepEq">D — диаметр всего колеса<small>От внешнего края до внешнего края через центр.</small></div>
    </div><div class="figure"><img src="assets/fig2.png"><div class="cap">Рис. 2</div></div></div>`;
 }
 if(st.type==="drag"){
   body=`<div class="card"><div class="sectionTitle">Перетащи подписи</div>
   <div class="dragBank">
    ${["ширина шины|B","высота боковины|H","диаметр диска|d","диаметр всего колеса|D"].map(x=>{let [a,b]=x.split("|");return `<div class="drag" draggable="true" data-v="${b}">${a}</div>`}).join("")}
   </div>
   <div class="dropGrid">${["B","H","d","D"].map(x=>`<div class="drop" data-a="${x}"><b>${x}</b><span>перетащи сюда</span></div>`).join("")}</div>
   <div id="dragFb" class="feedback"></div></div>`;
   setTimeout(initDrag,0);
 }
 if(st.type==="formulaIntro"){
   body=`<div class="card split"><div><div class="sectionTitle">Диаметр сверху вниз</div>
   <div class="bigFormula">D = H + d + H</div><p>Верхняя боковина + диаметр диска + нижняя боковина.</p>
   <p class="mini">Формулу не нужно запоминать вслепую — она видна на рисунке.</p></div>
   <div class="figure"><img src="assets/fig2.png"></div></div>`;
 }
 if(st.type==="formula"){
   body=`<div class="card"><div class="sectionTitle">D = [ ] + [ ] + [ ]</div>
   <div class="builder"><div class="slot"></div><div class="op">+</div><div class="slot"></div><div class="op">+</div><div class="slot"></div></div>
   <div class="tokenBank">${["H","d","H","B","2d"].map(x=>`<button class="token" data-v="${x}">${x}</button>`).join("")}</div>
   <div id="formulaFb" class="feedback"></div><div id="formulaResult"></div></div>`;
   setTimeout(initFormula,0);
 }
 if(st.type==="radius"){
   body=`<div class="card split"><div><div class="sectionTitle">Диаметр и радиус</div>
   <div class="bigFormula">R = D / 2</div><p>Диаметр идёт от края до края через центр. Радиус — от центра до края.</p></div>
   <div>${exerciseBlock("Диаметр колеса 640 мм. Найди радиус.","320","radiusPractice","мм")}</div></div>`;
 }
 if(st.type==="radiusDiff"){
   body=exerciseBlock("D₁ = 640 мм, D₂ = 660 мм. На сколько отличаются радиусы?","10","radiusDiff","мм",
   `<div class="hint">Разность диаметров: 660 − 640 = 20 мм. Разность радиусов в 2 раза меньше.</div>`);
 }
 if(st.type==="newMark"){
   body=`<div class="card"><div class="sectionTitle">205/55 R16</div>
   <div class="skillMap">
    <div class="skill"><b>Ширина</b><div>205 мм</div></div>
    <div class="skill"><b>Боковина</b><div>H = 205·55/100 = 112,75 мм</div></div>
    <div class="skill"><b>Диск</b><div>16·25,4 = 406,4 мм</div></div>
    <div class="skill"><b>Диаметр</b><div>D = 406,4 + 2·112,75 = 631,9 мм</div></div>
   </div><div class="bigFormula">R = D / 2</div></div>`;
 }
 if(st.type==="introDone"){
   body=`<div class="card"><div class="sectionTitle">Что уже умеем</div>
   <div class="skillMap">${["читать маркировку","находить H","переводить дюймы","выводить D=d+2H","связывать D и R","читать рисунок"].map(x=>`<div class="skill">✓ ${x}</div>`).join("")}</div></div>`;
 }
 appEl.innerHTML=common(st.title,st.lead,body,state.intro>0,true);
 if(["inch","drag","formula","radius","radiusDiff"].includes(st.type)) {
   setTimeout(()=>{let b=$("#nextBtn"); if(b)b.disabled=true},0);
 }
}

function exerciseBlock(q,answer,key,unit="",extra=""){
 return `<div class="card soft"><div class="sectionTitle">${q}</div><div class="answerRow"><input id="${key}" inputmode="decimal"><span>${unit}</span><button class="btn primary" onclick="app.checkExercise('${key}','${answer}')">Проверить</button></div><div id="${key}Fb" class="feedback"></div>${extra}</div>`;
}

function norm(v){return String(v).trim().replace(",",".").replace(/\s/g,"")}
function checkExercise(id,ans){
 const el=document.getElementById(id), fb=document.getElementById(id+"Fb");
 if(norm(el.value)===norm(ans)){fb.textContent="Верно!";fb.className="feedback ok";$("#nextBtn").disabled=false}
 else {fb.textContent="Пока не получилось. Попробуй ещё раз.";fb.className="feedback"}
}

let dragged=null;
function initDrag(){
 document.querySelectorAll(".drag").forEach(x=>x.ondragstart=()=>dragged=x);
 document.querySelectorAll(".drop").forEach(z=>{
   z.ondragover=e=>e.preventDefault();
   z.ondrop=e=>{e.preventDefault(); if(!dragged)return;
    if(z.dataset.a===dragged.dataset.v){z.classList.add("good");z.querySelector("span").textContent=dragged.textContent;dragged.classList.add("used");
      if([...document.querySelectorAll(".drop")].every(d=>d.classList.contains("good"))){$("#dragFb").textContent="Верно!";$("#dragFb").className="feedback ok";$("#nextBtn").disabled=false}
    } else $("#dragFb").textContent="Пока не сюда. Посмотри ещё раз на рисунок.";
    dragged=null;
   }
 });
}

function initFormula(){
 let vals=[];
 document.querySelectorAll(".token").forEach(t=>t.onclick=()=>{
   if(t.classList.contains("used")||vals.length>=3)return;
   vals.push(t.dataset.v); t.classList.add("used"); document.querySelectorAll(".slot")[vals.length-1].textContent=t.dataset.v;
   if(vals.length===3){
    if(vals.join("|")==="H|d|H"){
      $("#formulaFb").textContent="Да!";$("#formulaFb").className="feedback ok";
      $("#formulaResult").innerHTML=`<div class="resultBox">D = H + d + H<br>↓<br>D = d + 2H</div>`;
      $("#nextBtn").disabled=false;
    }else{
      $("#formulaFb").textContent="Пока не получилось. Сверь три части с рисунком.";
      setTimeout(()=>{vals=[];document.querySelectorAll(".slot").forEach(s=>s.textContent="");document.querySelectorAll(".token").forEach(t=>t.classList.remove("used"))},700)
    }
   }
 });
}

const tableData={
 widths:[175,185,195,205,215,225],
 cols:[14,15,16,17],
 allowed:{
  "175":[14,15],"185":[14,15],"195":[15,16],"205":[15,16,17],"215":[16,17],"225":[17]
 }
};
function tireTable(clickable=false,focus=null){
 return `<div class="tableWrap"><table><thead><tr><th>Ширина, мм</th>${tableData.cols.map(c=>`<th>${c}"</th>`).join("")}</tr></thead><tbody>
 ${tableData.widths.map(w=>`<tr><th>${w}</th>${tableData.cols.map(c=>{
  let a=tableData.allowed[w].includes(c); return `<td class="${a?"allowed":"dim"}" ${clickable&&a?`onclick="app.pickCell(${w},${c},this)"`:""}>${a?`${w}/${w===195?60:55} R${c}`:"—"}</td>`
 }).join("")}</tr>`).join("")}
 </tbody></table></div>`;
}

const lessons={
 1:{title:"№1 · Работа с таблицей",steps:3},
 2:{title:"№2 · Высота боковины и разность радиусов",steps:4},
 3:{title:"№3 · Диаметр колеса",steps:2},
 4:{title:"№4 · Изменение диаметра",steps:2},
 5:{title:"№5 · Пробег за один оборот",steps:5}
};

function lessonTabs(){
 return `<div class="lessonTabs">${[1,2,3,4,5].map(n=>`<button class="tab ${state.lesson===n?"active":""}" onclick="app.openLesson(${n})">№${n}</button>`).join("")}</div>`;
}
function renderLesson(){
 let L=lessons[state.lesson], s=state.lessonStep;
 crumb.textContent=`Шины · Задание №${state.lesson}`;
 progressText.textContent=`Обучение №${state.lesson} · шаг ${s+1} из ${L.steps}`;
 progressBar.style.width=`${((state.lesson-1)+((s+1)/L.steps))/5*100}%`;
 let b=lessonTabs();

 if(state.lesson===1){
   if(s===0)b+=`<div class="card"><h2 class="sectionTitle">Сначала найдём нужный столбец</h2><p>Для дисков диаметром <b>16 дюймов</b> найдите <b>наименьшую</b> разрешённую ширину шины.</p>${tireTable(false)}<div class="hint">Сначала ищем столбец 16". Затем смотрим только разрешённые ячейки этого столбца.</div></div>`;
   if(s===1)b+=`<div class="card"><h2 class="sectionTitle">Наименьшая</h2><p>Для R16 разрешены ширины 195, 205 и 215 мм. Выбери наименьшую.</p>
   <div class="choiceRow">${[195,205,215].map(x=>`<button class="choice" onclick="app.simpleChoice(this,${x===195})">${x}</button>`).join("")}</div><div id="choiceFb" class="feedback"></div></div>`;
   if(s===2)b+=`<div class="card"><h2 class="sectionTitle">Теперь — наибольшая</h2><p>Для дисков R15 найди <b>наибольшую</b> разрешённую ширину.</p>${tireTable(false)}
   ${exerciseBlock("Ответ:","205","l1max","мм")}</div>`;
 }
 if(state.lesson===2){
   if(s===0)b+=`<div class="card"><h2 class="sectionTitle">Прототип А · высота боковины</h2><div class="bigFormula">210/55 R17</div>${exerciseBlock("Найди высоту боковины.","115,5","l2h","мм")}<div class="hint">H = B·p/100 = 210·55/100</div></div>`;
   if(s===1)b+=`<div class="card"><h2 class="sectionTitle">Прототип Б · два колеса с одинаковым диском</h2><div class="split"><div class="bigFormula">185/65 R16</div><div class="bigFormula">215/55 R16</div></div><p>Число после R одинаковое. Значит диаметр диска d одинаковый.</p><p>Сначала найдём H₁ и H₂:</p><div class="bigFormula">H₁ = 120,25 мм &nbsp;&nbsp; H₂ = 118,25 мм</div></div>`;
   if(s===2)b+=`<div class="card"><h2 class="sectionTitle">Почему разность радиусов = разности боковин</h2>
    <div class="stepEq">R₂ − R₁ <small>Нам нужна разность радиусов.</small></div>
    <div class="stepEq">= D₂/2 − D₁/2 <small>Каждый радиус — половина соответствующего диаметра.</small></div>
    <div class="stepEq">= (d/2 + H₂) − (d/2 + H₁) <small>Потому что D=d+2H, а значит R=(d+2H)/2=d/2+H.</small></div>
    <div class="stepEq">= d/2 + H₂ − d/2 − H₁ <small>Раскрываем скобки; перед второй скобкой минус.</small></div>
    <div class="stepEq">= H₂ − H₁ <small>Одинаковые d/2 сокращаются.</small></div>
    <div class="bigFormula">R₂ − R₁ = H₂ − H₁</div></div>`;
   if(s===3)b+=`<div class="card">${exerciseBlock("На сколько отличаются радиусы колёс 185/65 R16 и 215/55 R16?","2","l2diff","мм")}<div class="hint">Достаточно найти |120,25 − 118,25|.</div></div>`;
 }
 if(state.lesson===3){
   if(s===0)b+=`<div class="card"><h2 class="sectionTitle">Собираем знакомые действия</h2><div class="bigFormula">195/60 R16</div>
   <div class="stepEq">H = 195·60/100 = 117 мм</div><div class="stepEq">d = 16·25,4 = 406,4 мм</div><div class="stepEq">D = d + 2H</div></div>`;
   if(s===1)b+=`<div class="card">${exerciseBlock("Найди диаметр колеса 195/60 R16.","640,4","l3","мм")}</div>`;
 }
 if(state.lesson===4){
   if(s===0)b+=`<div class="card"><h2 class="sectionTitle">Было → стало</h2><div class="split"><div><span class="chip">Было</span><div class="bigFormula">195/60 R16<br>D₁=640,4 мм</div></div><div><span class="chip">Стало</span><div class="bigFormula">205/55 R16<br>D₂=631,9 мм</div></div></div><p>Новое колесо меньше, значит диаметр <b>уменьшился</b>.</p></div>`;
   if(s===1)b+=`<div class="card">${exerciseBlock("На сколько миллиметров уменьшился диаметр?","8,5","l4","мм")}<div class="hint">640,4 − 631,9</div></div>`;
 }
 if(state.lesson===5){
   if(s===0)b+=`<div class="card"><h2 class="sectionTitle">Что такое пробег?</h2><p><b>Пробег</b> — расстояние, которое проехал автомобиль.</p><p>Если автомобиль проехал 10 км, его пробег увеличился на 10 км.</p></div>`;
   if(s===1)b+=`<div class="card gifBox"><h2 class="sectionTitle">Что такое один оборот?</h2><img src="assets/one_turn.gif"><p><b>Один оборот</b> — колесо полностью прокрутилось, и отмеченная точка снова вернулась к дороге.</p><div class="bigFormula">1 оборот = длина окружности</div></div>`;
   if(s===2)b+=`<div class="card"><h2 class="sectionTitle">Почему можно сравнивать диаметры</h2><div class="bigFormula">C = πD</div><div class="stepEq">C₂/C₁ = πD₂/πD₁ <small>Сравниваем расстояния за один оборот.</small></div><div class="stepEq">= D₂/D₁ <small>π одинаково и сокращается.</small></div><p>Значит процент изменения пробега такой же, как процент изменения диаметра.</p></div>`;
   if(s===3)b+=`<div class="card"><h2 class="sectionTitle">Составляем отношение</h2><p>До замены: D₁=640,4 мм. После: D₂=631,9 мм.</p>
    <div class="stepEq">640,4 мм → 100% <small>Старое значение принимаем за 100%.</small></div>
    <div class="stepEq">631,9 мм → x% <small>Ищем, сколько процентов новое значение составляет от старого.</small></div>
    <div class="bigFormula">x = 631,9 · 100 / 640,4 ≈ 98,7%</div>
    <p>Это ещё не ответ «на сколько уменьшилось».</p><div class="bigFormula">100% − 98,7% = 1,3%</div></div>`;
   if(s===4)b+=`<div class="card">${exerciseBlock("На сколько процентов уменьшится пробег за один оборот? Ответ округли до десятых.","1,3","l5","%")}<div class="hint">Сначала найди, сколько процентов новое значение составляет от старого, затем вычти из 100%.</div></div>`;
 }
 appEl.innerHTML=common(L.title,"Разбираем этот номер постепенно, а затем пробуем самостоятельно.",b,true,true);
 if((state.lesson===1&&s===1)||(state.lesson===1&&s===2)||(state.lesson===2&&(s===0||s===3))||(state.lesson===3&&s===1)||(state.lesson===4&&s===1)||(state.lesson===5&&s===4))
   setTimeout(()=>$("#nextBtn").disabled=true,0);
}

function renderExam(){
 crumb.textContent="Шины · Решаю самостоятельно"; progressText.textContent="Самостоятельный вариант"; progressBar.style.width="100%";
 const qs={
 1:{q:'Для дисков диаметром 16 дюймов найдите наименьшую разрешённую ширину шины.',a:'195',unit:'мм',extra:tireTable(false),lesson:1},
 2:{q:'Для шины 205/55 R16 найдите высоту боковины.',a:'112.75',unit:'мм',lesson:2},
 3:{q:'Найдите диаметр заводского колеса с шиной 195/60 R16.',a:'640.4',unit:'мм',lesson:3},
 4:{q:'После замены 195/60 R16 на 205/55 R16 на сколько миллиметров уменьшится диаметр колеса?',a:'8.5',unit:'мм',lesson:4},
 5:{q:'На сколько процентов уменьшится пробег автомобиля за один оборот после этой замены? Ответ округлите до десятых.',a:'1.3',unit:'%',lesson:5}
 };
 let q=qs[state.examQ];
 let body=`<div class="examGrid"><div class="qnav">${[1,2,3,4,5].map(n=>`<button class="${state.examQ===n?"active":""} ${state.examAnswers[n]!==undefined?"done":""}" onclick="app.examGoto(${n})">Задание №${n}</button>`).join("")}</div>
 <div class="card"><span class="chip">Задание №${state.examQ}</span><h2>${q.q}</h2>${q.extra||""}<div class="answerRow"><input id="examInput" value="${state.examAnswers[state.examQ]??""}"><span>${q.unit}</span></div>
 <div class="mini">Подсказок и промежуточной проверки нет.</div></div></div>`;
 body+=`<div class="nav"><button class="btn secondary" onclick="app.backToLessons()">← К обучению</button><button class="btn primary" onclick="app.saveExam()">${state.examQ<5?"Сохранить и дальше →":"Завершить вариант"}</button></div>`;
 appEl.innerHTML=common("Решаю самостоятельно","Полное условие и пять заданий. Можно возвращаться к предыдущим номерам и менять ответы.",body,false,false);
}

function renderResults(){
 const correct={1:"195",2:"112.75",3:"640.4",4:"8.5",5:"1.3"};
 let score=0; for(let n=1;n<=5;n++) if(norm(state.examAnswers[n]??"")===correct[n])score++;
 crumb.textContent="Шины · Результат"; progressText.textContent=`${score} из 5`; progressBar.style.width="100%";
 let rows=[1,2,3,4,5].map(n=>{
  let ok=norm(state.examAnswers[n]??"")===correct[n];
  return `<div class="reviewRow"><div><b>№${n}</b> <span class="${ok?"good":"bad"}">${ok?"✓ Верно":"✕ Ошибка"}</span></div>${ok?"":`<button class="btn secondary" onclick="app.review(${n})">Разобрать</button>`}</div>`;
 }).join("");
 appEl.innerHTML=common(score===5?"Шины пройдены ✓":"Есть что разобрать",`Результат: ${score} из 5`,
 `<div class="card"><div class="score">${score} из 5</div>${rows}</div><div class="nav"><button class="btn secondary" onclick="app.restartExam()">Решить ещё раз</button></div>`,false,false);
}

const app={
 render(){
  if(state.section==="intro")renderIntro();
  if(state.section==="lesson")renderLesson();
  if(state.section==="exam")renderExam();
  if(state.section==="results")renderResults();
 },
 goHome(){state.section="intro";state.intro=0;this.render()},
 prev(){
  if(state.section==="intro"&&state.intro>0){state.intro--;this.render()}
  else if(state.section==="lesson"){
   if(state.lessonStep>0)state.lessonStep--;
   else if(state.lesson>1){state.lesson--;state.lessonStep=lessons[state.lesson].steps-1}
   else {state.section="intro";state.intro=introSteps.length-1}
   this.render()
  }
 },
 next(){
  if(state.section==="intro"){
   if(state.intro<introSteps.length-1){state.intro++;this.render()}
   else {state.section="lesson";state.lesson=1;state.lessonStep=0;this.render()}
  } else if(state.section==="lesson"){
   if(state.lessonStep<lessons[state.lesson].steps-1){state.lessonStep++;this.render()}
   else if(state.lesson<5){state.lesson++;state.lessonStep=0;this.render()}
   else {state.section="exam";state.examQ=1;this.render()}
  }
 },
 checkExercise,
 simpleChoice(btn,ok){
  document.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected","wrong"));
  if(ok){btn.classList.add("correct");$("#choiceFb").textContent="Верно!";$("#choiceFb").className="feedback ok";$("#nextBtn").disabled=false}
  else {btn.classList.add("wrong");$("#choiceFb").textContent="Пока не получилось. Посмотри на слово «наименьшая»."}
 },
 openLesson(n){state.section="lesson";state.lesson=n;state.lessonStep=0;this.render()},
 pickCell(){},
 examGoto(n){state.examAnswers[state.examQ]=$("#examInput")?.value??state.examAnswers[state.examQ];state.examQ=n;this.render()},
 saveExam(){
  state.examAnswers[state.examQ]=$("#examInput").value;
  if(state.examQ<5){state.examQ++;this.render()}else{state.section="results";this.render()}
 },
 backToLessons(){state.section="lesson";state.lesson=5;state.lessonStep=4;this.render()},
 review(n){state.section="lesson";state.lesson=n;state.lessonStep=0;this.render()},
 restartExam(){state.examAnswers={};state.section="exam";state.examQ=1;this.render()}
};
app.render();
