/* ----- Questionnaires implanto (serveur : Questionnaires.gs) ----- */
const QX_FILTRES=[['afaire','À faire'],['moi','Pour moi'],['avis','Avis Dr'],['appeler','À appeler'],['rdv','RDV / consult'],['devis','Devis'],['hors','Hors parcours'],['tous','Tous'],['ancien','Anciens']];
const QX_TEST={afaire:o=>!!o.qui,moi:o=>o.qui===profil(),avis:o=>o.etape==='Avis Dr',appeler:o=>o.etape==='À appeler',rdv:o=>o.etape==='RDV pris'||o.etape==='Consult faite',
  devis:o=>/^Devis/.test(o.etape),hors:o=>o.voie==='hors',tous:o=>o.etape!=='Ancien',ancien:o=>o.etape==='Ancien'};
function vueQuestionnaires(){
  if(!S.qxFiltre) S.qxFiltre=S.ctx.direction?'avis':'afaire';
  M('<div id="qx" class="load">Lecture des questionnaires, de l\'agenda et des devis…</div>');
  charger('qx','getQuestionnaires').then(d=>{S.qx=d;renderQx();}).catch(e=>remplir('qx',erreur(e)));
}
function renderQx(){
  const d=S.qx, k=d.kpis, el=document.getElementById('qx'); if(!d||!el) return;
  const kpi=(v,l)=>'<div class="kpi"><b>'+v+'</b><span>'+l+'</span></div>';
  const rech=qx_norm(S.qxRech||'');
  const liste=d.liste.filter(QX_TEST[S.qxFiltre]||QX_TEST.afaire).filter(o=>!rech||qx_norm(o.patient).indexOf(rech)>-1);
  el.outerHTML='<div id="qx">'+
    (d.colonnesManquantes.length?'<div class="note">Colonnes non reconnues dans le classeur des réponses : '+esc(d.colonnesManquantes.join(', '))+'. Lancer qx_diagnostic() dans l\'éditeur.</div>':'')+
    (d.agenda?'<div class="note">'+esc(d.agenda)+'</div>':'')+
    '<div class="kpis">'+kpi(k.aTraiter,'questionnaires à traiter')+kpi(k.avis,'avis du Dr en attente')+kpi(k.appeler,'patients à appeler')+kpi(k.rdv,'RDV pris')+kpi(k.sans,'consults sans questionnaire ('+d.joursAVenir+' j)')+'</div>'+
    '<div class="card"><h2>Parcours implanto <span class="n">'+d.liste.length+' patients · '+d.nbReponses+' réponses</span><span class="small mute" style="margin-left:auto;font-weight:400">mis à jour '+esc(d.maj)+'</span></h2>'+
    '<div class="qx-pipe">'+d.etapes.filter(e=>k.etapes[e]).map(e=>'<span><b>'+k.etapes[e]+'</b>'+esc(e)+'</span>').join('<i>›</i>')+'</div></div>'+
    '<div class="card" style="margin-top:14px"><h2>Questionnaires <span class="n">'+liste.length+'</span></h2>'+
    '<div class="form"><input type="text" id="qx-q" placeholder="Rechercher un patient…" value="'+esc(S.qxRech||'')+'"></div>'+
    '<div class="chips">'+QX_FILTRES.map(f=>'<button class="'+(S.qxFiltre===f[0]?'on':'')+'" data-qxf="'+f[0]+'">'+f[1]+'</button>').join('')+'</div>'+
    (liste.length?'<ul class="l">'+liste.map(qxItem).join('')+'</ul>':'<p class="mute">Rien ici 👌</p>')+'</div>'+
    '<div class="card" style="margin-top:14px"><h2>Consultations implanto à venir sans questionnaire <span class="n">'+d.sansQuestionnaire.length+'</span></h2>'+
    (d.lien?'':'<div class="note">Renseigner la propriété QX_LIEN_FORMULAIRE (lien forms.gle) pour copier le message.</div>')+
    (d.sansQuestionnaire.length?'<ul class="l">'+d.sansQuestionnaire.map((x,i)=>'<li><span class="d" style="min-width:110px">'+esc(x.quand)+'</span><div class="main"><span class="t">'+esc(x.patient)+'</span><span class="s">'+esc(x.type)+'</span></div>'+(d.lien?'<button class="btn" data-qxmsg="'+i+'">Copier le message</button>':'')+'</li>').join('')+'</ul>':'<p class="mute">Toutes les consultations implanto à venir ont leur questionnaire.</p>')+
    '<p class="small mute">Le tri suit les règles du formulaire (réponses STOP, section « contre-indications médicales »). Il ne pose aucun diagnostic : la décision reste au Dr.</p></div>'+
  '</div>';
  document.getElementById('qx-q').oninput=e=>{S.qxRech=e.target.value;const p=e.target.selectionStart;renderQx();const i=document.getElementById('qx-q');i.focus();i.setSelectionRange(p,p);};
  document.querySelectorAll('[data-qxf]').forEach(b=>b.onclick=()=>{S.qxFiltre=b.dataset.qxf;renderQx();});
}
function qxTag(etape){return etape==='Avis Dr'?'qx-avis':/Hors parcours|Ancien|Clos|refusé/.test(etape)?'':'qx-ok';}
function lstQx(l){ if(!l.length) return '<p class="mute">Rien à faire 👌</p>';
  return '<ul class="l">'+l.map(o=>'<li><div class="main"><span class="t">'+esc(o.patient)+'</span><span class="s">'+esc(o.action)+'</span></div><span class="tag '+qxTag(o.etape)+'">'+esc(o.etape)+'</span></li>').join('')+'</ul>';}
function qx_norm(s){return String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toUpperCase();}
function qxItem(o){
  const dir=S.qx.direction, c=esc(o.cle);
  const lignes=[];
  lignes.push('Reçu le '+esc(o.recu)+(o.nb>1?' ('+o.nb+' réponses)':'')+(o.tel?' · <a href="tel:'+esc(o.tel.replace(/\s/g,''))+'">'+esc(o.tel)+'</a>':'')+(o.email?' · '+esc(o.email):''));
  if(o.motifs.length) lignes.push('<b>'+esc(o.voieLib)+' :</b> '+o.motifs.map(esc).join(' · '));
  if(o.infos.length) lignes.push('ℹ️ '+o.infos.map(esc).join(' · '));
  if(o.rdv) lignes.push('📅 RDV '+esc(o.rdv.quand)+' — '+esc(o.rdv.type)+(o.rdv.approx?' <span class="tag Urgent">nom à confirmer</span>':''));
  else if(o.rdvPasse) lignes.push('📅 Vu le '+esc(o.rdvPasse.quand)+' — '+esc(o.rdvPasse.type));
  if(o.devis) lignes.push('📄 Devis ('+esc(o.devis.source)+') : '+esc(o.devis.statut||'—')+(o.devis.date?' du '+esc(o.devis.date):''));
  if(o.decision) lignes.push('🩺 '+esc(o.decision)+(o.decisionLe?' le '+esc(o.decisionLe):'')+(o.noteDr?' — '+esc(o.noteDr):''));
  if(o.suivi) lignes.push('☎️ '+esc(o.suivi)+' le '+esc(o.suiviLe)+' par '+esc(o.suiviPar));
  const boutons=[], quiDr=S.qx.quiDr;
  // Décision du Dr : seulement quand le tri l'appelle (avis, hors parcours) ou qu'une décision existe déjà
  if(dir&&(o.voie!=='ok'||o.decision)&&!/^Devis|Ancien|Clos/.test(o.etape)) boutons.push(S.qx.decisions.map(x=>'<button class="btn'+(o.decision===x?' p':'')+'" data-qxd="'+esc(x)+'" data-cle="'+c+'">'+esc(x)+'</button>').join('')+(o.decision?'<button class="btn" data-qxd="" data-cle="'+c+'" title="Annuler la décision">↺</button>':''));
  // Suivi du secrétariat : ses actions à elle ; « Clos » seul pour un RDV pris ou une consultation faite
  const suivis=o.qui&&o.qui!==quiDr?S.qx.suivis.filter(x=>x!=='Réorienté'||o.etape==='Hors parcours'):/RDV pris|Consult faite/.test(o.etape)?['Clos']:[];
  if(suivis.length||o.suivi) boutons.push(suivis.map(x=>'<button class="btn'+(o.suivi===x?' p':'')+'" data-qxs="'+esc(x)+'" data-cle="'+c+'">'+esc(x)+'</button>').join('')+(o.suivi?'<button class="btn" data-qxs="" data-cle="'+c+'" title="Effacer le suivi">↺</button>':''));
  const det=dir&&o.detail&&o.detail.length?'<details class="qx-det"><summary>Réponses déclarées</summary><table>'+o.detail.map(x=>'<tr><th>'+esc(x[0])+'</th><td>'+esc(x[1])+'</td></tr>').join('')+'</table></details>':'';
  return '<li><div class="main"><span class="t">'+esc(o.patient)+'</span>'+
    lignes.map(l=>'<span class="qx-l">'+l+'</span>').join('')+
    (o.action?'<span class="qx-act">→ <b>'+esc(o.qui)+'</b> : '+esc(o.action)+'</span>':'')+det+
    (boutons.length?'<div class="qx-btn">'+boutons.join('<span class="qx-sep"></span>')+'</div>':'')+'</div>'+
    '<span class="tag '+qxTag(o.etape)+'">'+esc(o.etape)+'</span></li>';
}
document.addEventListener('click',e=>{
  const d=e.target.closest('[data-qxd]'), s=e.target.closest('[data-qxs]'), m=e.target.closest('[data-qxmsg]');
  if(d){ const note=d.dataset.qxd==='Appeler d\'abord'||d.dataset.qxd==='Réorienter'?(prompt('Note pour l\'équipe (facultatif, sans détail médical) :','')||''):'';
    qxEnvoyer(d,'qxDecider',d.dataset.cle,d.dataset.qxd,note); }
  if(s) qxEnvoyer(s,'qxSuivre',s.dataset.cle,s.dataset.qxs,profil());
  if(m){ const x=S.qx.sansQuestionnaire[+m.dataset.qxmsg];
    copier('Bonjour, en vue de votre consultation d\'implantologie du '+x.jour+', merci de remplir ce court questionnaire (5 minutes) : '+S.qx.lien+' — Cabinet d\'Implantologie de Legé',m); }
});
function qxEnvoyer(b,fn,...args){ b.disabled=true; const t=b.textContent; b.textContent='…';
  appel(fn,...args).then(()=>{delete S.cache.qx; return charger('qx','getQuestionnaires');}).then(d=>{S.qx=d;renderQx();}).catch(e=>{b.disabled=false;b.textContent=t;alert(e.message);});
}
function copier(txt,b){
  const ok=()=>{const t=b.textContent;b.textContent='Copié ✓';setTimeout(()=>{b.textContent=t;},1500);};
  const repli=()=>{const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();let r=false;try{r=document.execCommand('copy');}catch(e){}a.remove();if(r)ok();else prompt('Copier le message :',txt);};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok,repli); else repli();
}
