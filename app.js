const $=s=>document.querySelector(s);
const appEl=$('#app'),sidebar=$('#sidebar'),crumb=$('#crumb'),progressText=$('#progressText'),progressBar=$('#progressBar');
const state={section:'intro',intro:0,lesson:1,lessonStep:0,hints:{},examQ:1,examAnswers:{},examReviewed:{},reviewTarget:null,newMark:{},radiusFormulaCorrect:false,tapDragSelected:null,mobileMenu:false};
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
function renderMath(){
  if(window.renderMathInElement)
    renderMathInElement(document.body,{
      delimiters:[
        {left:'$$',right:'$$',display:true},
        {left:'\\[',right:'\\]',display:true},
        {left:'\\(',right:'\\)',display:false}
      ],
      throwOnError:false
    })
}function common(t,l,b,back=true,next=true,label='Дальше →'){
  const mobileNav=`
    <div class="mobileSectionBar">
      <button class="btn secondary mobileMenuBtn" onclick="app.toggleMobileMenu()">☰ Разделы</button>
      <span class="mobileWhere">${crumb?.textContent||'Шины'}</span>
    </div>
    <div id="mobileNavPanel" class="mobileNavPanel ${state.mobileMenu?'open':''}">
      ${sidebarHtml(true)}
    </div>`;
  return `${mobileNav}<h1>${t}</h1><div class="lead">${l}</div>${b}<div class="nav">${back?'<button class="btn secondary" onclick="window.goPrev()">Назад</button>':'<span></span>'}${next?`<button id="nextBtn" class="btn primary" onclick="window.goNext()">${label}</button>`:''}</div>`;
}

function sidebarHtml(mobile=false){
  let out=mobile?'<div class="mobileNavTitle">Перейти к разделу</div>':'<div class="sideTitle">Шины</div>';
  const groups=[
    ['Разбираем условие',[
      ['Введение','intro',0],
      ['Маркировка','intro',1],
      ['Дюймы','intro',5],
      ['Рисунок','intro',7],
      ['Диаметр и радиус','intro',10]
    ]],
    ['Учимся решать',[
      ['Задание №1','lesson',1],
      ['Задание №2','lesson',2],
      ['Задание №3','lesson',3],
      ['Задание №4','lesson',4],
      ['Задание №5','lesson',5]
    ]],
    ['Проверяем себя',[
      ['Самостоятельный вариант','exam',1],
      ['Результат','results',1]
    ]]
  ];

  groups.forEach(([g,items])=>{
    out+=`<div class="sideGroup">${g}</div>`;
    items.forEach(([label,sec,val])=>{
      let active=false,done=false;
      if(sec==='intro'){
        active=state.section==='intro'&&state.intro>=val&&state.intro<val+4;
        done=state.section!=='intro'||state.intro>val;
      }
      if(sec==='lesson'){
        active=state.section==='lesson'&&state.lesson===val;
        done=(state.section==='lesson'&&state.lesson>val)||['exam','results'].includes(state.section);
      }
      if(sec==='exam'){
        active=state.section==='exam';
        done=state.section==='results';
      }
      if(sec==='results') active=state.section==='results';

      const disabled=sec==='results'&&Object.keys(state.examAnswers).length===0;
      out+=`<button type="button" class="sideItem navSideBtn ${active?'active':''} ${done?'done':''}" ${disabled?'disabled':''} data-nav-sec="${sec}" data-nav-val="${val}">${label}</button>`;
    });
  });
  return out;
}


function bindSectionNav(){
  document.querySelectorAll('[data-nav-sec]').forEach(btn=>{
    btn.onclick=(e)=>{
      e.preventDefault();
      e.stopPropagation();
      if(btn.disabled)return;
      const sec=btn.dataset.navSec;
      const val=Number(btn.dataset.navVal);
      window.app.navTo(sec,val);
    };
  });
}

function updateChrome(){
  sidebar.innerHTML=sidebarHtml(false);
  const mobilePanel=document.getElementById('mobileNavPanel');
  if(mobilePanel){
    mobilePanel.classList.toggle('open',!!state.mobileMenu);
  }
  bindSectionNav();
  renderMath();
}

function fig2Visual(kind='dimensions',focus=null,caption='Рис. 2'){
  const focusHtml=focus?`<div class="focusTarget focus-${focus}">${focus}</div>`:'';
  const dimensionSvg=kind==='dimensions'?`
    <svg class="figOverlaySvg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id="arrB" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L5,2.5 L0,5 Z" class="fillB"/></marker>
        <marker id="arrH" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L5,2.5 L0,5 Z" class="fillH"/></marker>
        <marker id="arrd" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L5,2.5 L0,5 Z" class="filld"/></marker>
        <marker id="arrD" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L5,2.5 L0,5 Z" class="fillD"/></marker>
      </defs>
      <line x1="32" y1="84" x2="47" y2="84" class="strokeB" marker-start="url(#arrB)" marker-end="url(#arrB)"/>
      <line x1="13" y1="13" x2="13" y2="31" class="strokeH" marker-start="url(#arrH)" marker-end="url(#arrH)"/>
      <line x1="13" y1="63" x2="13" y2="81" class="strokeH" marker-start="url(#arrH)" marker-end="url(#arrH)"/>
      <line x1="20" y1="31" x2="20" y2="63" class="stroked" marker-start="url(#arrd)" marker-end="url(#arrd)"/>
      <line x1="6.5" y1="13" x2="6.5" y2="81" class="strokeD" marker-start="url(#arrD)" marker-end="url(#arrD)"/>
      <text x="39.5" y="81" class="labelB">B</text>
      <text x="15" y="22" class="labelH">H</text>
      <text x="22" y="48" class="labeld">d</text>
      <text x="8" y="48" class="labelD">D</text>
    </svg>`:'';
  const radiusSvg=kind==='radius'?`
    <svg class="figOverlaySvg radiusOverlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id="arrFullD" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L5,2.5 L0,5 Z" class="fillD"/></marker>
        <marker id="arrR" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto-start-reverse"><path d="M0,0 L5,2.5 L0,5 Z" class="fillB"/></marker>
      </defs>
      <line x1="6.5" y1="13" x2="6.5" y2="81" class="strokeD" marker-start="url(#arrFullD)" marker-end="url(#arrFullD)"/>
      <circle cx="39" cy="47" r="1.6" class="centerDot"/>
      <line x1="39" y1="47" x2="39" y2="14" class="strokeB" marker-end="url(#arrR)"/>
      <text x="8" y="48" class="labelD">D</text>
      <text x="42" y="30" class="labelB">R</text>
    </svg>`:'';
  return `<div class="figure annotatedFigure"><div class="figImageWrap"><img src="assets/fig2.png" alt="Схема автомобильного колеса с обозначениями">${dimensionSvg}${radiusSvg}${focusHtml}</div><div class="cap">${caption}</div></div>`;
}

function ogeBase(call=null){
  return `<div class="stage card" id="ogeStage">
    <svg id="arrowLayer" class="arrowLayer">
      <defs>
        <marker id="arrowHead" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="#8b68d2"></path>
        </marker>
      </defs>
      <path id="arrowPath" d="" fill="none" stroke="#8b68d2" stroke-width="3" marker-end="url(#arrowHead)"></path>
    </svg>
    <div class="grid2">
      <div class="ogeText">
        <p>Автомобильное колесо представляет из себя металлический диск с установленной на него резиновой шиной. Диаметр диска совпадает с диаметром внутреннего отверстия в шине.</p>
        <p>Для маркировки автомобильных шин применяется единая система обозначений. Например, <span id="m195" class="mark">195</span>/<span id="m65" class="mark">65</span> <span id="mR" class="mark">R</span><span id="m15" class="mark">15</span>. Первое число означает ширину шины в миллиметрах (размер B на рис. 2). Второе число — высота боковины H в процентах от ширины шины.</p>
        <p>Например, шина 195/65 R15 имеет B=195 мм и H=195·0,65=126,75 мм.</p>
        <p>Буква R означает, что шина имеет радиальную конструкцию.</p>
        <p>За буквой R следует диаметр диска d в дюймах (<span id="inch" class="mark">в одном дюйме 25,4 мм</span>). Общий диаметр колеса D можно найти, зная диаметр диска и высоту боковины.</p>
        <p>Завод устанавливает на автомобили колёса с шинами 195/60 R16.</p>
      </div>
      <div>
        <div class="figure"><img src="assets/fig1.png" alt="Маркировка шины"><div class="cap">Рис. 1 · маркировка на шине</div></div>
        <div id="fig2box">${fig2Visual('dimensions',call?.target||null,'Рис. 2 · B, H, d и D')}</div>
      </div>
    </div>
    ${call?`<div id="callout" class="callout"><h3>${call.head}</h3><p>${call.text}</p>${call.formula?`<div class="formula">$$${call.formula}$$</div>`:''}${call.warn?`<div class="warn">${call.warn}</div>`:''}</div>`:''}
  </div>`;
}
function positionCallout(markId,target){
  requestAnimationFrame(()=>{
    const stage=$('#ogeStage'),call=$('#callout'),mark=document.getElementById(markId);
    if(!stage||!call||!mark)return;
    mark.classList.add('active');

    const isMobile=window.matchMedia('(max-width: 760px)').matches;
    if(isMobile){
      call.style.left='';
      call.style.top='';
      return;
    }

    const sr=stage.getBoundingClientRect(),mr=mark.getBoundingClientRect();
    let left=mr.left-sr.left+mr.width/2-40;
    let top=mr.top-sr.top-call.offsetHeight-22;
    if(top<-135)top=-135;
    if(left+call.offsetWidth>sr.width-18)left=sr.width-call.offsetWidth-18;
    if(left<18)left=18;
    call.style.left=left+'px';
    call.style.top=top+'px';

    if(target){
      const targetEl=document.querySelector(`#fig2box .focus-${target}`);
      const cr=call.getBoundingClientRect();
      const tr=targetEl?.getBoundingClientRect();
      if(!tr)return;
      const x1=cr.left-sr.left+45;
      const y1=cr.bottom-sr.top+8;
      const x2=tr.left-sr.left+tr.width/2;
      const y2=tr.top-sr.top+tr.height/2;
      const path=$('#arrowPath');
      if(path)path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${y1+42}, ${(x1+x2)/2} ${y2-30}, ${x2} ${y2}`);
    }
  });
}
function norm(v){return String(v??'').trim().replace(',','.').replace(/\s/g,'')}
function shuffle(a){let x=[...a];for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function exerciseBlock(q,answer,key,unit='',hint=''){return `<div class="card"><div class="sectionTitle">${q}</div><div class="answerRow"><input id="${key}" inputmode="decimal"><span>${unit}</span><button class="btn primary" onclick="app.checkExercise('${key}','${answer}')">Проверить</button><button class="hintBtn" onclick="app.showHint('${key}','${hint.replace(/'/g,'&#39;')}')">Подсказка</button></div><div id="${key}Fb" class="feedback"></div><div id="${key}Hint"></div></div>`}
function typesetMath(scope = appEl) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise([scope]).catch(() => {});
  }
}
function renderIntro(){let st=introSteps[state.intro];crumb.textContent='Шины · Разбираем условие';progressText.textContent=`Введение · ${state.intro+1} из ${introSteps.length}`;progressBar.style.width=`${(state.intro+1)/introSteps.length*100}%`;let body='';
if(st.type==='read')body=ogeBase()+`<div class="card" style="margin-top:18px"><b>Что ты считаешь важным в этом условии?</b><textarea style="width:100%;min-height:100px;margin-top:10px;border:1px solid var(--line);border-radius:16px;padding:14px" placeholder="Числа, обозначения, факты или мысли..."></textarea><div class="mini">Ответ не проверяется.</div></div>`;
if(st.type==='call'){body=ogeBase(st);setTimeout(()=>positionCallout(st.mark,st.target),30)}
if(st.type==='inch')body=ogeBase()+exerciseBlock('16 дюймов = ? мм','406.4','inchPractice','мм','Умножь 16 на 25,4.');
if(st.type==='diagram')body=`
<div class="card split">

  <div>
    <div class="sectionTitle">Смотрим на рисунок, а не запоминаем его</div>

    <div class="measureInfo measureB">
      <div class="measureLetter">B</div>
      <div>
        <b>B — ширина шины</b>
        <span class="why">Размер поперёк шины.</span>
      </div>
    </div>

    <div class="measureInfo measureH">
      <div class="measureLetter">H</div>
      <div>
        <b>H — высота боковины</b>
        <span class="why">От края диска до внешнего края шины.</span>
      </div>
    </div>

    <div class="measureInfo measured">
      <div class="measureLetter">d</div>
      <div>
        <b>d — диаметр диска</b>
        <span class="why">Внутренний диаметр.</span>
      </div>
    </div>

    <div class="measureInfo measureD">
      <div class="measureLetter">D</div>
      <div>
        <b>D — диаметр всего колеса</b>
        <span class="why">Полный внешний диаметр.</span>
      </div>
    </div>

    <div class="mini" style="margin-top:14px">
      Цвет обозначения слева совпадает с цветом его пояснения.
    </div>
  </div>

  ${fig2Visual('dimensions',null,'Рис. 2 · цветом показано, где находятся B, H, d и D')}

</div>`;

  
if(st.type==='drag'){
  let opts=shuffle([['ширина шины','B'],['высота боковины','H'],['диаметр диска','d'],['диаметр всего колеса','D']]);
  body=`<div class="card split">
    <div>
      <div class="sectionTitle">Сопоставь подписи</div>
      <p class="mini">На компьютере можно перетаскивать. На телефоне: нажми на подпись, затем на нужную букву.</p>
      <div class="dragBank">${opts.map(([t,v])=>`<button type="button" class="drag" draggable="true" data-v="${v}" onclick="app.selectDrag(this)">${t}</button>`).join('')}</div>
      <div class="dropGrid">${['B','H','d','D'].map(x=>`<button type="button" class="drop" data-a="${x}" onclick="app.tapDrop(this)"><b>${x}</b><span>выбери подпись</span></button>`).join('')}</div>
      <div id="dragFb" class="feedback"></div>
    </div>
    ${fig2Visual('dimensions',null,'Пользуйся рисунком')}
  </div>`;
  setTimeout(initDrag,0);
}
if(st.type==='formulaTry'){body=`<div class="card split"><div><div class="sectionTitle">Посмотри, что находится «внутри» диаметра колеса</div><p>Что входит в полный диаметр D?</p><div class="builder"><div class="slot"></div><div class="op">+</div><div class="slot"></div><div class="op">+</div><div class="slot"></div></div><div class="tokenBank">${['H','d','H','B','2d'].map(x=>`<button class="token" data-v="${x}">${x}</button>`).join('')}</div><div id="formulaFb" class="feedback"></div><div id="formulaHelp"></div><div id="formulaResult"></div></div>${fig2Visual('dimensions',null,'Смотри на фиолетовый D: сверху H, затем d, затем H')}</div>`;setTimeout(initFormulaTry,0)}
if(st.type==='radius')body=`
<div class="card split">
  <div>
    <div class="sectionTitle">Диаметр и радиус на рисунке</div>
    ${fig2Visual('radius',null,'D — весь диаметр; R — от центра колеса до внешнего края')}
    <div class="mathBox">$$R=\\frac{D}{2}$$</div>
  </div>
  <div>
    <div class="sectionTitle">Задание</div>
    <p>Диаметр колеса равен <b>640 мм</b>. Найди радиус колеса.</p>
    ${exerciseBlock('Радиус колеса:','320','radiusPractice','мм','Радиус — половина диаметра.')}
  </div>
</div>`;if(st.type==='radiusDiff')body=`
<div class="card">

  <div class="sectionTitle">Задание</div>

  <p>
    Даны два колеса.
    Диаметр первого колеса
    <b>D₁ = 640 мм</b>,
    диаметр второго колеса
    <b>D₂ = 660 мм</b>.
  </p>

  <p>
    <b>На сколько миллиметров отличаются их радиусы?</b>
  </p>

  <div class="mathBox">
    $$D_1=640\\text{ мм},\\qquad D_2=660\\text{ мм}$$
  </div>

  <div class="split">

    <div>
      <div class="figure">
        <img src="assets/fig2.png">
        <div class="cap">
          Для каждого колеса:
          \\(R=\\frac D2\\)
        </div>
      </div>
    </div>

    <div>
      ${exerciseBlock(
        'Найди разность радиусов.',
        '10',
        'radiusDiff',
        'мм',
        'Сначала найди разность диаметров, потом подумай, как связаны диаметр и радиус.'
      )}
    </div>

  </div>

</div>`;
if(st.type==='newMark')body=`
<div class="card">

  <div class="sectionTitle">
    Новая маркировка: 205/55 R16
  </div>

  <p>
    Теперь попробуй самостоятельно разобрать новую маркировку
    и найти основные размеры колеса.
  </p>

  <div class="checkGrid">

    <div class="row">
      <div>
        <b>1. Какова ширина шины?</b>
      </div>

      <input
        id="nmB"
        placeholder="Ответ"
      >

      <span>мм</span>
    </div>


    <div class="row">
      <div>
        <b>2. Какую часть от ширины составляет высота боковины?</b>
        <div class="mini">
          Посмотри на второе число маркировки.
        </div>
      </div>

      <input
        id="nmp"
        placeholder="Ответ"
      >

      <span>%</span>
    </div>


    <div class="row">
      <div>
        <b>3. Найди высоту боковины H.</b>
      </div>

      <input
        id="nmH"
        placeholder="Ответ"
      >

      <span>мм</span>
    </div>


    <div class="row">
      <div>
        <b>4. Какой диаметр диска указан в маркировке?</b>
      </div>

      <input
        id="nminch"
        placeholder="Ответ"
      >

      <span>дюймов</span>
    </div>


    <div class="row">
      <div>
        <b>5. Переведи диаметр диска в миллиметры.</b>
      </div>

      <input
        id="nmd"
        placeholder="Ответ"
      >

      <span>мм</span>
    </div>


    <div class="row">
      <div>
        <b>6. Найди полный диаметр колеса D.</b>
      </div>

      <input
        id="nmD"
        placeholder="Ответ"
      >

      <span>мм</span>
    </div>

  </div>


  <div class="lessonSection">

    <div class="sectionTitle">
      7. Как найти радиус, если известен диаметр?
    </div>

    <div class="choiceRow">

      <button
        class="choice"
        onclick="app.checkRadiusFormula(this, false)"
      >
        \\(R=D\\cdot2\\)
      </button>

      <button
        class="choice"
        onclick="app.checkRadiusFormula(this, true)"
      >
        \\(R=\\frac{D}{2}\\)
      </button>

      <button
        class="choice"
        onclick="app.checkRadiusFormula(this, false)"
      >
        \\(R=D+2\\)
      </button>

    </div>

    <div
      id="radiusFormulaFb"
      class="feedback"
    ></div>

  </div>


  <div class="nav">

    <button
      class="btn primary"
      onclick="app.checkNewMark()"
    >
      Проверить ответы
    </button>

  </div>

  <div
    id="nmFb"
    class="feedback"
  ></div>

</div>`;if(st.type==='introDone')body=`<div class="card"><div class="sectionTitle">Готово ✓</div><p>Ты разобрал маркировку, рисунок, диаметр и радиус. Теперь собираем эти действия в заданиях №1–5.</p></div>`;
appEl.innerHTML=common(st.t,st.l,body,state.intro>0,true); if (st.type === 'introDone') {
  const backBtn = document.querySelector('.nav .secondary');
  const nextBtn = document.querySelector('#nextBtn');

  if (backBtn) {
    backBtn.onclick = () => {
      state.intro--;
      renderIntro();
    };
  }

  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.onclick = () => {
      state.section = 'lesson';
      state.lesson = 1;
      state.lessonStep = 0;
      renderLesson();
    };
  }
}
if(['inch','drag','formulaTry','radius','radiusDiff','newMark'].includes(st.type))setTimeout(()=>{if($('#nextBtn'))$('#nextBtn').disabled=true},0);updateChrome()}
let dragged=null;

function applyDrop(drop,drag){
  if(!drop||!drag)return;
  const fb=$('#dragFb');
  if(drop.dataset.a===drag.dataset.v){
    drop.classList.add('good');
    drop.querySelector('span').textContent=drag.textContent;
    drag.classList.add('used');
    drag.classList.remove('selectedTap');
    state.tapDragSelected=null;
    if([...document.querySelectorAll('.drop')].every(d=>d.classList.contains('good'))){
      fb.textContent='Верно! Все обозначения сопоставлены.';
      fb.className='feedback ok';
      if($('#nextBtn'))$('#nextBtn').disabled=false;
    }else{
      fb.textContent='Верно. Выбери следующую подпись.';
      fb.className='feedback ok';
    }
  }else{
    drop.classList.add('table-wrong');
    setTimeout(()=>drop.classList.remove('table-wrong'),450);
    fb.textContent='Пока не сюда. Посмотри на рисунок.';
    fb.className='feedback';
  }
}

function initDrag(){
  document.querySelectorAll('.drag').forEach(x=>{
    x.ondragstart=()=>{dragged=x;};
  });
  document.querySelectorAll('.drop').forEach(z=>{
    z.ondragover=e=>e.preventDefault();
    z.ondrop=e=>{
      e.preventDefault();
      if(!dragged)return;
      applyDrop(z,dragged);
      dragged=null;
    };
  });
}

function selectDrag(el){
  if(el.classList.contains('used'))return;
  document.querySelectorAll('.drag').forEach(x=>x.classList.remove('selectedTap'));
  el.classList.add('selectedTap');
  state.tapDragSelected=el;
  const fb=$('#dragFb');
  if(fb){
    fb.textContent=`Выбрано: «${el.textContent}». Теперь нажми на нужную букву.`;
    fb.className='feedback';
  }
}

function tapDrop(drop){
  if(drop.classList.contains('good'))return;
  if(!state.tapDragSelected){
    const fb=$('#dragFb');
    if(fb){
      fb.textContent='Сначала нажми на одну из подписей сверху.';
      fb.className='feedback';
    }
    return;
  }
  applyDrop(drop,state.tapDragSelected);
}
function initFormulaTry(){let vals=[],attempts=0;document.querySelectorAll('.token').forEach(t=>t.onclick=()=>{if(t.classList.contains('used')||vals.length>=3)return;vals.push(t.dataset.v);t.classList.add('used');document.querySelectorAll('.slot')[vals.length-1].textContent=t.dataset.v;if(vals.length===3){if(vals.join('|')==='H|d|H'){$('#formulaFb').textContent='Да!';$('#formulaFb').className='feedback ok';$('#formulaResult').innerHTML='<div class="resultBox">$$D=H+d+H$$ ↓ $$D=d+2H$$</div>';$('#nextBtn').disabled=false;renderMath()}else{attempts++;$('#formulaFb').textContent='Пока не получилось.';$('#formulaHelp').innerHTML=`<div class="hint">${attempts===1?'Посмотри на рисунок сверху вниз: боковина, диск, боковина.':'Подсказка: $$D=H+d+H$$'}</div>`;setTimeout(()=>{vals=[];document.querySelectorAll('.slot').forEach(s=>s.textContent='');document.querySelectorAll('.token').forEach(t=>t.classList.remove('used'));renderMath()},650)}}})}
function checkExercise(id,ans){let el=document.getElementById(id),fb=document.getElementById(id+'Fb');if(norm(el.value)===norm(ans)){fb.textContent='Верно!';fb.className='feedback ok';if($('#nextBtn'))$('#nextBtn').disabled=false}else{fb.textContent='Пока не получилось. Попробуй ещё раз.';fb.className='feedback'}}
function showHint(id,text){document.getElementById(id+'Hint').innerHTML=`<div class="hint">${text}</div>`;renderMath()}
function checkRadiusFormula(button, correct) {

  document
    .querySelectorAll('.choiceRow .choice')
    .forEach(btn => {
      btn.classList.remove('correct', 'wrong');
    });

  const fb = document.getElementById('radiusFormulaFb');

  if (correct) {

    button.classList.add('correct');

    fb.textContent =
      'Верно! Радиус — половина диаметра.';

    fb.className = 'feedback ok';

    state.radiusFormulaCorrect = true;

    checkNewMark();

  } else {

    button.classList.add('wrong');

    fb.textContent =
      'Пока не так. Вспомни: диаметр состоит из двух радиусов.';

    fb.className = 'feedback';

    state.radiusFormulaCorrect = false;
  }
}
function checkNewMark(){
  let ok=true;
  const checks=[
    ["#nmB",v=>norm(v)==="205"],
    ["#nmp",v=>["55","55%","0.55"].includes(norm(v))],
    ["#nmH",v=>norm(v)==="112.75"],
    ["#nminch",v=>norm(v)==="16"],
    ["#nmd",v=>norm(v)==="406.4"],
    ["#nmD",v=>norm(v)==="631.9"],
  ];
  checks.forEach(([sel,test])=>{
    const input=document.querySelector(sel);
    if(!input)return;
    input.style.borderColor=test(input.value)?"#9dcab0":"#d99bb4";
    if(!test(input.value))ok=false;
  });
const fb = $("#nmFb");

if (!ok) {
  fb.textContent =
    "Есть ошибка. Красной рамкой отмечено поле, которое нужно проверить.";
  fb.className = "feedback";
  return;
}

if (!state.radiusFormulaCorrect) {
  fb.textContent = "Числа верные ✓ Теперь выбери формулу для радиуса.";
  fb.className = "feedback";
  return;
}

fb.textContent = "Всё верно!";
fb.className = "feedback ok";

if ($("#nextBtn")) {
  $("#nextBtn").disabled = false;
}
}
const tableData = {
  widths: [175,185,195,205,215,225],
  cols: [14,15,16,17],

  allowed: {
    "175":[14,15],
    "185":[14,15],
    "195":[15,16],
    "205":[15,16],
    "215":[16,17],
    "225":[17]
  }
};


function tireTable(interactive=false,target=null,mode=null){

  return `
  <div class="tableWrap">

    <table>

      <thead>
        <tr>
          <th>Ширина, мм</th>

          ${tableData.cols
            .map(c=>`<th>${c}"</th>`)
            .join('')}

        </tr>
      </thead>


      <tbody>

        ${tableData.widths.map(w=>`

          <tr>

            <th>${w}</th>

            ${tableData.cols.map(c=>{

              const allowed =
                tableData.allowed[w].includes(c);

              return `
                <td
                  class="${allowed?'allowed':'dim'}"
                  ${interactive
                    ? `onclick="app.tableClick(
                        ${w},
                        ${c},
                        this,
                        '${mode}',
                        ${target}
                      )"`
                    : ''
                  }
                >

                  ${
                    allowed
                    ? `${w}/55 R${c}`
                    : '—'
                  }

                </td>
              `;

            }).join('')}

          </tr>

        `).join('')}

      </tbody>

    </table>

  </div>
  `;
}


function lessonTabs(){

  return `
  <div class="choiceRow">

    ${[1,2,3,4,5].map(n=>`

      <button
        class="choice ${state.lesson===n?'correct':''}"
        onclick="app.openLesson(${n})"
      >
        №${n}
      </button>

    `).join('')}

  </div>
  `;
}


function renderLesson(){

  const L = lessons[state.lesson];

  crumb.textContent =
    `Шины · Задание №${state.lesson}`;

  progressText.textContent =
    `Обучение №${state.lesson}`;

  progressBar.style.width =
    `${state.lesson/5*100}%`;

  let body = lessonTabs();


  /* =========================
     ЗАДАНИЕ №1
  ========================= */

  if(state.lesson === 1){

    body += `
    <div class="card">

      <div class="lessonSection">

        <div class="sectionTitle">
          Как работать с таблицей
        </div>

        <p>
          Сначала смотри, какой диаметр диска дан в условии.
          Затем находи соответствующий столбец.
        </p>

        <p>
          После этого выбирай
          <b>наименьшую</b> или
          <b>наибольшую</b> разрешённую ширину —
          в зависимости от вопроса.
        </p>

      </div>


      <div class="lessonSection">

        <div class="sectionTitle">
          Пример 1 · наименьшая ширина
        </div>

        <p>
          Для дисков диаметром
          <b>16 дюймов</b>
          найдите
          <b>наименьшую</b>
          разрешённую ширину шины.
        </p>

        ${tireTable(true,16,'min')}

        <div
          id="tableFb1"
          class="feedback"
        ></div>

      </div>


      <div class="lessonSection">

        <div class="sectionTitle">
          Пример 2 · наибольшая ширина
        </div>

        <p>
          Для дисков диаметром
          <b>15 дюймов</b>
          найдите
          <b>наибольшую</b>
          разрешённую ширину шины.
        </p>

        ${tireTable(true,15,'max')}

        <div
          id="tableFb2"
          class="feedback"
        ></div>

      </div>

    </div>
    `;
  }


  /* =========================
     ЗАДАНИЕ №2
  ========================= */

  if(state.lesson === 2){

    body += `
    <div class="card">

      <div class="lessonSection split">

        <div>

          <div class="sectionTitle">
            Прототип А · высота боковины
          </div>

          <p>
            Рассмотрим маркировку
            <b>210/55 R17</b>.
          </p>

          <p>
            <b>B</b> — ширина шины.
            Это первое число маркировки.
          </p>

          <p>
            <b>p</b> — процент.
            Это второе число маркировки.
          </p>

          <p>
            Высота боковины составляет
            <b>p%</b> от ширины B.
          </p>

          <div class="mathBox">
            $$H=
            B\\cdot\\frac{p}{100}
            =
            \\frac{B\\cdot p}{100}$$
          </div>

          <p>
            Например, для 210/55:
          </p>

          <div class="mathBox">
            $$B=210,\\qquad p=55$$
          </div>

          ${
            exerciseBlock(
              'Для шины 210/55 R17 найди H.',
              '115.5',
              'l2h',
              'мм',
              'B = 210, p = 55. Используй формулу H = B·p/100.'
            )
          }

        </div>


        ${fig2Visual('dimensions',null,'B — ширина шины, H — высота боковины')}

      </div>



      <div class="lessonSection">

        <div class="sectionTitle">
          Прототип Б · разность радиусов
        </div>


        <div class="markPair">

          <div class="markCard">
            <small>1 · первая маркировка</small>
            185/65 R16
          </div>

          <div class="markCard">
            <small>2 · вторая маркировка</small>
            215/55 R16
          </div>

        </div>


        <p>
          Диаметр диска у колёс одинаковый —
          в обеих маркировках R16.
        </p>


        <div class="inlineFormula">

          <span>
            \\(R_2-R_1\\)
          </span>


          <span class="eq">
            =
            <button
              onclick="app.toggleExplain('e1')"
            >
              ?
            </button>
          </span>


          <span>
            \\(
            \\frac{D_2}{2}
            -
            \\frac{D_1}{2}
            \\)
          </span>


          <span class="eq">
            =
            <button
              onclick="app.toggleExplain('e2')"
            >
              ?
            </button>
          </span>


          <span>
            \\(
            \\left(
            \\frac d2+H_2
            \\right)
            -
            \\left(
            \\frac d2+H_1
            \\right)
            \\)
          </span>


          <span class="eq">
            =
            <button
              onclick="app.toggleExplain('e3')"
            >
              ?
            </button>
          </span>


          <span>
            \\(
            \\frac d2
            +H_2
            -
            \\frac d2
            -H_1
            \\)
          </span>


          <span class="eq">
            =
            <button
              onclick="app.toggleExplain('e4')"
            >
              ?
            </button>
          </span>


          <span>
            \\(H_2-H_1\\)
          </span>

        </div>


        <div
          id="e1"
          class="explainBubble"
        >
          Каждый радиус — половина соответствующего диаметра:
          \\(R=\\frac D2\\).
        </div>


        <div
          id="e2"
          class="explainBubble"
        >
          Так как
          \\(D=d+2H\\),
          то

          \\[
          R=
          \\frac{d+2H}{2}
          =
          \\frac d2+H.
          \\]
        </div>


        <div
          id="e3"
          class="explainBubble"
        >
          Раскрываем скобки.
          Перед второй скобкой стоит минус,
          поэтому знаки внутри неё меняются.
        </div>


        <div
          id="e4"
          class="explainBubble"
        >
          Одинаковые
          \\(\\frac d2\\)
          сокращаются,
          потому что диаметр диска одинаковый.
        </div>


        <div class="mathBox">

          $$R_2-R_1=H_2-H_1$$

        </div>


        <div class="split">

          ${fig2Visual('dimensions',null,'Смотри на H и d')}


          <div>

            ${
              exerciseBlock(
                'Для 185/65 R16 и 215/55 R16 найди разность радиусов.',
                '2',
                'l2diff',
                'мм',
                'Найди H₁ и H₂. Так как диски одинаковые, достаточно найти разность высот боковин.'
              )
            }

          </div>

        </div>

      </div>

    </div>
    `;
  }


  /* =========================
     ЗАДАНИЕ №3
  ========================= */

  if(state.lesson === 3){

    body += `
    <div class="card">

      <div class="sectionTitle">
        Задание №3
      </div>

      <p>
        Дана шина с маркировкой
        <b>195/60 R16</b>.
      </p>

      <p>
        <b>
          Найдите полный диаметр колеса D
          в миллиметрах.
        </b>
      </p>

      <div class="mathBox">
        195/60 R16
      </div>

      <p>
        Попробуй сначала решить полностью самостоятельно.
      </p>


      <div class="answerRow">

        <input
          id="l3final"
          placeholder="D, мм"
        >

        <button
          class="btn primary"
          onclick="app.checkL3()"
        >
          Проверить
        </button>

        <button
          class="hintBtn"
          onclick="app.nextL3Hint()"
        >
          Подсказка
        </button>

      </div>


      <div
        id="l3Fb"
        class="feedback"
      ></div>

      <div id="l3Hint"></div>


      <div class="compactLessonFigure">
        ${fig2Visual('dimensions',null,'Если нужно — используй рисунок, чтобы вспомнить D, d и H')}
      </div>

    </div>
    `;
  }


  /* =========================
     ЗАДАНИЕ №4
  ========================= */

  if(state.lesson === 4){

    body += `
    <div class="card">

      <div class="sectionTitle">
        Задание №4
      </div>

      <p>
        На автомобиле были установлены шины
        <b>195/60 R16</b>.
      </p>

      <p>
        Их заменили на шины
        <b>205/55 R16</b>.
      </p>

      <p>
        <b>
          Найдите, на сколько миллиметров
          изменился полный диаметр колеса.
        </b>
      </p>


      <div class="markPair">

        <div class="markCard">
          <small>1 · старая маркировка</small>
          195/60 R16
        </div>

        <div class="markCard">
          <small>2 · новая маркировка</small>
          205/55 R16
        </div>

      </div>

      <div class="lessonFigureRow">
        ${fig2Visual('dimensions',null,'Для обеих шин используй H, d и полный диаметр D')}
      </div>

      <div class="formGrid">

        <div></div>

        <div class="head">
          1 · старая
        </div>

        <div class="head">
          2 · новая
        </div>


        <div>
          H, мм
        </div>

        <div>
          <input id="l4h1">
        </div>

        <div>
          <input id="l4h2">
        </div>


        <div>
          d, мм
        </div>

        <div>
          <input id="l4d1">
        </div>

        <div>
          <input id="l4d2">
        </div>


        <div>
          D, мм
        </div>

        <div>
          <input id="l4D1">
        </div>

        <div>
          <input id="l4D2">
        </div>

      </div>


      <div
        class="answerRow"
        style="margin-top:12px"
      >

        <input
          id="l4diff"
          placeholder="изменение, мм"
        >

        <button
          class="btn primary"
          onclick="app.checkL4()"
        >
          Проверить
        </button>

        <button
          class="hintBtn"
          onclick="app.nextL4Hint()"
        >
          Подсказка
        </button>

      </div>


      <div
        id="l4Fb"
        class="feedback"
      ></div>

      <div id="l4Hint"></div>

    </div>
    `;
  }


  /* =========================
     ЗАДАНИЕ №5
  ========================= */

  if(state.lesson === 5){

    body += `
    <div class="card">

      <div class="lessonSection">

        <div class="sectionTitle">
          Задание №5 · пробег за один оборот
        </div>

        <p>
          После замены шин изменился диаметр колеса.
        </p>

        <p>
          <b>
            Нужно определить,
            на сколько процентов изменится расстояние,
            которое автомобиль проходит
            за один полный оборот колеса.
          </b>
        </p>

      </div>


      <div class="lessonSection gifBox">

        <div class="sectionTitle">
          Что такое один оборот?
        </div>

        <img class="turnGif" src="assets/one_turn_correct.gif" onerror="this.onerror=null;this.src='assets/one_turn.gif'" alt="Один полный оборот колеса">

        <p>
          За один полный оборот колесо проходит расстояние,
          равное длине своей окружности.
        </p>

      </div>


      <div class="lessonSection">

        <div class="sectionTitle">
          Почему можно сравнивать диаметры
        </div>


        <div class="inlineFormula">

          <span>
            \\(
            C_1=\\pi D_1,
            \\quad
            C_2=\\pi D_2
            \\)
          </span>


          <span class="eq">
            →
            <button
              onclick="app.toggleExplain('p1')"
            >
              ?
            </button>
          </span>


          <span>
            \\(
            \\frac{C_2}{C_1}
            =
            \\frac{\\pi D_2}{\\pi D_1}
            \\)
          </span>


          <span class="eq">
            →
            <button
              onclick="app.toggleExplain('p2')"
            >
              ?
            </button>
          </span>


          <span>
            \\(
            \\frac{C_2}{C_1}
            =
            \\frac{D_2}{D_1}
            \\)
          </span>

        </div>


        <div
          id="p1"
          class="explainBubble"
        >
          Сравниваем новый пробег за один оборот
          со старым — то есть две длины окружности.
        </div>


        <div
          id="p2"
          class="explainBubble"
        >
          Множитель π одинаковый
          в числителе и знаменателе,
          поэтому он сокращается.
        </div>

      </div>


      <div class="lessonSection">

        <div class="sectionTitle">
          Теперь проценты
        </div>


        <div class="inlineFormula">

          <span>
            \\(D_1\\to100\\%\\)
          </span>

          <span class="eq">
            →
            <button
              onclick="app.toggleExplain('p3')"
            >
              ?
            </button>
          </span>

          <span>
            \\(D_2\\to x\\%\\)
          </span>

          <span class="eq">
            →
            <button
              onclick="app.toggleExplain('p4')"
            >
              ?
            </button>
          </span>

          <span>
            \\(
            \\frac{D_1}{D_2}
            =
            \\frac{100}{x}
            \\)
          </span>

          <span class="eq">
            →
            <button
              onclick="app.toggleExplain('p5')"
            >
              ?
            </button>
          </span>

          <span>
            \\(
            x=
            \\frac{D_2\\cdot100}{D_1}
            \\)
          </span>

        </div>


        <div
          id="p3"
          class="explainBubble"
        >
          Старое значение принимаем за 100%.
        </div>

        <div
          id="p4"
          class="explainBubble"
        >
          Ищем,
          сколько процентов новое значение
          составляет от старого.
        </div>

        <div
          id="p5"
          class="explainBubble"
        >
          Решаем полученную пропорцию относительно x.
        </div>


        <div class="hint">

          Если x &lt; 100,
          уменьшение равно
          <b>100 − x</b>.

          <br>

          Если x &gt; 100,
          увеличение равно
          <b>x − 100</b>.

        </div>

      </div>


      <div class="lessonSection">

        ${
          exerciseBlock(
            'D₁ = 640,4 мм, D₂ = 631,9 мм. На сколько процентов уменьшится пробег? Округли до десятых.',
            '1.3',
            'l5',
            '%',
            'Сначала найди x = D₂·100/D₁, затем вычисли 100−x.'
          )
        }

      </div>

    </div>
    `;
  }


  appEl.innerHTML = common(
    L.t,
    'Вся теория и практика этого номера собраны на одной странице.',
    body,
    true,
    true,
    'Дальше →'
  );


  if(
    state.lesson===1 ||
    state.lesson===3 ||
    state.lesson===4 ||
    state.lesson===5
  ){
    setTimeout(()=>{
      if($('#nextBtn')){
        $('#nextBtn').disabled=true;
      }
    },0);
  }


  updateChrome();
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
function examCondition(qn){
  const intro=`<div class="card stickyCondition">
    <div class="sectionTitle">Условие и материалы</div>
    <div class="ogeText"><p>В маркировке 195/60 R16 первое число — ширина шины, второе — высота боковины в процентах от ширины, число после R — диаметр диска в дюймах. 1 дюйм = 25,4 мм.</p></div>`;

  if(qn===1){
    return `${intro}<p><b>Для №1 работай прямо с таблицей:</b></p>${tireTable(false)}</div>`;
  }
  if(qn===2){
    return `${intro}<div class="figure"><img src="assets/fig1.png" alt="Маркировка на шине"></div>${fig2Visual('dimensions',null,'B — ширина, H — высота боковины')}</div>`;
  }
  if(qn===5){
    return `${intro}${fig2Visual('dimensions',null,'Схема колеса')}<div class="gifBox examGif"><img class="turnGif" src="assets/one_turn_correct.gif" onerror="this.onerror=null;this.src='assets/one_turn.gif'" alt="Один полный оборот колеса"><p>За один оборот колесо проходит длину окружности.</p></div></div>`;
  }
  return `${intro}${fig2Visual('dimensions',null,'D — внешний диаметр, d — диаметр диска, H — высота боковины')}</div>`;
}
const examQs={1:{q:'Для дисков диаметром 16 дюймов найдите наименьшую разрешённую ширину шины.',a:'195',u:'мм',h:['Найди столбец 16".','Посмотри только разрешённые ячейки.','Нужна наименьшая ширина.']},2:{q:'Для шины 205/55 R16 найдите высоту боковины.',a:'112.75',u:'мм',h:['Второе число — процент от ширины.','Используй $$H=\\frac{B\\cdot p}{100}$$']},3:{q:'Найдите диаметр заводского колеса с шиной 195/60 R16.',a:'640.4',u:'мм',h:['Найди H.','Переведи d из дюймов в мм.','Используй \\(D=d+2H\\).']},4:{q:'После замены 195/60 R16 на 205/55 R16 на сколько миллиметров уменьшится диаметр?',a:'8.5',u:'мм',h:['Найди D₁ и D₂.','Сравни их.','Вычти новое значение из старого.']},5:{q:'На сколько процентов уменьшится пробег за один оборот после этой замены? Округлите до десятых.',a:'1.3',u:'%',h:['За один оборот колесо проходит длину окружности.','Процент изменения окружности равен проценту изменения диаметра.','Старое D₁ — 100%, новое D₂ — x%.','После нахождения x вычисли 100−x.']}};
function renderExam(){
  crumb.textContent='Шины · Решаю самостоятельно';
  progressText.textContent='Самостоятельный вариант';
  progressBar.style.width='100%';
  const q=examQs[state.examQ],saved=state.examAnswers[state.examQ]??'';
  const answered=Object.keys(state.examAnswers).filter(k=>String(state.examAnswers[k]).trim()!=='').length;

  const body=`<div class="examLayout">
    ${examCondition(state.examQ)}
    <div>
      <div class="examTopRow">
        <div class="qnav">${[1,2,3,4,5].map(n=>`<button class="${state.examQ===n?'active':''} ${state.examAnswers[n]!==undefined&&String(state.examAnswers[n]).trim()!==''?'done':''}" onclick="app.examGoto(${n})">№${n}</button>`).join('')}</div>
        <div class="mini">Решено: ${answered} из 5. Можно решать в любом порядке.</div>
      </div>

      <div class="card">
        <span class="chip">Задание №${state.examQ}</span>
        <h2>${q.q}</h2>
        <div class="answerRow">
          <input id="examInput" value="${saved}" inputmode="decimal">
          <span>${q.u}</span>
          <button class="hintBtn" onclick="app.examHint()">Подсказка</button>
        </div>
        <div id="examHint"></div>
      </div>

      <div id="finishNotice"></div>

      <div class="nav examNav">
        <button class="btn secondary" onclick="app.examPrev()">← Предыдущее</button>
        <button class="btn secondary" onclick="app.finishExam()">Завершить</button>
        <button class="btn primary" onclick="app.saveExam()">${state.examQ<5?'Сохранить и дальше →':'Сохранить ответ'}</button>
      </div>
    </div>
  </div>`;

  appEl.innerHTML=common('Решаю самостоятельно','Текст и нужный рисунок или таблица находятся рядом с текущим заданием.',body,false,false);
  updateChrome();
}
function renderResults(){let score=0;[1,2,3,4,5].forEach(n=>{if(norm(state.examAnswers[n])===norm(examQs[n].a))score++});crumb.textContent='Шины · Результат';progressText.textContent=`${score} из 5`;progressBar.style.width='100%';let rows=[1,2,3,4,5].map(n=>{let ok=norm(state.examAnswers[n])===norm(examQs[n].a);return `<div class="reviewRow"><div><b>№${n}</b> <span class="${ok?'good':'bad'}">${ok?'✓ Верно':'✕ Ошибка'}</span>${state.examReviewed[n]?'<span class="reviewTag">исправлялось после разбора</span>':''}</div>${ok?'':`<button class="btn secondary" onclick="app.review(${n})">Разобрать</button>`}</div>`}).join('');appEl.innerHTML=common(score===5?'Шины пройдены ✓':'Есть что разобрать',`Результат: ${score} из 5`,`<div class="card"><div class="score">${score} из 5</div>${rows}</div>`,false,false);updateChrome()}

function injectV5Styles(){
  if(document.getElementById('v5Styles'))return;
  const style=document.createElement('style');
  style.id='v5Styles';
  style.textContent=`
    .navSideBtn{display:block;width:100%;border:0;text-align:left;font:inherit;cursor:pointer}
    .navSideBtn:disabled{opacity:.45;cursor:not-allowed}

    .navSideBtn{
      pointer-events:auto!important;
      position:relative;
      z-index:3;
      background:transparent;
      -webkit-tap-highlight-color:rgba(117,84,197,.12);
      touch-action:manipulation;
    }
    .navSideBtn:not(:disabled):active{background:var(--lav)}

    .mobileSectionBar,.mobileNavPanel{display:none}
    .annotatedFigure .figImageWrap{position:relative;display:inline-block;max-width:100%}
    .annotatedFigure img{display:block;max-width:100%;height:auto}
    .figOverlaySvg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
    .figOverlaySvg line{stroke-width:1.1;vector-effect:non-scaling-stroke}
    .figOverlaySvg text{font-family:Georgia,serif;font-style:italic;font-weight:700;font-size:5px}
    .strokeB{stroke:#4f86c6}.strokeH{stroke:#c96b93}.stroked{stroke:#4b9874}.strokeD{stroke:#7554c5}
    .fillB{fill:#4f86c6}.fillH{fill:#c96b93}.filld{fill:#4b9874}.fillD{fill:#7554c5}
    .labelB{fill:#4f86c6}.labelH{fill:#c96b93}.labeld{fill:#4b9874}.labelD{fill:#7554c5}
    .centerDot{fill:#4f86c6}
    .focusTarget{position:absolute;z-index:4;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-weight:900;transform:translate(-50%,-50%);box-shadow:0 0 0 4px rgba(255,255,255,.85)}
    .focus-B{left:39.5%;top:84%;background:#eaf3ff;color:#416fae}
    .focus-H{left:13%;top:22%;background:#fbeaf2;color:#b75f86}
    .focus-d{left:20%;top:47%;background:#eaf6ef;color:#438b69}
    .focus-D{left:6.5%;top:47%;background:#f0eafb;color:#7554c5}
    .drag{touch-action:manipulation;min-height:44px}
    .drag.selectedTap{outline:3px solid #8b68d2;background:#eee6fb}
    .drop{min-height:62px;touch-action:manipulation}
    .compactLessonFigure .figure img{max-height:360px;width:auto!important;margin:auto}
    .lessonFigureRow{max-width:620px;margin:18px auto}
    .turnGif{display:block;max-width:520px;width:100%;height:auto;margin:12px auto;border-radius:16px}
    .examGif{margin-top:14px}
    .tableWrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .examTopRow{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .examNav{flex-wrap:wrap}
    .finishWarning{padding:14px 16px;border:1px solid #dcccf2;background:#f7f2fd;border-radius:16px;margin-top:14px}
    .finishWarning .answerRow{margin-top:10px}
    .mobileNavPanel .sideItem{margin:6px 0}

    @media (max-width:760px){
      #sidebar{display:none!important}
      .mobileSectionBar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px}
      .mobileMenuBtn{min-height:44px}
      .mobileWhere{font-size:12px;color:var(--muted)}
      .mobileNavPanel{display:none;background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px;margin-bottom:16px}
      .mobileNavPanel.open{display:block}
      .mobileNavTitle{font-weight:800;margin-bottom:8px}
      .grid2,.split,.examLayout,.markPair{grid-template-columns:1fr!important}
      .stage,.card{min-width:0!important}
      .callout{position:static!important;left:auto!important;top:auto!important;width:auto!important;max-width:none!important;margin:14px 0 0!important}
      .arrowLayer{display:none!important}
      .focusTarget{display:grid}
      .figure img{max-height:340px!important;width:auto!important;max-width:100%!important;margin:auto}
      .annotatedFigure .figImageWrap{display:block;width:min(100%,520px);margin:auto}
      .compactLessonFigure .figure img{max-height:300px!important}
      .answerRow{display:flex!important;flex-wrap:wrap!important;align-items:center!important}
      .answerRow input{font-size:16px;min-height:44px;min-width:0;flex:1 1 150px}
      .btn,.hintBtn,.choice,.drag,.drop,.qnav button{min-height:44px}
      .checkGrid .row{grid-template-columns:1fr auto!important}
      .checkGrid .row>div:first-child{grid-column:1/-1}
      .checkGrid input{font-size:16px;width:100%;min-height:44px}
      .inlineFormula{overflow-x:auto;justify-content:flex-start!important;padding-top:34px!important}
      .formGrid{grid-template-columns:auto minmax(110px,1fr) minmax(110px,1fr)!important;overflow-x:auto}
      .nav{gap:10px;flex-wrap:wrap}
      .nav .btn{flex:1 1 130px}
      h1{font-size:clamp(30px,9vw,46px)!important}
      .tableWrap table{min-width:620px}
      .stickyCondition{position:static!important}
    }
  `;
  document.head.appendChild(style);
}

const app={render(){if(state.section==='intro')renderIntro();if(state.section==='lesson')renderLesson();if(state.section==='exam')renderExam();if(state.section==='results')renderResults()},goHome(){state.section='intro';state.intro=0;state.reviewTarget=null;this.render()},prev(){if(state.section==='intro'&&state.intro>0){state.intro--;this.render();return}if(state.section==='lesson'){if(state.lessonStep>0)state.lessonStep--;else if(state.lesson>1){state.lesson--;state.lessonStep=lessons[state.lesson].steps-1}else{state.section='intro';state.intro=introSteps.length-1}this.render()}},next(){if(state.section==='intro'){if(state.intro<introSteps.length-1){state.intro++;this.render()}else{state.section='lesson';state.lesson=1;state.lessonStep=0;this.render()}return}if(state.section==='lesson'){let L=lessons[state.lesson];if(state.lessonStep<L.steps-1){state.lessonStep++;this.render();return}if(state.reviewTarget===state.lesson){let q=state.reviewTarget;state.reviewTarget=null;state.section='exam';state.examQ=q;state.examReviewed[q]=true;this.render();return}if(state.lesson<5){state.lesson++;state.lessonStep=0;this.render()}else{state.section='exam';state.examQ=1;this.render()}}},checkExercise,checkRadiusFormula,showHint,checkNewMark,tableClick,toggleExplain,checkL3,nextL3Hint,checkL4,nextL4Hint,selectDrag,tapDrop,openLesson(n){state.section='lesson';state.lesson=n;state.lessonStep=0;state.reviewTarget=null;state.mobileMenu=false;this.render()},
toggleMobileMenu(){state.mobileMenu=!state.mobileMenu;const p=document.getElementById('mobileNavPanel');if(p)p.classList.toggle('open',state.mobileMenu)},
navTo(sec,val){
  state.mobileMenu=false;
  state.reviewTarget=null;
  if(sec==='intro'){state.section='intro';state.intro=val;}
  if(sec==='lesson'){state.section='lesson';state.lesson=val;state.lessonStep=0;}
  if(sec==='exam'){state.section='exam';state.examQ=val||1;}
  if(sec==='results'){
    if(Object.keys(state.examAnswers).length===0)return;
    state.section='results';
  }
  window.app.render();
},
examGoto(n){state.examAnswers[state.examQ]=$('#examInput')?.value??state.examAnswers[state.examQ];state.examQ=n;this.render()},examPrev(){state.examAnswers[state.examQ]=$('#examInput')?.value??state.examAnswers[state.examQ];if(state.examQ>1)state.examQ--;this.render()},saveExam(){
  state.examAnswers[state.examQ]=$('#examInput').value;
  if(state.examQ<5)state.examQ++;
  this.render();
},
finishExam(force=false){
  state.examAnswers[state.examQ]=$('#examInput')?.value??state.examAnswers[state.examQ]??'';
  const missing=[1,2,3,4,5].filter(n=>!String(state.examAnswers[n]??'').trim());
  if(missing.length&&!force){
    const box=$('#finishNotice');
    if(box)box.innerHTML=`<div class="finishWarning"><b>Не решены: №${missing.join(', №')}.</b><div>Можно вернуться к ним или завершить вариант сейчас.</div><div class="answerRow"><button class="btn secondary" onclick="app.examGoto(${missing[0]})">Перейти к №${missing[0]}</button><button class="btn primary" onclick="app.finishExam(true)">Всё равно завершить</button></div></div>`;
    return;
  }
  state.section='results';
  this.render();
},
examHint(){let k='e'+state.examQ,n=(state.hints[k]||0)+1;state.hints[k]=n;let a=examQs[state.examQ].h;$('#examHint').innerHTML=`<div class="hint">${a[Math.min(n-1,a.length-1)]}</div>`;renderMath()},review(n){state.reviewTarget=n;state.section='lesson';state.lesson=n;state.lessonStep=0;this.render()}};
window.app = app;
window.addEventListener('DOMContentLoaded',()=>{injectV5Styles();window.app.render();});


// v4 navigation safety: explicit global functions for inline controls.
window.goNext = () => window.app.next();
window.goPrev = () => window.app.prev();
