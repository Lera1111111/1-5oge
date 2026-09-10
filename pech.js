/* Сюжет «Печь для бани» и общий экран выбора.
   Основной тренажёр «Шины» остаётся в app.js без изменения учебного содержания. */

const ovenTasks={
  1:{title:'Работа с таблицей',variants:[
    {name:'Масса',q:`Установите соответствие между массами и номерами печей. Заполните таблицу, в бланк ответов перенесите последовательность трёх цифр без пробелов, запятых и других дополнительных символов.<div class="tableWrap"><table class="matchMini"><tr><th>Масса (кг)</th><td>15</td><td>40</td><td>48</td></tr><tr><th>Номер печи</th><td></td><td></td><td></td></tr></table></div>`,a:'312',unit:'',h:['Смотри только на столбец «Масса (кг)».','15 кг — печь №3, 40 кг — №1, 48 кг — №2.','Запиши номера подряд, без пробелов и запятых.']},
    {name:'Стоимость',q:`Установите соответствие между стоимостями и номерами печей. Заполните таблицу, в бланк ответов перенесите последовательность трёх цифр без пробелов, запятых и других дополнительных символов.<div class="tableWrap"><table class="matchMini"><tr><th>Стоимость (руб.)</th><td>15 000</td><td>19 500</td><td>18 000</td></tr><tr><th>Номер печи</th><td></td><td></td><td></td></tr></table></div>`,a:'321',unit:'',h:['Смотри только на столбец «Стоимость (руб.)».','15 000 руб. — печь №3, 19 500 руб. — №2, 18 000 руб. — №1.','Запиши номера в порядке стоимостей из задания.']}
  ]},
  2:{title:'Площадь и объём',variants:[
    {name:'Площадь пола',q:'Найдите площадь пола парного отделения строящейся бани. Ответ дайте в квадратных метрах.',a:'7.7',unit:'м²',h:['Для площади пола нужны длина 3,5 м и ширина 2,2 м.','Площадь прямоугольника: S = a · b.','Вычисли 3,5 · 2,2.']},
    {name:'Объём',q:'Найдите объём парного отделения строящейся бани. Ответ дайте в кубических метрах.',a:'15.4',unit:'м³',h:['Для объёма нужны длина, ширина и высота.','Объём: V = a · b · h.','Вычисли 3,5 · 2,2 · 2.']}
  ]},
  3:{title:'Сравнение стоимости',variants:[
    {name:'С учётом установки',q:'На сколько рублей покупка дровяной печи, подходящей по объёму парного отделения, обойдётся дешевле электрической с учётом установки?',a:'2000',unit:'руб.',h:['Объём парной: 3,5 · 2,2 · 2 = 15,4 м³.','Подходящая дровяная печь №2 стоит 19 500 руб. Электрическая №3 стоит 15 000 руб.','К цене электрической прибавь 6500 руб. и сравни итоговые стоимости.']},
    {name:'Без учёта установки',q:'На сколько рублей покупка дровяной печи, подходящей по объёму парного отделения, обойдётся дороже электрической без учёта установки?',a:'4500',unit:'руб.',h:['Объём парной равен 15,4 м³.','Подходящие печи: дровяная №2 и электрическая №3.','Установку учитывать не нужно: найди 19 500 − 15 000.']}
  ]},
  4:{title:'Скидка',variants:[
    {name:'Печь массой 40 кг',q:'На дровяную печь, масса которой 40 кг, сделали скидку 10%. Сколько рублей стала стоить печь?',a:'16200',unit:'руб.',h:['Печь массой 40 кг — №1. Она стоит 18 000 руб.','После скидки 10% нужно заплатить 90% цены.','Вычисли 18 000 · 0,9.']},
    {name:'Печь массой 48 кг',q:'На дровяную печь, масса которой 48 кг, сделали скидку 10%. Сколько рублей стала стоить печь?',a:'17550',unit:'руб.',h:['Печь массой 48 кг — №2. Она стоит 19 500 руб.','После скидки 10% остаётся 90% цены.','Вычисли 19 500 · 0,9.']}
  ]},
  5:{title:'Радиус арки',variants:[
    {name:'Ширина 60 см',q:'',img:'assets/pech/5/59DCD0.png',a:'50',unit:'см',h:['Центр окружности находится в середине основания: половина 60 см равна 30 см.','Радиус — гипотенуза треугольника с катетами 30 см и 40 см.','По теореме Пифагора: R² = 30² + 40².']},
    {name:'Ширина 50 см',q:'',img:'assets/pech/5/BE99C7.png',a:'65',unit:'см',h:['Половина ширины 50 см равна 25 см.','Радиус — гипотенуза треугольника с катетами 25 см и 60 см.','По теореме Пифагора: R² = 25² + 60².']}
  ]}
};

function setBrand(text){const el=document.getElementById('brandSub');if(el)el.textContent=text}

function ovenSource(mark=''){
  const on=x=>mark===x?'active':'';
  return `<div class="sourceText">
    <p><b>Прочитайте внимательно текст и выполните задания 1–5.</b></p>
    <p>Хозяин дачного участка строит баню с парным отделением. Парное отделение имеет размеры: <span class="sourceMark ${on('sizes')}">длина 3,5 м, ширина 2,2 м, высота 2 м</span>. Окон в парном отделении нет, для доступа внутрь планируется дверь шириной 60 см, высота дверного проёма 1,8 м. Для прогрева парного отделения можно использовать электрическую или дровяную печь. В таблице представлены характеристики трёх печей.</p>
    <div class="tableWrap"><table class="sourceTable"><thead><tr><th>Номер печи</th><th>Тип</th><th>Объём помещения (куб. м)</th><th>Масса (кг)</th><th>Стоимость (руб.)</th></tr></thead><tbody><tr><td>1</td><td>дровяная</td><td>8–12</td><td>40</td><td>18 000</td></tr><tr><td>2</td><td>дровяная</td><td>10–16</td><td>48</td><td>19 500</td></tr><tr><td>3</td><td>электрическая</td><td>9–15,5</td><td>15</td><td>15 000</td></tr></tbody></table></div>
    <p class="sourceMark cost ${on('cost')}">Для установки дровяной печи дополнительных затрат не потребуется. Установка электрической печи потребует подведения специального кабеля, что обойдётся в 6500 руб.</p>
  </div>`;
}

function ovenTaskBody(v){return `${v.q?`<div class="ovenTaskText">${v.q}</div>`:''}${v.img?`<img class="ovenTaskImage" src="${v.img}" alt="Исходное задание с чертежом арки кожуха печи">`:''}`}

function renderHub(){
  document.body.classList.add('hubMode');setBrand('Интерактивный тренажёр · ОГЭ · Задания 1–5');sidebar.innerHTML='';crumb.textContent='';progressText.textContent='';progressBar.style.width='0';
  appEl.innerHTML=`<div class="hubEyebrow">Практические задачи ОГЭ</div><h1>Выбери сюжет</h1><p class="hubLead">В каждом сюжете — общий текст и пять связанных заданий. После выбора можно сначала изучить прототипы или сразу решить самостоятельный вариант.</p><div class="storyGrid">
    <button class="storyCard primaryStory" onclick="app.chooseStory('tires')"><div class="storyTop"><span class="storyIcon">Ш</span><span class="storyStatus">Готово</span></div><h2>Шины</h2><p>Маркировка шин, размеры колеса, таблица допустимых значений и длина окружности.</p><div class="storyNumbers"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div></button>
    <button class="storyCard primaryStory" onclick="app.chooseStory('oven')"><div class="storyTop"><span class="storyIcon">П</span><span class="storyStatus">Готово</span></div><h2>Печь для бани</h2><p>Размеры парной, характеристики печей, стоимость, скидка и радиус арки.</p><div class="storyNumbers"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div></button>
  </div>`;
}

function renderModeSelect(){
  document.body.classList.add('hubMode');const name=state.story==='oven'?'Печь для бани':'Шины';setBrand(`Интерактивный тренажёр · ОГЭ · ${name}`);sidebar.innerHTML='';crumb.textContent='';progressText.textContent='';progressBar.style.width='0';
  appEl.innerHTML=`<button class="backLink" onclick="app.goRoot()">← Все сюжеты</button><div class="hubEyebrow">${name}</div><h1>Как будем работать?</h1><p class="hubLead">Можно пройти объяснение по шагам или сразу проверить себя.</p><div class="modeGrid">
    <button class="modeCard" onclick="app.chooseMode('study')"><span class="modeNo">РЕЖИМ 01</span><h2>Изучение прототипа</h2><p>Разбираем исходный текст, рисунки и таблицу, затем учимся решать задания №1–5 с подсказками.</p><span class="modeAction">Начать изучение →</span></button>
    <button class="modeCard" onclick="app.chooseMode('exam')"><span class="modeNo">РЕЖИМ 02</span><h2>Самостоятельная работа</h2><p>Пять заданий подряд. Ответы сохраняются, а в конце появляется результат и разбор ошибок.</p><span class="modeAction">Решать самостоятельно →</span></button>
  </div>${state.story==='oven'?'<div class="archiveOnly">В этом сюжете используются только задания из предоставленного архива — по два прототипа на каждый номер.</div>':''}`;
}

function ovenSidebarHtml(mobile=false){
  const btn=(label,sec,val,active,done=false)=>`<button type="button" class="sideItem navSideBtn ${active?'active':''} ${done?'done':''}" data-nav-sec="${sec}" data-nav-val="${val}">${label}</button>`;
  let out=mobile?'<div class="mobileNavTitle">Перейти к разделу</div>':'<button class="sideTitle catalogSide" onclick="app.openMode()">Печь для бани</button>';
  out+=`<div class="sideGroup">Разбираем условие</div>${btn('Исходный текст','ovenIntro',0,state.section==='ovenIntro'&&state.ovenIntro<2,state.section!=='ovenIntro'||state.ovenIntro>1)}${btn('Таблица и расходы','ovenIntro',2,state.section==='ovenIntro'&&state.ovenIntro===2,state.section!=='ovenIntro')}`;
  out+='<div class="sideGroup">Учимся решать</div>';
  for(let n=1;n<=5;n++)out+=btn(`Задание №${n}`,'ovenLesson',n,state.section==='ovenLesson'&&state.ovenLesson===n,['ovenExam','ovenResults'].includes(state.section)||(state.section==='ovenLesson'&&state.ovenLesson>n));
  out+=`<div class="sideGroup">Проверяем себя</div>${btn('Самостоятельный вариант','ovenExam',1,state.section==='ovenExam',state.section==='ovenResults')}${btn('Результат','ovenResults',1,state.section==='ovenResults')}`;
  return out;
}

function ovenRenderIntro(){
  document.body.classList.remove('hubMode');setBrand('Интерактивный тренажёр · ОГЭ · Печь для бани');window.currentSidebarHtml=ovenSidebarHtml;
  const steps=[
    {t:'Сначала просто прочитай условие',l:'Пока ничего не вычисляй. Посмотри, какие сведения могут понадобиться в заданиях.',mark:'',extra:'<div class="card" style="margin-top:18px"><b>Что здесь кажется важным?</b><textarea style="width:100%;min-height:90px;margin-top:10px;border:1px solid var(--line);border-radius:16px;padding:14px" placeholder="Размеры, цены, условия установки..."></textarea><div class="mini">Ответ не проверяется.</div></div>'},
    {t:'Выделяем размеры парной',l:'Эти три числа понадобятся для площади пола, объёма и выбора печи.',mark:'sizes',extra:'<div class="hint">Длина, ширина и высота относятся к одному помещению. Единицы измерения уже одинаковые — метры.</div>'},
    {t:'Читаем таблицу и условие установки',l:'Характеристики печи и дополнительные расходы — разные данные.',mark:'cost',extra:'<div class="hint">Цена электрической печи в таблице не включает 6500 руб. за специальный кабель.</div>'}
  ];
  const s=steps[state.ovenIntro];crumb.textContent='Печь для бани · Разбираем условие';progressText.textContent=`Введение · ${state.ovenIntro+1} из 3`;progressBar.style.width=`${(state.ovenIntro+1)/3*100}%`;
  appEl.innerHTML=common(s.t,s.l,`<div class="card">${ovenSource(s.mark)}</div>${s.extra}`,state.ovenIntro>0,true,state.ovenIntro===2?'К заданиям →':'Дальше →');updateChrome();
}

function ovenRenderLesson(){
  document.body.classList.remove('hubMode');setBrand('Интерактивный тренажёр · ОГЭ · Печь для бани');window.currentSidebarHtml=ovenSidebarHtml;
  const t=ovenTasks[state.ovenLesson],v=t.variants[state.ovenVariant],key=`${state.ovenLesson}-${state.ovenVariant}`,shown=state.ovenHints[key]||0;
  crumb.textContent=`Печь для бани · Задание №${state.ovenLesson}`;progressText.textContent=`Прототип ${state.ovenLesson} из 5`;progressBar.style.width=`${state.ovenLesson/5*100}%`;
  const tabs=t.variants.map((x,i)=>`<button class="variantTab ${i===state.ovenVariant?'active':''}" onclick="app.ovenSetVariant(${i})">${i?'Б':'А'} · ${x.name}</button>`).join('');
  const hints=v.h.slice(0,shown).map((x,i)=>`<div class="guideStep"><b>${i+1}</b><span>${x}</span></div>`).join('');
  const body=`<div class="grid2"><div class="card"><div class="sectionTitle">Исходный текст и таблица</div>${ovenSource()}</div><div><div class="card"><div class="variantTabs">${tabs}</div><span class="chip">Задание №${state.ovenLesson}</span>${ovenTaskBody(v)}<div class="guideSteps">${hints}</div>${shown<v.h.length?`<button class="hintBtn" onclick="app.ovenHint()">${shown?'Следующий шаг':'Подсказка по шагам'}</button>`:''}<div class="answerRow" style="margin-top:14px"><input id="ovenStudyAnswer" inputmode="decimal"><span>${v.unit}</span><button class="btn primary" onclick="app.ovenCheck()">Проверить</button></div><div id="ovenStudyFb" class="feedback"></div></div></div></div>`;
  appEl.innerHTML=common(`№${state.ovenLesson} · ${t.title}`,'Оба варианта взяты из архива. Переключайся между ними, не меняя тип задания.',body,true,state.ovenLesson<5,state.ovenLesson<5?'Следующее задание →':'');
  if($('#nextBtn'))$('#nextBtn').disabled=!state.ovenCompleted[key];updateChrome();
}

function ovenStartExam(){
  state.ovenExamSet={};for(let n=1;n<=5;n++)state.ovenExamSet[n]=Math.floor(Math.random()*2);
  state.ovenExamQ=1;state.ovenAnswers={};state.ovenReviewed={};state.section='ovenExam';window.app.render();
}

function ovenRenderExam(){
  document.body.classList.remove('hubMode');setBrand('Интерактивный тренажёр · ОГЭ · Печь для бани');window.currentSidebarHtml=ovenSidebarHtml;
  const n=state.ovenExamQ,v=ovenTasks[n].variants[state.ovenExamSet[n]],saved=state.ovenAnswers[n]??'',answered=Object.values(state.ovenAnswers).filter(x=>String(x).trim()).length;
  crumb.textContent='Печь для бани · Решаю самостоятельно';progressText.textContent='Самостоятельный вариант';progressBar.style.width='100%';
  const qnav=[1,2,3,4,5].map(x=>`<button class="${x===n?'active':''} ${String(state.ovenAnswers[x]??'').trim()?'done':''}" onclick="app.ovenExamGoto(${x})">№${x}</button>`).join('');
  appEl.innerHTML=common('Решаю самостоятельно','Условие и таблица остаются рядом с заданием.',`<div class="examLayout"><div class="card ovenSourceSticky"><div class="sectionTitle">Условие и материалы</div>${ovenSource()}</div><div><div class="examTopRow"><div class="qnav">${qnav}</div><div class="mini">Решено: ${answered} из 5</div></div><div class="card"><span class="chip">Задание №${n}</span>${ovenTaskBody(v)}<div class="answerRow"><input id="ovenExamInput" value="${saved}" inputmode="decimal"><span>${v.unit}</span></div></div><div id="ovenFinishNotice"></div><div class="nav examNav"><button class="btn secondary" onclick="app.ovenExamPrev()">← Предыдущее</button><button class="btn secondary" onclick="app.ovenFinish()">Завершить</button><button class="btn primary" onclick="app.ovenExamSave()">${n<5?'Сохранить и дальше →':'Сохранить ответ'}</button></div></div></div>`,false,false);updateChrome();
}

function ovenRenderResults(){
  document.body.classList.remove('hubMode');setBrand('Интерактивный тренажёр · ОГЭ · Печь для бани');window.currentSidebarHtml=ovenSidebarHtml;
  let score=0;const rows=[1,2,3,4,5].map(n=>{const v=ovenTasks[n].variants[state.ovenExamSet[n]],ok=norm(state.ovenAnswers[n])===norm(v.a);if(ok)score++;return `<div class="reviewRow"><div><b>№${n}</b> <span class="${ok?'good':'bad'}">${ok?'✓ Верно':'✕ Ошибка'}</span></div>${ok?'':`<button class="btn secondary" onclick="app.ovenReview(${n})">Разобрать</button>`}</div>`}).join('');
  crumb.textContent='Печь для бани · Результат';progressText.textContent=`${score} из 5`;progressBar.style.width='100%';appEl.innerHTML=common(score===5?'Печь для бани пройдена ✓':'Есть что разобрать',`Результат: ${score} из 5`,`<div class="card"><div class="score">${score} из 5</div>${rows}<div class="nav"><button class="btn secondary" onclick="app.openMode()">Выбрать режим</button><button class="btn primary" onclick="app.ovenRestartExam()">Новый вариант</button></div></div>`,false,false);updateChrome();
}

const baseRender=window.app.render.bind(window.app),basePrev=window.app.prev.bind(window.app),baseNext=window.app.next.bind(window.app),baseNavTo=window.app.navTo.bind(window.app);

Object.assign(window.app,{
  render(){
    if(state.section==='hub')return renderHub();
    if(state.section==='mode')return renderModeSelect();
    if(state.section==='ovenIntro')return ovenRenderIntro();
    if(state.section==='ovenLesson')return ovenRenderLesson();
    if(state.section==='ovenExam')return ovenRenderExam();
    if(state.section==='ovenResults')return ovenRenderResults();
    document.body.classList.remove('hubMode');window.currentSidebarHtml=sidebarHtml;setBrand('Интерактивный тренажёр · ОГЭ · Шины');return baseRender();
  },
  goRoot(){state.section='hub';state.story=null;this.render()},
  openMode(){state.section='mode';this.render()},
  chooseStory(story){state.story=story;state.section='mode';this.render()},
  chooseMode(mode){
    if(state.story==='tires'){window.currentSidebarHtml=sidebarHtml;if(mode==='study'){state.section='intro';state.intro=0}else{state.section='exam';state.examQ=1}this.render();return}
    if(mode==='study'){state.section='ovenIntro';state.ovenIntro=0;state.ovenLesson=1;state.ovenVariant=0;this.render()}else ovenStartExam();
  },
  prev(){
    if(state.section==='ovenIntro'){if(state.ovenIntro>0)state.ovenIntro--;else{state.section='mode'}this.render();return}
    if(state.section==='ovenLesson'){if(state.ovenLesson>1)state.ovenLesson--;else{state.section='ovenIntro';state.ovenIntro=2}this.render();return}
    return basePrev();
  },
  next(){
    if(state.section==='ovenIntro'){if(state.ovenIntro<2)state.ovenIntro++;else{state.section='ovenLesson';state.ovenLesson=1;state.ovenVariant=0}this.render();return}
    if(state.section==='ovenLesson'&&state.ovenLesson<5){state.ovenLesson++;state.ovenVariant=0;this.render();return}
    return baseNext();
  },
  navTo(sec,val){
    if(sec==='ovenIntro'){state.section=sec;state.ovenIntro=val;this.render();return}
    if(sec==='ovenLesson'){state.section=sec;state.ovenLesson=val;state.ovenVariant=0;this.render();return}
    if(sec==='ovenExam'){if(!Object.keys(state.ovenExamSet).length)ovenStartExam();else{state.section=sec;state.ovenExamQ=val;this.render()}return}
    if(sec==='ovenResults'){if(Object.keys(state.ovenExamSet).length){state.section=sec;this.render()}return}
    return baseNavTo(sec,val);
  },
  ovenSetVariant(i){state.ovenVariant=i;this.render()},
  ovenHint(){const k=`${state.ovenLesson}-${state.ovenVariant}`,v=ovenTasks[state.ovenLesson].variants[state.ovenVariant];state.ovenHints[k]=Math.min((state.ovenHints[k]||0)+1,v.h.length);this.render()},
  ovenCheck(){const v=ovenTasks[state.ovenLesson].variants[state.ovenVariant],ok=norm($('#ovenStudyAnswer').value)===norm(v.a),fb=$('#ovenStudyFb'),k=`${state.ovenLesson}-${state.ovenVariant}`;fb.textContent=ok?'Верно!':'Пока не получилось. Проверь вычисления или открой подсказку.';fb.className='feedback '+(ok?'ok':'');if(ok){state.ovenCompleted[k]=true;if($('#nextBtn'))$('#nextBtn').disabled=false}},
  ovenExamGoto(n){state.ovenAnswers[state.ovenExamQ]=$('#ovenExamInput')?.value??state.ovenAnswers[state.ovenExamQ];state.ovenExamQ=n;this.render()},
  ovenExamPrev(){state.ovenAnswers[state.ovenExamQ]=$('#ovenExamInput')?.value??state.ovenAnswers[state.ovenExamQ];if(state.ovenExamQ>1)state.ovenExamQ--;this.render()},
  ovenExamSave(){state.ovenAnswers[state.ovenExamQ]=$('#ovenExamInput').value;if(state.ovenExamQ<5)state.ovenExamQ++;this.render()},
  ovenFinish(force=false){state.ovenAnswers[state.ovenExamQ]=$('#ovenExamInput')?.value??state.ovenAnswers[state.ovenExamQ]??'';const missing=[1,2,3,4,5].filter(n=>!String(state.ovenAnswers[n]??'').trim());if(missing.length&&!force){$('#ovenFinishNotice').innerHTML=`<div class="finishWarning"><b>Не решены: №${missing.join(', №')}.</b><div class="answerRow"><button class="btn secondary" onclick="app.ovenExamGoto(${missing[0]})">Перейти к №${missing[0]}</button><button class="btn primary" onclick="app.ovenFinish(true)">Всё равно завершить</button></div></div>`;return}state.section='ovenResults';this.render()},
  ovenReview(n){state.section='ovenLesson';state.ovenLesson=n;state.ovenVariant=state.ovenExamSet[n];this.render()},
  ovenRestartExam(){ovenStartExam()}
});

window.goNext=()=>window.app.next();
window.goPrev=()=>window.app.prev();
