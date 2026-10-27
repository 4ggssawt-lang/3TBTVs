const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let shows=[], category='الكل';
async function loadShows(){try{const r=await fetch('/api/shows');shows=await r.json();$('showCount').textContent=shows.length;render()}catch{$('catalog').innerHTML='<p class="muted">تعذر تحميل المكتبة. تأكد من تشغيل الخادم.</p>'}}
function render(){
 const term=($('search').value||'').trim().toLowerCase();
 const rows=shows.filter(s=>(category==='الكل'||s.category===category)&&`${s.title} ${s.category} ${s.year} ${s.description}`.toLowerCase().includes(term));
 if(!rows.length){$('catalog').innerHTML='<p class="muted">لا توجد نتائج حاليًا. أضف أعمالًا من لوحة الإدارة لتظهر هنا.</p>';return}
 $('catalog').innerHTML=rows.map(s=>`<article class="show-card" data-id="${s.id}"><div class="poster">${s.poster?`<img src="${esc(s.poster)}" alt="${esc(s.title)}">`:'<span class="poster-brand">3TBTV</span>'}</div><div class="show-info"><h3>${esc(s.title)}</h3><p>${esc(s.category||'مسلسلات')}${s.year?' • '+esc(s.year):''}</p><span class="episode-count">${s.episode_count} حلقة</span></div></article>`).join('');
 document.querySelectorAll('.show-card').forEach(c=>c.addEventListener('click',()=>openShow(c.dataset.id)));
}
async function openShow(id){
 const r=await fetch('/api/shows/'+id);if(!r.ok)return;const s=await r.json();
 const grouped={};s.episodes.forEach(e=>(grouped[e.season]??=[]).push(e));
 $('detailContent').innerHTML=`<div class="detail-hero">${s.poster?`<img class="detail-poster" src="${esc(s.poster)}" alt="">`:'<div class="detail-poster poster-brand" style="display:grid;place-items:center;color:#baff4a;font-size:25px">3TBTV</div>'}<div class="detail-copy"><div class="eyebrow">${esc(s.category||'مسلسلات')}${s.year?' • '+esc(s.year):''}</div><h2>${esc(s.title)}</h2><p>${esc(s.description||'لا يوجد وصف لهذا العمل حتى الآن.')}</p><span class="episode-count">${s.episodes.length} حلقة متاحة</span></div></div><div class="episode-heading"><h3>الحلقات</h3><span class="muted">${Object.keys(grouped).length} موسم</span></div><div class="episode-list">${s.episodes.length?Object.entries(grouped).map(([season,eps])=>`<div><p class="eyebrow">الموسم ${season}</p>${eps.map(e=>`<div class="episode-row" data-episode="${e.id}"><span class="episode-play">▶</span><div><strong>${esc(e.title)}</strong><small>الحلقة ${e.episode_number}${e.description?' • '+esc(e.description):''}</small></div><span class="arrow">←</span></div>`).join('')}</div>`).join(''):'<p class="muted">لم تتم إضافة حلقات لهذا المسلسل بعد.</p>'}</div>`;
 $('detailModal').classList.remove('hidden');
 $('detailContent').querySelectorAll('[data-episode]').forEach(row=>row.addEventListener('click',()=>playEpisode(row.dataset.episode)));
}
async function playEpisode(id){
 const r=await fetch('/api/episodes/'+id);if(!r.ok)return;const e=await r.json();
 $('playerTitle').textContent=`${e.show_title} — ${e.title}`;$('playerDescription').textContent=e.description||'';
 const p=$('player');p.src=e.video;p.load();$('detailModal').classList.add('hidden');$('playerModal').classList.remove('hidden');
}
$('search').addEventListener('input',render);
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');category=b.dataset.category;render()}));
$('closeDetail').addEventListener('click',()=>$('detailModal').classList.add('hidden'));
$('detailModal').addEventListener('click',e=>{if(e.target.id==='detailModal')$('detailModal').classList.add('hidden')});
$('closePlayer').addEventListener('click',closePlayer);
$('playerModal').addEventListener('click',e=>{if(e.target.id==='playerModal')closePlayer()});
function closePlayer(){const p=$('player');p.pause();p.removeAttribute('src');p.load();$('playerModal').classList.add('hidden')}
loadShows();
