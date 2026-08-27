/* ------------------------------------------------ feuilles */
function fermer(){document.getElementById('voile').classList.remove('on');}
function optionsCompte(sel){
  return `<div class="eyebrow" style="margin-bottom:6px">Compte</div>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="cpt">${
    D.comptes.map((c,i)=>`<button class="puce cbtn" data-id="${c.id}" onclick="choisirCompte(this)"
      style="${(sel?c.id===sel:i===0)?`background:${c.couleur};color:#fff;border-color:${c.couleur}`:''}">${esc(c.nom)}</button>`).join('')}</div>`;
}
function choisirCompte(b){
  document.querySelectorAll('#cpt .cbtn').forEach(x=>{x.style.cssText='';});
  const c=D.comptes.find(x=>x.id===b.dataset.id);
  b.style.cssText=`background:${c.couleur};color:#fff;border-color:${c.couleur}`;
}
const compteChoisi=()=>{
  const b=document.querySelector('#cpt .cbtn[style*="background"]');
  return b?b.dataset.id:(D.comptes[0]||{}).id;
};
let typeOp='out', nbEch=4;

function ouvrir(quoi){
  const f=document.getElementById('feuille');
  if(quoi==='op'){typeOp='out';
    f.innerHTML=`<div class="tete"><h2>Nouvelle opération</h2><button class="fermer" onclick="fermer()">${SVG.croix}</button></div>
      <div style="display:flex;gap:8px;margin-bottom:16px" id="typ">
        <button class="puce tbtn" data-t="in" onclick="choisirType(this)" style="flex:1;padding:12px 0;font-size:15px">Argent reçu</button>
        <button class="puce tbtn" data-t="out" onclick="choisirType(this)" style="flex:1;padding:12px 0;font-size:15px;background:var(--out);color:#fff;border-color:var(--out)">Dépense</button></div>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Montant (€)</div>
        <input id="m" type="number" inputmode="decimal" placeholder="0,00"
          style="font-size:26px;font-weight:800;letter-spacing:-.03em;padding:14px"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">C'est quoi ?</div>
        <input id="l" placeholder="Courses, salaire, essence…"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Date</div>
        <input id="d" type="date" value="${auj()}"></label>
      ${optionsCompte()}
      <button class="btn" style="background:var(--out)" id="ok" onclick="validerOp()">${SVG.check} Enregistrer</button>`;
  }
  if(quoi==='rec') f.innerHTML=`<div class="tete"><h2>Paiement récurrent</h2><button class="fermer" onclick="fermer()">${SVG.croix}</button></div>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Nom</div><input id="l" placeholder="Loyer, Netflix, assurance…"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Montant par mois (€)</div><input id="m" type="number" inputmode="decimal" placeholder="0,00"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Jour du prélèvement</div><input id="j" type="number" min="1" max="31" value="1"></label>
      ${optionsCompte()}<button class="btn" style="background:var(--rec)" onclick="validerRec()">${SVG.check} Ajouter</button>`;
  if(quoi==='four'){nbEch=4;
    f.innerHTML=`<div class="tete"><h2>Paiement en plusieurs fois</h2><button class="fermer" onclick="fermer()">${SVG.croix}</button></div>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Achat</div><input id="l" placeholder="Casque, pneus, meuble…"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Montant total (€)</div><input id="m" type="number" inputmode="decimal" placeholder="0,00"></label>
      <div class="eyebrow" style="margin-bottom:6px">Nombre d'échéances</div>
      <div style="display:flex;gap:8px;margin-bottom:14px" id="ech">${[2,3,4,10,12].map(n=>
        `<button class="puce nbtn" data-n="${n}" onclick="choisirNb(this)" style="flex:1;padding:10px 0${n===4?';background:var(--four);color:#fff;border-color:var(--four)':''}">${n}x</button>`).join('')}</div>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Échéances déjà payées</div><input id="p" type="number" min="0" value="0"></label>
      ${optionsCompte()}<button class="btn" style="background:var(--four)" onclick="validerFour()">${SVG.check} Ajouter</button>`;
  }
  if(quoi==='goal') f.innerHTML=`<div class="tete"><h2>Nouvel objectif d'épargne</h2><button class="fermer" onclick="fermer()">${SVG.croix}</button></div>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Pour quoi ?</div><input id="l" placeholder="Vacances, permis, PS5…"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Montant à atteindre (€)</div><input id="m" type="number" inputmode="decimal" placeholder="0,00"></label>
      <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Déjà mis de côté (€)</div><input id="e" type="number" inputmode="decimal" placeholder="0,00"></label>
      <button class="btn" style="background:var(--goal)" onclick="validerGoal()">${SVG.check} Créer l'objectif</button>`;
  document.getElementById('voile').classList.add('on');
}
function choisirType(b){
  typeOp=b.dataset.t;
  document.querySelectorAll('#typ .tbtn').forEach(x=>{x.style.cssText='flex:1;padding:12px 0;font-size:15px';});
  const c=typeOp==='in'?'var(--in)':'var(--out)';
  b.style.cssText=`flex:1;padding:12px 0;font-size:15px;background:${c};color:#fff;border-color:${c}`;
  document.getElementById('ok').style.background=c;
}
function choisirNb(b){
  nbEch=+b.dataset.n;
  document.querySelectorAll('#ech .nbtn').forEach(x=>{x.style.cssText='flex:1;padding:10px 0';});
  b.style.cssText='flex:1;padding:10px 0;background:var(--four);color:#fff;border-color:var(--four)';
}
const val=id=>{const e=document.getElementById(id);return e?e.value:'';};

function validerOp(){
  const m=nb(val('m')); if(m<=0) return;
  D.ops.unshift({id:uid(),type:typeOp,montant:m,
    libelle:val('l').trim()||(typeOp==='in'?'Entrée':'Dépense'),
    compteId:compteChoisi(),date:val('d')||auj()});
  fermer();maj();
}
function validerRec(){
  const m=nb(val('m')),l=val('l').trim(); if(m<=0||!l) return;
  D.recs.push({id:uid(),libelle:l,montant:m,jour:Math.min(31,Math.max(1,parseInt(val('j'))||1)),
    compteId:compteChoisi(),dernierMois:null});
  fermer();maj();
}
function validerFour(){
  const t=nb(val('m')),l=val('l').trim(); if(t<=0||!l) return;
  D.fours.push({id:uid(),libelle:l,total:t,nb:nbEch,
    payees:Math.min(nbEch,parseInt(val('p'))||0),compteId:compteChoisi(),dernierMois:null});
  fermer();maj();
}
function validerGoal(){
  const c=nb(val('m')),l=val('l').trim(); if(c<=0||!l) return;
  D.goals.push({id:uid(),nom:l,cible:c,epargne:nb(val('e')),couleur:COUL[D.goals.length%6]});
  fermer();maj();
}

/* ------------------------------------------------ démarrage */
charger();rendre();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});

/* ------------------------------------------------ démarrage */
charger();rendre();
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
