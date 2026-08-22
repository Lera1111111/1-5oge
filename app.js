const $=s=>document.querySelector(s);
const appEl=$('#app'),sidebar=$('#sidebar'),crumb=$('#crumb'),progressText=$('#progressText'),progressBar=$('#progressBar');
const state={section:'intro',intro:0,lesson:1,lessonStep:0,hints:{},examQ:1,examAnswers:{},examReviewed:{},reviewTarget:null,newMark:{}};
const introSteps=[
{t:'Сначала просто прочитай условие',l:'Пока ничего не нужно запоминать. Прочитай условие и попробуй понять, какая информация здесь может пригодиться для решения задач.',type:'read'},
{t:'Смотрим на 195',l:'Перечитываем тот же текст и связываем число с рисунком.',type:'call',mark:'m195',head:'195 — ширина шины',text:'Первое число показывает ширину шины в миллиметрах.',formula:'B=195\\text{ мм}',target:'B'},
{t:'Теперь смотрим на 65',l:'Второе число связано с высотой боковины.',type:'call',mark:'m65',head:'65 — это процент',text:'Высота боковины составляет 65% от ширины шины.',formula:'H=\\frac{195\\cdot65}{100}=126{,}75\\text{ мм}',warn:'65 — не 65 мм.',target:'H'},
{t:'Что означает R',l:'Не вся информация в большом условии обязательно участвует в вычислениях.',type:'call',mark:'mR',head:'R — радиальная конструкция',text:'Буква R описывает конструкцию шины. Для вычислений сама буква почти не нужна.'},
{t:'Смотрим на 15',l:'Число после R показывает диаметр диска.',type:'call',mark:'m15',head:'15 — диаметр диска',text:'Диаметр диска d указан в дюймах.',formula:'d=15"',target:'d'},
{t:'Переводим дюймы',l:'Используем ещё один факт из исходного текста.',type:'call',mark:'inch',head:'1 дюйм = 25,4 мм',text:'Чтобы получить миллиметры, умножаем количество дюймов на 25,4.',formula:'15\\cdot25{,}4=381\\text{ мм}',target:'d'},
{t:'Попробуй перевести сам',l:'16 дюймов = ? мм',type:'inch'},
{t:'Теперь читаем рисунок',l:'Разбираем B, H, d и D прямо по рисунку.',type:'diagram'},
{t:'Проверь обозначения',l:'Перетащи перемешанные подписи к буквам, глядя на рисунок.',type:'drag'},
{t:'Из чего состоит диаметр D?',l:'Сначала попробуй увидеть это на рисунке самостоятельно.',type:'formulaTry'},
{t:'Диаметр и радиус',l:'Сначала посмотрим на них на рисунке, а потом посчитаем.',type:'radius'},
{t:'Сравни радиусы',l:'Сравним два колеса визуально и численно.',type:'radiusDiff'},
{t:'Новая маркировка',l:'Теперь никаких готовых ответов — заполни всё сам.',type:'newMark'},
{t:'С условием разобрались',l:'Теперь переходим к настоящим заданиям №1–5.',type:'introDone'}];
const lessons={1:{t:'№1 · Работа с таблицей',steps:1},2:{t:'№2 · Высота боковины и разность радиусов',steps:1},3:{t:'№3 · Диаметр колеса',steps:1},4:{t:'№4 · Изменение диаметра',steps:1},5:{t:'№5 · Пробег за один оборот',steps:1}};
function renderMath(){if(window.renderMathInElement)renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false})}
function common(t,l,b,back=true,next=true,label='Дальше →'){return `<h1>${t}</h1><div class="lead">${l}</div>${b}<div class="nav">${back?'<button class="btn secondary" onclick="window.goPrev()">Назад</button>':'<span></span>'}${next?`<button id="nextBtn" class="btn primary" onclick="window.goNext()">${label}</button>`:''}</div>`}
function sidebarHtml(){let out='<div class="sideTitle">Шины</div>';let groups=[['Разбираем условие',[['Введение','intro',0],['Маркировка','intro',1],['Дюймы','intro',5],['Рисунок','intro',7],['Диаметр и радиус','intro',10]]],['Учимся решать',[[`Задание №1`,'lesson',1],[`Задание №2`,'lesson',2],[`Задание №3`,'lesson',3],[`Задание №4`,'lesson',4],[`Задание №5`,'lesson',5]]],['Проверяем себя',[[`Самостоятельный вариант`,'exam',1],[`Результат`,'results',1]]]];groups.forEach(([g,items])=>{out+=`<div class="sideGroup">${g}</div>`;items.forEach(([label,sec,val])=>{let a=false,d=false;if(sec==='intro'){a=state.section==='intro'&&state.intro>=val&&state.intro<val+4;d=state.section!=='intro'||state.intro>val}if(sec==='lesson'){a=state.section==='lesson'&&state.lesson===val;d=(state.section==='lesson'&&state.lesson>val)||['exam','results'].includes(state.section)}if(sec==='exam'){a=state.section==='exam';d=state.section==='results'}if(sec==='results')a=state.section==='results';out+=`<div class="sideItem ${a?'active':''} ${d?'done':''}">${label}</div>`})});return out}
function updateChrome(){sidebar.innerHTML=sidebarHtml();renderMath()}
function ogeBase(call=null){return `<div class="stage card" id="ogeStage"><svg id="arrowLayer" class="arrowLayer"><defs><marker id="arrowHead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#8b68d2"></path></marker></defs><path id="arrowPath" d="" fill="none" stroke="#8b68d2" stroke-width="3" marker-end="url(#arrowHead)"></path></svg><div class="grid2"><div class="ogeText"><p>Автомобильное колесо представляет из себя металлический диск с установленной на него резиновой шиной. Диаметр диска совпадает с диаметром внутреннего отверстия в шине.</p><p>Для маркировки автомобильных шин применяется единая система обозначений. Например, <span id="m195" class="mark">195</span>/<span id="m65" class="mark">65</span> <span id="mR" class="mark">R</span><span id="m15" class="mark">15</span>. Первое число означает ширину шины в миллиметрах (размер B на рис. 2). Второе число — высота боковины H в процентах от ширины шины.</p><p>Например, шина 195/65 R15 имеет B=195 мм и H=195·0,65=126,75 мм.</p><p>Буква R означает, что шина имеет радиальную конструкцию.</p><p>За буквой R следует диаметр диска d в дюймах (<span id="inch" class="mark">в одном дюйме 25,4 мм</span>). Общий диаметр колеса D можно найти, зная диаметр диска и высоту боковины.</p><p>Завод устанавливает на автомобили колёса с шинами 195/60 R16.</p></div><div><div class="figure"><img src="assets/fig1.png"><div class="cap">Рис. 1 · маркировка на шине</div></div><div class="figure" id="fig2box"><img src="assets/fig2.png"><div class="cap">Рис. 2 · B, H, d и D</div></div></div></div>${call?`<div id="callout" class="callout"><h3>${call.head}</h3><p>${call.text}</p>${call.formula?`<div class="formula">$$${call.formula}$$</div>`:''}${call.warn?`<div class="warn">${call.warn}</div>`:''}</div>`:''}</div>`}
function positionCallout(markId,target){requestAnimationFrame(()=>{let stage=$('#ogeStage'),call=$('#callout'),mark=document.getElementById(markId);if(!stage||!call||!mark)return;mark.classList.add('active');let sr=stage.getBoundingClientRect(),mr=mark.getBoundingClientRect();let left=mr.left-sr.left+mr.width/2-40,top=mr.top-sr.top-call.offsetHeight-22;if(top<-135)top=-135;if(left+call.offsetWidth>sr.width-18)left=sr.width-call.offsetWidth-18;if(left<18)left=18;call.style.left=left+'px';call.style.top=top+'px';if(target){let fig=$('#fig2box').getBoundingClientRect(),cr=call.getBoundingClientRect();let p={B:[.45,.83],H:[.10,.25],d:[.10,.51],D:[.06,.46]}[target]||[.5,.5];let x1=cr.left-sr.left+45,y1=cr.bottom-sr.top+8,x2=fig.left-sr.left+fig.width*p[0],y2=fig.top-sr.top+fig.height*p[1];let path=$('#arrowPath');if(path)path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${y1+45}, ${(x1+x2)/2} ${y2-35}, ${x2} ${y2}`)}})}
function norm(v){return String(v??'').trim().replace(',','.').replace(/\s/g,'')}
function shuffle(a){let x=[...a];for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function exerciseBlock(q,answer,key,unit='',hint=''){return `<div class="card"><div class="sectionTitle">${q}</div><div class="answerRow"><input id="${key}" inputmode="decimal"><span>${unit}</span><button class="btn primary" onclick="app.checkExercise('${key}','${answer}')">Проверить</button><button class="hintBtn" onclick="app.showHint('${key}','${hint.replace(/'/g,'&#39;')}')">Подсказка</button></div><div id="${key}Fb" class="feedback"></div><div id="${key}Hint"></div></div>`}
function renderIntro(){let st=introSteps[state.intro];crumb.textContent='Шины · Разбираем условие';progressText.textContent=`Введение · ${state.intro+1} из ${introSteps.length}`;progressBar.style.width=`${(state.intro+1)/introSteps.length*100}%`;let body='';
if(st.type==='read')body=ogeBase()+`<div class="card" style="margin-top:18px"><b>Что ты считаешь важным в этом условии?</b><textarea style="width:100%;min-height:100px;margin-top:10px;border:1px solid var(--line);border-radius:16px;padding:14px" placeholder="Числа, обозначения, факты или мысли..."></textarea><div class="mini">Ответ не проверяется.</div></div>`;
if(st.type==='call'){body=ogeBase(st);setTimeout(()=>positionCallout(st.mark,st.target),30)}
if(st.type==='inch')body=ogeBase()+exerciseBlock('16 дюймов = ? мм','406.4','inchPractice','мм','Умножь 16 на 25,4.');
if(st.type==='diagram')body=`<div class="card split">
<div>
  <div class="sectionTitle">Смотрим на рисунок, а не запоминаем его</div>

  <div class="measureInfo measureB">
    <div class="measureLetter">B</div>
    <div><b>B — ширина шины</b><span class="why">Размер поперёк шины.</span></div>
  </div>

  <div class="measureInfo measureH">
    <div class="measureLetter">H</div>
    <div><b>H — высота боковины</b><span class="why">От края диска до внешнего края шины.</span></div>
  </div>

  <div class="measureInfo measured">
    <div class="measureLetter">d</div>
    <div><b>d — диаметр диска</b><span class="why">Внутренний диаметр.</span></div>
  </div>

  <div class="measureInfo measureD">
    <div class="measureLetter">D</div>
    <div><b>D — диаметр всего колеса</b><span class="why">Полный внешний диаметр.</span></div>
  </div>

  <div class="mini" style="margin-top:14px">
    Цвет обозначения слева совпадает с цветом его пояснения — так проще связывать величины на рисунке.
  </div>
</div>

<div class="figure figureMarked">
  <div class="figureOverlay">
    <div class="overlayB">B</div>
    <div class="overlayH">H</div>
    <div class="overlayd">d</div>
    <div class="overlayD">D</div>
  </div>

  <img src="assets/fig2.png">

  <div class="measureLegend">
  <div class="cap">Рис. 2</div>
</div>
</div>`;
if(st.type==='drag'){let opts=shuffle([['ширина шины','B'],['высота боковины','H'],['диаметр диска','d'],['диаметр всего колеса','D']]);body=`<div class="card split"><div><div class="sectionTitle">Перетащи подписи</div><div class="dragBank">${opts.map(([t,v])=>`<div class="drag" draggable="true" data-v="${v}">${t}</div>`).join('')}</div><div class="dropGrid">${['B','H','d','D'].map(x=>`<div class="drop" data-a="${x}"><b>${x}</b><span>перетащи сюда</span></div>`).join('')}</div><div id="dragFb" class="feedback"></div></div><div class="figure"><img src="assets/fig2.png"><div class="cap">Пользуйся рисунком</div></div></div>`;setTimeout(initDrag,0)}
if(st.type==='formulaTry'){body=`<div class="card split"><div><div class="sectionTitle">Посмотри, что находится «внутри» диаметра колеса</div><p>Что входит в полный диаметр D?</p><div class="builder"><div class="slot"></div><div class="op">+</div><div class="slot"></div><div class="op">+</div><div class="slot"></div></div><div class="tokenBank">${['H','d','H','B','2d'].map(x=>`<button class="token" data-v="${x}">${x}</button>`).join('')}</div><div id="formulaFb" class="feedback"></div><div id="formulaHelp"></div><div id="formulaResult"></div></div><div class="figure"><img src="assets/fig2.png"><div class="cap">Смотри на полный вертикальный диаметр D</div></div></div>`;setTimeout(initFormulaTry,0)}
if(st.type==='radius')body=`<div class="card split"><div><div class="sectionTitle">Диаметр и радиус на рисунке</div><div class="figure"><img src="assets/fig2.png"><div class="cap">D — весь диаметр; R — половина диаметра</div></div><div class="mathBox">$$R=\\frac{D}{2}$$</div></div><div>${exerciseBlock('Диаметр колеса 640 мм. Найди радиус.','320','radiusPractice','мм','Раздели диаметр на 2.')}</div></div>`;
if(st.type==='radiusDiff')body=`<div class="card split"><div><div class="sectionTitle">Сравниваем два колеса</div><div class="figure"><img src="assets/fig2.png"><div class="cap">Для каждого колеса R = D/2</div></div><div class="mathBox">$$D_1=640\\text{ мм},\\qquad D_2=660\\text{ мм}$$</div></div><div>${exerciseBlock('На сколько отличаются радиусы?','10','radiusDiff','мм','Сначала найди разность диаметров, потом раздели её на 2.')}</div></div>`;
if(st.type==='newMark')body=`<div class="card"><div class="sectionTitle">205/55 R16</div><p>Заполни всё самостоятельно.</p><div class="formGrid"><div></div><div class="head">Что найти</div><div class="head">Твой ответ</div><div>1</div><div>Ширина B</div><div><input id="nmB"></div><div>2</div><div>55 — сколько процентов?</div><div><input id="nmp"></div><div>3</div><div>H, мм</div><div><input id="nmH"></div><div>4</div><div>Диаметр диска, дюймы</div><div><input id="nminch"></div><div>5</div><div>d, мм</div><div><input id="nmd"></div><div>6</div><div>D, мм</div><div><input id="nmD"></div><div>7</div><div>Как найти R?</div><div><input id="nmR" placeholder="например D/2"></div></div><div class="nav"><button class="btn primary" onclick="app.checkNewMark()">Проверить всё</button></div><div id="nmFb" class="feedback"></div></div>`;
if(st.type==='introDone')body=`<div class="card"><div class="sectionTitle">Готово ✓</div><p>Ты разобрал маркировку, рисунок, диаметр и радиус. Теперь собираем эти действия в заданиях №1–5.</p></div>`;
appEl.innerHTML=common(st.t,st.l,body,state.intro>0,true);if(['inch','drag','formulaTry','radius','radiusDiff','newMark'].includes(st.type))setTimeout(()=>{if($('#nextBtn'))$('#nextBtn').disabled=true},0);updateChrome()}
let dragged=null;function initDrag(){document.querySelectorAll('.drag').forEach(x=>x.ondragstart=()=>dragged=x);document.querySelectorAll('.drop').forEach(z=>{z.ondragover=e=>e.preventDefault();z.ondrop=e=>{e.preventDefault();if(!dragged)return;if(z.dataset.a===dragged.dataset.v){z.classList.add('good');z.querySelector('span').textContent=dragged.textContent;dragged.classList.add('used');if([...document.querySelectorAll('.drop')].every(d=>d.classList.contains('good'))){$('#dragFb').textContent='Верно!';$('#dragFb').className='feedback ok';$('#nextBtn').disabled=false}}else $('#dragFb').textContent='Пока не сюда. Посмотри на рисунок.';dragged=null}})}
function initFormulaTry(){let vals=[],attempts=0;document.querySelectorAll('.token').forEach(t=>t.onclick=()=>{if(t.classList.contains('used')||vals.length>=3)return;vals.push(t.dataset.v);t.classList.add('used');document.querySelectorAll('.slot')[vals.length-1].textContent=t.dataset.v;if(vals.length===3){if(vals.join('|')==='H|d|H'){$('#formulaFb').textContent='Да!';$('#formulaFb').className='feedback ok';$('#formulaResult').innerHTML='<div class="resultBox">$$D=H+d+H$$ ↓ $$D=d+2H$$</div>';$('#nextBtn').disabled=false;renderMath()}else{attempts++;$('#formulaFb').textContent='Пока не получилось.';$('#formulaHelp').innerHTML=`<div class="hint">${attempts===1?'Посмотри на рисунок сверху вниз: боковина, диск, боковина.':'Подсказка: $$D=H+d+H$$'}</div>`;setTimeout(()=>{vals=[];document.querySelectorAll('.slot').forEach(s=>s.textContent='');document.querySelectorAll('.token').forEach(t=>t.classList.remove('used'));renderMath()},650)}}})}
function checkExercise(id,ans){let el=document.getElementById(id),fb=document.getElementById(id+'Fb');if(norm(el.value)===norm(ans)){fb.textContent='Верно!';fb.className='feedback ok';if($('#nextBtn'))$('#nextBtn').disabled=false}else{fb.textContent='Пока не получилось. Попробуй ещё раз.';fb.className='feedback'}}
function showHint(id,text){document.getElementById(id+'Hint').innerHTML=`<div class="hint">${text}</div>`;renderMath()}
function checkNewMark(){
  let ok=true;
  const checks=[
    ["#nmB",v=>norm(v)==="205"],
    ["#nmp",v=>["55","55%","0.55"].includes(norm(v))],
    ["#nmH",v=>norm(v)==="112.75"],
    ["#nminch",v=>norm(v)==="16"],
    ["#nmd",v=>norm(v)==="406.4"],
    ["#nmD",v=>norm(v)==="631.9"],
    ["#nmR",v=>["D/2","D:2"].includes(String(v).replace(/\s/g,""))]
  ];
  checks.forEach(([sel,test])=>{
    const input=document.querySelector(sel);
    if(!input)return;
    input.style.borderColor=test(input.value)?"#9dcab0":"#d99bb4";
    if(!test(input.value))ok=false;
  });
  const fb=$("#nmFb");
  fb.textContent=ok?"Всё верно!":"Есть ошибка. Красной рамкой отмечено поле, которое нужно проверить.";
  fb.className="feedback "+(ok?"ok":"");
  if(ok && $("#nextBtn")) $("#nextBtn").disabled=false;
}


function tableClick(w,c,el,mode,target){
  const table=el.closest("table");
  table.querySelectorAll("td.table-wrong,td.table-correct,td.selected").forEach(x=>x.classList.remove("table-wrong","table-correct","selected"));

  const vals=tableData.widths.filter(x=>tableData.allowed[x].includes(target));
  const right=mode==="min"?Math.min(...vals):Math.max(...vals);

  // choose the correct feedback under the current lesson block
  const cards=[...document.querySelectorAll("#tableFb1,#tableFb2,#tableFb")];
  const fb=cards.find(x=>x && x.getBoundingClientRect().top>el.closest("table").getBoundingClientRect().bottom-20) || cards.find(Boolean);

  if(c!==target){
    el.classList.add("table-wrong");
    if(fb){fb.textContent=`Это столбец ${c}". В условии нужен столбец ${target}".`;fb.className="feedback";}
    return;
  }

  if(w===right){
    el.classList.add("table-correct");
    if(fb){fb.textContent="Верно!";fb.className="feedback ok";}
    // For №1 page: enable next after at least one correct interaction.
    if($("#nextBtn")) $("#nextBtn").disabled=false;
  } else {
    el.classList.add("table-wrong");
    if(fb){fb.textContent=`Эта ширина разрешена, но нужна ${mode==="min"?"наименьшая":"наибольшая"}.`;fb.className="feedback";}
  }
}

function toggleExplain(id){
  const el=document.getElementById(id);
  if(el) el.classList.toggle("show");
  renderMath();
}

function checkL3(){if(norm($('#l3final').value)==='640.4'){$('#l3Fb').textContent='Верно!';$('#l3Fb').className='feedback ok';$('#nextBtn').disabled=false}else{$('#l3Fb').textContent='Пока не получилось.';$('#l3Fb').className='feedback'}}
function nextL3Hint(){let n=(state.hints.l3||0)+1;state.hints.l3=n;let h=['Сначала найди высоту боковины H.','Теперь переведи диаметр диска: \\(d=16\\cdot25{,}4\\).','Используй \\(D=d+2H\\).'];$('#l3Hint').innerHTML=`<div class="hint">${h[Math.min(n-1,h.length-1)]}</div>`;renderMath()}
function checkL4(){let ok=norm($('#l4h1').value)==='117'&&norm($('#l4h2').value)==='112.75'&&norm($('#l4d1').value)==='406.4'&&norm($('#l4d2').value)==='406.4'&&norm($('#l4D1').value)==='640.4'&&norm($('#l4D2').value)==='631.9'&&norm($('#l4diff').value)==='8.5';$('#l4Fb').textContent=ok?'Верно!':'Есть ошибка. Проверь промежуточные значения.';$('#l4Fb').className='feedback '+(ok?'ok':'');if(ok)$('#nextBtn').disabled=false}
function nextL4Hint(){let n=(state.hints.l4||0)+1;state.hints.l4=n;let h=['Начни с H для каждой маркировки.','Диаметр диска у обеих шин одинаковый: R16.','После H и d используй \\(D=d+2H\\).','В конце сравни D₁ и D₂ и вычти большее − меньшее.'];$('#l4Hint').innerHTML=`<div class="hint">${h[Math.min(n-1,h.length-1)]}</div>`;renderMath()}
function examCondition(){return `<div class="card stickyCondition"><div class="sectionTitle">Общее условие</div><div class="ogeText"><p>Автомобильное колесо состоит из диска и шины. В маркировке 195/60 R16 первое число — ширина, второе — высота боковины в процентах от ширины, число после R — диаметр диска в дюймах. 1 дюйм = 25,4 мм.</p></div><div class="figure"><img src="assets/fig1.png"></div><div class="figure"><img src="assets/fig2.png"></div>${tireTable(false)}</div>`}
const examQs={1:{q:'Для дисков диаметром 16 дюймов найдите наименьшую разрешённую ширину шины.',a:'195',u:'мм',h:['Найди столбец 16".','Посмотри только разрешённые ячейки.','Нужна наименьшая ширина.']},2:{q:'Для шины 205/55 R16 найдите высоту боковины.',a:'112.75',u:'мм',h:['Второе число — процент от ширины.','Используй $$H=\\frac{B\\cdot p}{100}$$']},3:{q:'Найдите диаметр заводского колеса с шиной 195/60 R16.',a:'640.4',u:'мм',h:['Найди H.','Переведи d из дюймов в мм.','Используй \\(D=d+2H\\).']},4:{q:'После замены 195/60 R16 на 205/55 R16 на сколько миллиметров уменьшится диаметр?',a:'8.5',u:'мм',h:['Найди D₁ и D₂.','Сравни их.','Вычти новое значение из старого.']},5:{q:'На сколько процентов уменьшится пробег за один оборот после этой замены? Округлите до десятых.',a:'1.3',u:'%',h:['За один оборот колесо проходит длину окружности.','Процент изменения окружности равен проценту изменения диаметра.','Старое D₁ — 100%, новое D₂ — x%.','После нахождения x вычисли 100−x.']}};
function renderExam(){crumb.textContent='Шины · Решаю самостоятельно';progressText.textContent='Самостоятельный вариант';progressBar.style.width='100%';let q=examQs[state.examQ],saved=state.examAnswers[state.examQ]??'';let body=`<div class="examLayout">${examCondition()}<div><div class="qnav">${[1,2,3,4,5].map(n=>`<button class="${state.examQ===n?'active':''} ${state.examAnswers[n]!==undefined?'done':''}" onclick="app.examGoto(${n})">№${n}</button>`).join('')}</div><div class="card"><span class="chip">Задание №${state.examQ}</span><h2>${q.q}</h2><div class="answerRow"><input id="examInput" value="${saved}"><span>${q.u}</span><button class="hintBtn" onclick="app.examHint()">Подсказка</button></div><div id="examHint"></div></div><div class="nav"><button class="btn secondary" onclick="app.examPrev()">← Предыдущее</button><button class="btn primary" onclick="app.saveExam()">${state.examQ<5?'Сохранить и дальше →':'Завершить вариант'}</button></div></div></div>`;appEl.innerHTML=common('Решаю самостоятельно','Текст, рисунок и таблица всегда рядом.',body,false,false);updateChrome()}
function renderResults(){let score=0;[1,2,3,4,5].forEach(n=>{if(norm(state.examAnswers[n])===norm(examQs[n].a))score++});crumb.textContent='Шины · Результат';progressText.textContent=`${score} из 5`;progressBar.style.width='100%';let rows=[1,2,3,4,5].map(n=>{let ok=norm(state.examAnswers[n])===norm(examQs[n].a);return `<div class="reviewRow"><div><b>№${n}</b> <span class="${ok?'good':'bad'}">${ok?'✓ Верно':'✕ Ошибка'}</span>${state.examReviewed[n]?'<span class="reviewTag">исправлялось после разбора</span>':''}</div>${ok?'':`<button class="btn secondary" onclick="app.review(${n})">Разобрать</button>`}</div>`}).join('');appEl.innerHTML=common(score===5?'Шины пройдены ✓':'Есть что разобрать',`Результат: ${score} из 5`,`<div class="card"><div class="score">${score} из 5</div>${rows}</div>`,false,false);updateChrome()}
const app={render(){if(state.section==='intro')renderIntro();if(state.section==='lesson')renderLesson();if(state.section==='exam')renderExam();if(state.section==='results')renderResults()},goHome(){state.section='intro';state.intro=0;state.reviewTarget=null;this.render()},prev(){if(state.section==='intro'&&state.intro>0){state.intro--;this.render();return}if(state.section==='lesson'){if(state.lessonStep>0)state.lessonStep--;else if(state.lesson>1){state.lesson--;state.lessonStep=lessons[state.lesson].steps-1}else{state.section='intro';state.intro=introSteps.length-1}this.render()}},next(){if(state.section==='intro'){if(state.intro<introSteps.length-1){state.intro++;this.render()}else{state.section='lesson';state.lesson=1;state.lessonStep=0;this.render()}return}if(state.section==='lesson'){let L=lessons[state.lesson];if(state.lessonStep<L.steps-1){state.lessonStep++;this.render();return}if(state.reviewTarget===state.lesson){let q=state.reviewTarget;state.reviewTarget=null;state.section='exam';state.examQ=q;state.examReviewed[q]=true;this.render();return}if(state.lesson<5){state.lesson++;state.lessonStep=0;this.render()}else{state.section='exam';state.examQ=1;this.render()}}},checkExercise,showHint,checkNewMark,tableClick,toggleExplain,checkL3,nextL3Hint,checkL4,nextL4Hint,openLesson(n){state.section='lesson';state.lesson=n;state.lessonStep=0;state.reviewTarget=null;this.render()},examGoto(n){state.examAnswers[state.examQ]=$('#examInput')?.value??state.examAnswers[state.examQ];state.examQ=n;this.render()},examPrev(){state.examAnswers[state.examQ]=$('#examInput')?.value??state.examAnswers[state.examQ];if(state.examQ>1)state.examQ--;this.render()},saveExam(){state.examAnswers[state.examQ]=$('#examInput').value;if(state.examQ<5){state.examQ++;this.render()}else{state.section='results';this.render()}},examHint(){let k='e'+state.examQ,n=(state.hints[k]||0)+1;state.hints[k]=n;let a=examQs[state.examQ].h;$('#examHint').innerHTML=`<div class="hint">${a[Math.min(n-1,a.length-1)]}</div>`;renderMath()},review(n){state.reviewTarget=n;state.section='lesson';state.lesson=n;state.lessonStep=0;this.render()}};
window.app = app;
window.addEventListener('DOMContentLoaded',()=>window.app.render());


// v4 navigation safety: explicit global functions for inline controls.
window.goNext = () => window.app.next();
window.goPrev = () => window.app.prev();
