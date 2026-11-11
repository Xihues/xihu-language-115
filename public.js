'use strict';
const C=window.CONTEST;
// Keep section links below the header, including when the menu wraps on phones.
if(typeof ResizeObserver==='function'){
 const siteHeader=document.querySelector('header');
 const updateHeaderHeight=()=>document.documentElement.style.setProperty('--site-header-height',Math.ceil(siteHeader.getBoundingClientRect().height)+'px');
 updateHeaderHeight();new ResizeObserver(updateHeaderHeight).observe(siteHeader);
}
const esc=s=>String(s??'').replace(/–/g,'至').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roc=d=>{const x=new Date(d+'T00:00:00');return `${x.getFullYear()-1911}/${x.getMonth()+1}/${x.getDate()}（${'日一二三四五六'[x.getDay()]}）`;};
function renderDates(rows){document.querySelector('#dateCards').innerHTML=[1,2].map(t=>{const dates=[...new Set(rows.filter(e=>e.term===t).map(e=>e.date))];return `<div><h3>${t===1?'上':'下'}學期</h3><div class="term-dates">${dates.map(date=>`<article class="date-card"><h4>${roc(date)}</h4>${rows.filter(e=>e.date===date).map(e=>`<p><strong>${esc(e.name)}</strong><small>${esc(e.time)}，${esc(e.venue)}，${e.grades.join('、')}年級</small></p>`).join('')}</article>`).join('')||'<p>此篩選沒有項目。</p>'}</div></div>`;}).join('');}
function renderSchedule(){const term=document.querySelector('#term').value,grade=document.querySelector('#grade').value;const rows=C.events.filter(e=>(!term||e.term===+term)&&(!grade||e.grades.includes(+grade)));renderDates(rows);document.querySelector('#count').textContent=`共 ${rows.length} 項`;document.querySelector('#scheduleRows').innerHTML=rows.map(e=>`<tr><td><strong>${esc(e.name)}</strong><br><span class="pill">${e.term===1?'上':'下'}學期</span></td><td>${roc(e.date)}<br><small>${esc(e.time)}</small></td><td>${esc(e.venue)}</td><td>${e.grades.join('、')}年級<br><small>${e.id==='phonetic'?'2至3':e.max===3?'至多3':'1至2'}人</small></td></tr>`).join('')||'<tr><td colspan="4">此年級沒有符合條件的項目。</td></tr>';}
document.querySelectorAll('#term,#grade').forEach(e=>e.addEventListener('change',renderSchedule));renderSchedule();
document.querySelector('#formCards').innerHTML=[1,2].map(t=>`<article class="reg-card"><h3>${t===1?'上':'下'}學期競賽</h3><p>${C.events.filter(e=>e.term===t).map(e=>esc(e.name)).join('、')}</p><p>報名截止：<strong>${esc(C['deadline'+t])}</strong></p><p><strong>僅限由級任老師填寫表單報名</strong></p>${/^https:\/\/((docs\.google\.com)|(forms\.gle))\//.test(C['form'+t])?`<a class="button" href="${esc(C['form'+t])}" target="_blank" rel="noopener">級任老師填寫報名表</a>`:'<button disabled>報名入口未開放</button>'}</article>`).join('');
function category(e){return e.name.includes('歌唱')?'singing':['essay','phonetic','brush','pen'].includes(e.id)?'writing':'speaking';}
function renderGuides(filter='all'){document.querySelector('#guides').innerHTML=C.events.filter(e=>filter==='all'||category(e)===filter).map(e=>`<article class="guide-card"><h3>${esc(e.name)}</h3><p>${e.grades.join('、')}年級，${esc(e.venue)}</p><div>${e.kind==='phonetic'?'<span class="score-chip">200字 × 0.5分</span>':e.kind==='situational'?'<span class="score-chip">100分制綜合評定</span><p>評分向度：內容完整、表達流暢、深具創意、從容自信、生動自然、對答如流。</p>':e.criteria.map(c=>`<span class="score-chip">${esc(c[0])} ${c[1]}%</span>`).join('')}</div><details><summary>準備事項與完整規定</summary><p>${esc(e.rules)}</p>${e.pending?`<p class="supplement">${esc(e.pending)}</p>`:''}</details>${hasPublishedMaterial(e.id)?'<p><a href="#downloads">前往教材與題目下載</a></p>':''}</article>`).join('');}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderGuides(b.dataset.category);}));renderGuides();
if(C.publishedResults.length)document.querySelector('#resultList').innerHTML='<table><thead><tr><th>項目</th><th>年級</th><th>班級</th><th>姓名</th><th>名次</th></tr></thead><tbody>'+C.publishedResults.map(r=>`<tr>${[r.event,r.grade,r.class,r.name,r.award].map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')+'</tbody></table>';

function materialLink(item){
 const url=materialURL(item);
 if(!url)return '';
 return `<li><a href="${esc(url)}" ${url.startsWith('https://')?'target="_blank" rel="noopener"':'download'}>${esc(item.label||'下載檔案')}</a></li>`;
}
function materialURL(item){const url=String(item.url||'');return /^(https:\/\/|materials\/)/.test(url)||/^[^/\\?#]+\.(pdf|mp3)$/i.test(url)?url:'';}
function audioMaterial(item){const url=materialURL(item);if(!url)return '';return `<div class="audio-material"><h4>${esc(item.label||'示範音檔')}</h4><audio controls preload="none" aria-label="${esc(item.label||'示範音檔')}" src="${esc(url)}">您的瀏覽器無法播放音檔，請使用下方下載連結。</audio><a href="${esc(url)}" ${url.startsWith('https://')?'target="_blank" rel="noopener"':'download'}>下載音檔（MP3）</a></div>`;}
function hasPublishedMaterial(id){return [...(C.readingMaterials||[]),...(C.speechMaterials||[])].some(m=>m.id===id&&(m.texts?.length||m.audio?.length));}
document.querySelector('#readingMaterials').innerHTML=(C.readingMaterials||[]).map(m=>`<article class="reg-card"><h3>${esc(m.title)}</h3><h4>朗讀文本</h4>${m.texts.length?'<ul>'+m.texts.map(materialLink).join('')+'</ul>':'<p class="muted">教材上架後，即可在此下載文本。</p>'}<h4>示範音檔</h4>${m.audio.length?m.audio.map(audioMaterial).join(''):'<p class="muted">音檔上架後，即可在此收聽或下載。</p>'}</article>`).join('');
document.querySelector('#speechMaterials').innerHTML=(C.speechMaterials||[]).map(m=>`<article class="reg-card"><h3>${esc(m.title)}</h3><p>${esc(m.description||'')}</p><ul>${m.texts.map(materialLink).join('')}</ul></article>`).join('');

