/* ------------------------------------------------ rendu */
function ligne(ico,fond,coul,nom,det,droite){
  return `<div class="ligne"><span class="ico" style="background:${fond};color:${coul}">${ico}</span>
    <div class="txt"><div class="nom">${esc(nom)}</div><div class="det">${esc(det)}</div></div>
    <div style="font-size:15px;white-space:nowrap">${droite}</div></div>`;
}

function vueAccueil(){
  const k=calc();
  const segs=[['Récurrents',k.mRec,'var(--rec)'],['Paiements 4x',k.mFour,'var(--four)'],
    ['Épargne mise de côté',k.epargne,'var(--goal)'],['Reste à vivre',Math.max(0,k.resteAVivre),'var(--reste)']]
    .filter(s=>s[1]>0);
  const tot=segs.reduce((s,x)=>s+x[1],0)||1;

  let h=`<div class="fade"><div class="eyebrow">Mon budget</div>
    <div class="titre">${k.total>=0?'Où en est mon argent':'Attention au découvert'}</div>`;

  if(rienDedans()) h+=`<div class="carte" style="background:var(--reste);color:#fff">
    <div style="font-weight:800;font-size:17px;margin-bottom:4px">Commence par ton solde</div>
    <div style="font-size:14px;opacity:.9;margin-bottom:14px;line-height:1.45">
      Renseigne ce que tu as sur tes comptes dans l'onglet Comptes, puis ajoute tes revenus et tes dépenses.</div>
    <button class="btn" style="background:rgba(255,255,255,.16)" onclick="exemple()">Voir avec des données d'exemple</button></div>`;

  h+=`<div class="carte" style="padding:20px">
    <div class="eyebrow">Il te reste vraiment</div>
    <div class="gros ${k.resteAVivre<0?'negatif':''}">${eur(k.resteAVivre)}</div>
    <div class="sous" style="margin-bottom:16px">sur ${eur(k.total)} disponibles, une fois tes engagements du mois retirés</div>
    <div class="jauge">${segs.map(s=>`<div style="width:${s[1]/tot*100}%;background:${s[2]}"></div>`).join('')}</div>
    <div style="margin-top:14px">${segs.length?segs.map(s=>
      `<div class="leg"><span class="pastille" style="background:${s[2]}"></span>
       <span style="flex:1;color:var(--soft)">${s[0]}</span><strong>${eur(s[1])}</strong></div>`).join('')
      :'<div class="vide">Ajoute un solde ou une opération pour voir la répartition.</div>'}</div>
    ${k.resteAVivre<0?`<div class="alerte">Tes engagements dépassent ce que tu as. Il manque ${eur(Math.abs(k.resteAVivre))}.</div>`:''}
  </div>`;

  const mv=moisVu();
  h+=`<div style="display:flex;align-items:center;justify-content:space-between;margin:18px 2px 10px">
    <button class="fermer" style="background:#fff" onclick="moisPrec()">${SVG.gauche}</button>
    <div style="font-weight:800;font-size:15px">${MOIS[mv.getMonth()].replace('.','')} ${mv.getFullYear()}</div>
    <button class="fermer" style="background:#fff;opacity:${dec>=0?.35:1}" onclick="moisSuiv()">${SVG.droite}</button></div>`;

  h+=`<div class="duo" style="margin-bottom:10px">
    <div class="carte" style="padding:14px;margin:0"><span style="color:var(--in)">${SVG.bas}</span>
      <div class="chiffre">${eurC(k.totalIn)}</div><div class="eyebrow">Rentré</div></div>
    <div class="carte" style="padding:14px;margin:0"><span style="color:var(--out)">${SVG.haut}</span>
      <div class="chiffre">${eurC(k.totalOut)}</div><div class="eyebrow">Dépensé</div></div></div>`;

  /* graphique 6 mois */
  const hist=[];let max=1;
  for(let i=5;i>=0;i--){
    const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);
    const c=cleMois(d),o=D.ops.filter(x=>x.date.slice(0,7)===c);
    const e=o.filter(x=>x.type==='in').reduce((s,x)=>s+x.montant,0);
    const p=o.filter(x=>x.type==='out').reduce((s,x)=>s+x.montant,0);
    max=Math.max(max,e,p);hist.push([MOIS[d.getMonth()].replace('.',''),e,p]);
  }
  h+=`<div class="carte"><div class="eyebrow">6 derniers mois</div><div id="graph">${
    hist.map(m=>`<div class="col"><div class="paire">
      <i style="height:${m[1]/max*100}%;background:var(--in)"></i>
      <i style="height:${m[2]/max*100}%;background:var(--out)"></i></div>
      <div class="m">${m[0]}</div></div>`).join('')}</div></div>`;

  h+=`<div class="eyebrow" style="margin:18px 2px 8px">Quand l'argent est rentré</div>
    <div class="carte" style="padding:8px">${k.entrees.length?k.entrees.map(o=>
      ligne(SVG.bas,'#E8F8F0','var(--in)',o.libelle,jolie(o.date),
        `<span style="color:var(--in);font-weight:800">+${eur(o.montant)}</span>`)).join('')
      :'<div class="vide">Aucune rentrée d\'argent ce mois-ci.</div>'}</div></div>`;
  return h;
}

function vueComptes(){
  let h=`<div class="fade"><div class="eyebrow">Mes comptes</div>
    <div class="titre">${eur(soldeTotal())}</div>`;
  D.comptes.forEach(c=>{
    const s=soldeDe(c);
    h+=`<div class="carte" style="border-left:5px solid ${c.couleur}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div style="flex:1;min-width:0">
          <input value="${esc(c.nom)}" onchange="renomme('${c.id}',this.value)"
            style="border:none;background:none;font-size:16px;font-weight:700;color:var(--ink);
            font-family:inherit;padding:0;width:100%;outline:none">
          <div class="eyebrow" style="margin-top:3px">Solde actuel</div></div>
        <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;${s<0?'color:var(--out)':''}">${eur(s)}</div>
      </div>
      <div style="margin-top:12px;display:flex;align-items:center;gap:10px">
        <div class="eyebrow" style="white-space:nowrap">Solde de départ</div>
        <input type="number" inputmode="decimal" value="${c.soldeInitial}" onchange="initial('${c.id}',this.value)"
          style="flex:1;min-width:0;border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;
          font-size:15px;font-family:inherit;color:var(--ink);background:#FFF9FC;outline:none"></div>
      ${D.comptes.length>1?`<button class="corbeille" style="margin-top:10px;color:var(--soft);font-size:12px;display:flex;gap:5px;align-items:center"
        onclick="supprimer('comptes','${c.id}')">${SVG.poubelle} Supprimer ce compte</button>`:''}
    </div>`;
  });
  h+=`<button class="btn creux" style="margin-bottom:22px" onclick="nouveauCompte()">${SVG.plus} Ajouter un compte</button>
    <div class="eyebrow" style="margin:0 2px 8px">Toutes les opérations</div><div class="carte" style="padding:8px">`;
  const ops=D.ops.slice().sort((a,b)=>b.date.localeCompare(a.date));
  h+=ops.length?ops.map(o=>{
    const c=D.comptes.find(x=>x.id===o.compteId);
    return ligne(o.type==='in'?SVG.bas:SVG.haut, o.type==='in'?'#E8F8F0':'#FDEAEA',
      o.type==='in'?'var(--in)':'var(--out)', o.libelle,
      jolie(o.date)+' · '+(c?c.nom:'compte supprimé'),
      `<span style="display:flex;align-items:center;gap:10px">
        <span style="font-weight:800;${o.type==='in'?'color:var(--in)':''}">${o.type==='in'?'+':'−'}${eur(o.montant)}</span>
        <button class="corbeille" onclick="supprimer('ops','${o.id}')">${SVG.poubelle}</button></span>`);
  }).join(''):'<div class="vide">Rien encore. Appuie sur + pour noter une entrée ou une dépense.</div>';
  return h+'</div></div>';
}

function vueEngagements(){
  const k=calc();
  let h=`<div class="fade"><div class="eyebrow">Ce que je dois payer</div>
    <div class="titre">${eur(k.mRec+k.mFour)} ce mois-ci</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:0 2px 8px">
      <div class="eyebrow">Paiements récurrents</div>
      <button class="mini" style="background:var(--rec)" onclick="ouvrir('rec')">+ Ajouter</button></div>
    <div style="margin-bottom:22px">`;
  h+=D.recs.length?D.recs.map(r=>{
    const fait=r.dernierMois===k.mc, saute=fait&&r.statut==='saute';
    return `<div class="carte" style="padding:14px">
      <div style="display:flex;align-items:center;gap:11px">
        <span class="ico" style="background:#F5ECFE;color:var(--rec)">${SVG.boucle}</span>
        <div style="flex:1;min-width:0">
          <div class="nom">${esc(r.libelle)}</div>
          <div class="det">Le ${r.jour} de chaque mois</div></div>
        <div style="font-weight:800;font-size:16px;opacity:${fait?.4:1}">${eur(r.montant)}</div></div>
      <div style="display:flex;gap:8px;margin-top:12px;align-items:center">
        ${fait?`<div style="flex:1;font-size:13px;font-weight:700;color:${saute?'var(--four)':'var(--in)'}">
            ${saute?'Sauté ce mois-ci':'Payé ce mois-ci'}</div>
          <button class="puce" style="padding:8px 12px;font-size:13px;display:flex;gap:5px;align-items:center"
            onclick="annulerRec('${r.id}')">${SVG.retour} Annuler</button>`
        :`<button class="mini" style="flex:1;background:var(--rec);padding:9px 0;font-size:14px"
            onclick="payerRec('${r.id}')">Payer ${eur(r.montant)}</button>
          <button class="puce" style="padding:9px 12px;font-size:13px;display:flex;gap:5px;align-items:center"
            onclick="sauterRec('${r.id}')">${SVG.saut} Sauter</button>`}
        <button class="puce" style="padding:9px 10px" onclick="ouvrir('rec','${r.id}')">${SVG.crayon}</button>
        <button class="puce" style="padding:9px 10px;color:var(--soft)" onclick="supprimer('recs','${r.id}')">${SVG.poubelle}</button>
      </div></div>`;
  }).join(''):'<div class="carte"><div class="vide">Loyer, abonnements, assurance… ajoute ce qui revient chaque mois.</div></div>';
  h+=`</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:0 2px 8px">
      <div class="eyebrow">Paiements en plusieurs fois</div>
      <button class="mini" style="background:var(--four)" onclick="ouvrir('four')">+ Ajouter</button></div>
    <div class="carte"><div class="eyebrow">Total qu'il te reste à payer</div>
      <div style="font-size:28px;font-weight:800;letter-spacing:-.035em;color:var(--four);margin-top:2px">${eur(k.reste4x)}</div></div>`;

  h+=D.fours.length?D.fours.map(f=>{
    const ech=f.total/f.nb, fini=f.payees>=f.nb, ce=f.dernierMois===k.mc;
    return `<div class="carte" style="opacity:${fini?.55:1}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div style="font-weight:700;font-size:16px">${esc(f.libelle)}</div>
        <div class="sous" style="margin-top:2px">${eur(ech)} × ${f.nb} · reste ${eur((f.nb-f.payees)*ech)}</div></div>
        <div style="display:flex;gap:8px;flex:0 0 auto">
          <button class="puce" style="padding:8px 10px" onclick="ouvrir('four','${f.id}')">${SVG.crayon}</button>
          <button class="puce" style="padding:8px 10px;color:var(--soft)" onclick="supprimer('fours','${f.id}')">${SVG.poubelle}</button>
        </div></div>
      <div class="tranches">${Array.from({length:f.nb}).map((_,i)=>
        `<div style="${i<f.payees?'background:var(--four)':''}"></div>`).join('')}</div>
      ${fini?'<div style="color:var(--in);font-weight:800;font-size:13px;display:flex;gap:6px;align-items:center">'+SVG.check+' Entièrement remboursé</div>'
      :ce?`<div class="sous" style="font-weight:600">Échéance du mois réglée · ${f.payees}/${f.nb}</div>`
      :`<button class="btn" style="background:var(--four);padding:10px 14px;font-size:14px" onclick="payerEch('${f.id}')">
          Payer l'échéance ${f.payees+1}/${f.nb} · ${eur(ech)}</button>`}</div>`;
  }).join(''):'<div class="vide">Un achat en 3x ou 4x en cours ? Ajoute-le pour suivre ce qu\'il reste.</div>';
  return h+'</div>';
}

function vueObjectifs(){
  const k=calc();
  let h=`<div class="fade"><div class="eyebrow">Mon épargne</div>
    <div class="titre" style="margin-bottom:6px">${eur(k.epargne)} mis de côté</div>
    <div class="sous" style="margin-bottom:16px">Cet argent reste sur tes comptes mais il est réservé : il est retiré de ton reste à vivre.</div>`;
  h+=D.goals.length?D.goals.map(g=>{
    const pct=g.cible>0?Math.min(100,g.epargne/g.cible*100):0, ok=g.cible>0&&g.epargne>=g.cible;
    return `<div class="carte">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><div style="font-weight:700;font-size:16px">${esc(g.nom)}</div>
        <div class="sous" style="margin-top:2px">${ok?'Objectif atteint 🎉':'Encore '+eur(Math.max(0,g.cible-g.epargne))}</div></div>
        <div style="display:flex;gap:8px;flex:0 0 auto">
          <button class="puce" style="padding:8px 10px" onclick="ouvrir('goal','${g.id}')">${SVG.crayon}</button>
          <button class="puce" style="padding:8px 10px;color:var(--soft)" onclick="supprimer('goals','${g.id}')">${SVG.poubelle}</button>
        </div></div>
      <div style="display:flex;align-items:baseline;gap:6px;margin:12px 0 8px">
        <span style="font-size:24px;font-weight:800;letter-spacing:-.035em;color:${g.couleur}">${eur(g.epargne)}</span>
        <span class="sous">/ ${eur(g.cible)}</span></div>
      <div class="barreobj"><div style="width:${pct}%;background:${g.couleur}"></div></div>
      <div style="display:flex;gap:8px;margin-top:14px">
        ${[10,50,100].map(m=>`<button class="puce" style="flex:1;padding:9px 0" onclick="deCote('${g.id}',${m})">+${m} €</button>`).join('')}
        <button class="puce" style="width:46px;padding:9px 0;color:var(--soft)" onclick="deCote('${g.id}',-10)">−10</button></div></div>`;
  }).join(''):'<div class="vide">Vacances, permis, nouveau téléphone… crée ton premier objectif.</div>';
  h+=`<button class="btn creux" style="border-color:var(--goal);color:var(--goal);margin-top:8px" onclick="ouvrir('goal')">${SVG.plus} Nouvel objectif</button>`;
  if(!rienDedans()) h+=`<button style="margin-top:28px;width:100%;border:none;background:none;color:var(--soft);
    font-size:13px;padding:10px" onclick="toutEffacer()">Effacer toutes mes données</button>`;
  return h+'</div>';
}

function rendre(){
  const v={accueil:vueAccueil,comptes:vueComptes,engagements:vueEngagements,
           budgets:vueBudgets,objectifs:vueObjectifs}[tab];
  document.getElementById('vue').innerHTML=v();
  document.getElementById('nav').innerHTML=[
    ['accueil','Accueil',SVG.maison],['comptes','Comptes',SVG.portefeuille],
    ['engagements','À payer',SVG.boucleNav],['budgets','Budgets',SVG.grille],
    ['objectifs','Épargne',SVG.cible]
  ].map(([id,l,i])=>`<button class="${tab===id?'on':''}" onclick="allerA('${id}')">${i}<span>${l}</span></button>`).join('');
}

