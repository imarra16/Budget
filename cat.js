/* ------------------------------------------------ budgets par categorie */

/* total depense sur une categorie pour un mois donne (cle 'AAAA-MM') */
function depenseCat(id, k){
  return D.ops.filter(o => o.type === 'out' && o.catId === id && o.date.slice(0,7) === k)
              .reduce((s,o) => s + o.montant, 0);
}
/* depenses du mois sans categorie */
function depenseSansCat(k){
  return D.ops.filter(o => o.type === 'out' && !o.catId && o.date.slice(0,7) === k)
              .reduce((s,o) => s + o.montant, 0);
}

function vueBudgets(){
  const k = cleMois(moisVu()), mv = moisVu();
  const plafonds = D.cats.reduce((s,c) => s + c.plafond, 0);
  const depense  = D.cats.reduce((s,c) => s + depenseCat(c.id,k), 0);
  const sans     = depenseSansCat(k);

  let h = `<div class="fade"><div class="eyebrow">Mes budgets</div>
    <div class="titre">${eur(depense)} sur ${eur(plafonds)}</div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:0 2px 12px">
      <button class="fermer" style="background:#fff" onclick="moisPrec()">${SVG.gauche}</button>
      <div style="font-weight:800;font-size:15px">${MOIS[mv.getMonth()].replace('.','')} ${mv.getFullYear()}</div>
      <button class="fermer" style="background:#fff;opacity:${dec>=0?.35:1}" onclick="moisSuiv()">${SVG.droite}</button>
    </div>`;

  h += D.cats.length ? D.cats.map(c => {
    const d = depenseCat(c.id, k);
    const pct = c.plafond > 0 ? Math.min(100, d / c.plafond * 100) : 0;
    const trop = d > c.plafond;
    const proche = !trop && c.plafond > 0 && d >= c.plafond * 0.8;
    const barre = trop ? 'var(--out)' : c.couleur;
    return `<div class="carte">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="min-width:0">
          <div style="font-weight:700;font-size:16px">${esc(c.nom)}</div>
          <div class="sous" style="margin-top:2px">Plafond ${eur(c.plafond)} par mois</div>
        </div>
        <div style="display:flex;gap:8px;flex:0 0 auto">
          <button class="puce" style="padding:8px 10px" onclick="ouvrir('cat','${c.id}')">${SVG.crayon}</button>
          <button class="puce" style="padding:8px 10px;color:var(--soft)" onclick="supprimerCat('${c.id}')">${SVG.poubelle}</button>
        </div>
      </div>

      <div style="display:flex;align-items:baseline;gap:6px;margin:12px 0 8px">
        <span style="font-size:24px;font-weight:800;letter-spacing:-.035em;color:${barre}">${eur(d)}</span>
        <span class="sous">/ ${eur(c.plafond)}</span>
      </div>

      <div class="barreobj"><div style="width:${pct}%;background:${barre}"></div></div>

      <div style="margin-top:10px;font-size:13px;font-weight:700;color:${trop?'var(--out)':proche?'var(--four)':'var(--soft)'}">
        ${trop ? 'Dépassé de ' + eur(d - c.plafond)
               : proche ? 'Attention, il ne reste que ' + eur(c.plafond - d)
                        : 'Il te reste ' + eur(c.plafond - d)}
      </div>
    </div>`;
  }).join('')
  : `<div class="carte"><div class="vide">Crée une enveloppe par poste de dépense : nourriture, shopping, sorties…<br>
      Tu fixes un plafond, l'app te dit où tu en es.</div></div>`;

  if (sans > 0) h += `<div class="carte" style="background:#FFF9FC">
    <div class="eyebrow">Hors budget</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
      <div class="sous" style="flex:1">Dépenses sans catégorie ce mois-ci</div>
      <div style="font-weight:800;font-size:17px">${eur(sans)}</div>
    </div></div>`;

  h += `<button class="btn creux" style="margin-top:8px" onclick="ouvrir('cat')">${SVG.plus} Nouvelle enveloppe</button>`;
  return h + '</div>';
}

function supprimerCat(id){
  /* les depenses sont conservees, elles repassent simplement hors budget */
  D.ops.forEach(o => { if (o.catId === id) o.catId = null; });
  D.cats = D.cats.filter(c => c.id !== id);
  maj();
}

/* ------------------------------------------------ formulaire d'enveloppe */
function feuilleCat(E){
  const p = v => v === undefined || v === null ? '' : String(v);
  return `<div class="tete"><h2>${E ? "Modifier l'enveloppe" : 'Nouvelle enveloppe'}</h2>
      <button class="fermer" onclick="fermer()">${SVG.croix}</button></div>
    <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Nom</div>
      <input id="l" placeholder="Nourriture, shopping, sorties…" value="${E ? esc(E.nom) : ''}"></label>
    <label class="champ"><div class="eyebrow" style="margin-bottom:6px">Plafond par mois (€)</div>
      <input id="m" type="number" inputmode="decimal" placeholder="0,00" value="${E ? p(E.plafond) : ''}"
        style="font-size:22px;font-weight:800;letter-spacing:-.03em"></label>
    <div class="eyebrow" style="margin-bottom:6px">Couleur</div>
    <div style="display:flex;gap:10px;margin-bottom:16px" id="coul">${
      COUL.map((c,i) => `<button class="kbtn" data-c="${c}" onclick="choisirCoul(this)"
        style="flex:1;height:38px;border-radius:11px;background:${c};
        border:${(E ? E.couleur === c : i === 0) ? '3px solid var(--ink)' : '3px solid transparent'}"></button>`).join('')}</div>
    <button class="btn" style="background:var(--reste)" onclick="validerCat()">${SVG.check} ${E ? 'Enregistrer' : 'Créer'}</button>`;
}

function choisirCoul(b){
  document.querySelectorAll('#coul .kbtn').forEach(x => { x.style.border = '3px solid transparent'; });
  b.style.border = '3px solid var(--ink)';
}
const coulChoisie = () => {
  const b = document.querySelector('#coul .kbtn[style*="var(--ink)"]');
  return b ? b.dataset.c : COUL[0];
};

function validerCat(){
  const m = nb(val('m')), l = val('l').trim();
  if (m <= 0 || !l) return;
  const c = coulChoisie();
  const e = enCours ? D.cats.find(x => x.id === enCours) : null;
  if (e) { e.nom = l; e.plafond = m; e.couleur = c; }
  else D.cats.push({ id: uid(), nom: l, plafond: m, couleur: c });
  fermer(); maj();
}

/* ------------------------------------------------ selecteur de categorie */
function optionsCat(sel){
  if (!D.cats.length) return '';
  return `<div id="catbloc"><div class="eyebrow" style="margin-bottom:6px">Budget concerné</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="cat">
      <button class="puce kcat" data-id="" onclick="choisirCat(this)"
        style="${!sel ? 'background:var(--soft);color:#fff;border-color:var(--soft)' : ''}">Aucun</button>${
      D.cats.map(c => `<button class="puce kcat" data-id="${c.id}" onclick="choisirCat(this)"
        style="${sel === c.id ? `background:${c.couleur};color:#fff;border-color:${c.couleur}` : ''}">${esc(c.nom)}</button>`).join('')}
    </div></div>`;
}
function choisirCat(b){
  document.querySelectorAll('#cat .kcat').forEach(x => { x.style.cssText = ''; });
  const c = D.cats.find(x => x.id === b.dataset.id);
  b.style.cssText = c ? `background:${c.couleur};color:#fff;border-color:${c.couleur}`
                      : 'background:var(--soft);color:#fff;border-color:var(--soft)';
}
const catChoisie = () => {
  const b = document.querySelector('#cat .kcat[style*="background"]');
  return b && b.dataset.id ? b.dataset.id : null;
};
