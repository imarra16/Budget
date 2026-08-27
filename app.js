/* ------------------------------------------------ constantes */
const MOIS=['janv.','févr.','mars','avril','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const COUL=['#E0348B','#00B8D9','#12B76A','#7C3AED','#FF8A3D','#F5B301'];
const CLE='budget-v1';

const VIDE={comptes:[
  {id:'c1',nom:'Compte courant',couleur:'#E0348B',soldeInitial:0},
  {id:'c2',nom:'Livret épargne',couleur:'#00B8D9',soldeInitial:0}],
  ops:[],recs:[],fours:[],goals:[]};

/* ------------------------------------------------ outils */
const eur=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n||0);
const eurC=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n||0);
const uid=()=>Math.random().toString(36).slice(2,10);
const cleMois=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const auj=()=>new Date().toISOString().slice(0,10);
const jolie=iso=>{const d=new Date(iso+'T12:00:00');return d.getDate()+' '+MOIS[d.getMonth()];};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nb=v=>parseFloat(String(v).replace(',','.'))||0;

const SVG={
  bas:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17M17 17H7V7"/></svg>',
  haut:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>',
  boucle:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
  check:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  poubelle:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  croix:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  gauche:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  droite:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  plus:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  maison:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  portefeuille:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M17 13h.01"/></svg>',
  boucleNav:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
  cible:'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>'
};

/* ------------------------------------------------ état */
let D=structuredClone(VIDE), tab='accueil', dec=0;

function charger(){
  try{const b=localStorage.getItem(CLE); if(b) D=Object.assign(structuredClone(VIDE),JSON.parse(b));}
  catch(e){}
}
function sauver(){ try{localStorage.setItem(CLE,JSON.stringify(D));}catch(e){} }
function maj(){ sauver(); rendre(); }

/* ------------------------------------------------ calculs */
const soldeDe=c=>c.soldeInitial+D.ops.filter(o=>o.compteId===c.id)
  .reduce((s,o)=>s+(o.type==='in'?o.montant:-o.montant),0);
const soldeTotal=()=>D.comptes.reduce((s,c)=>s+soldeDe(c),0);
const moisCourant=()=>cleMois(new Date());
function moisVu(){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+dec);return d;}

function calc(){
  const mv=cleMois(moisVu()), mc=moisCourant();
  const om=D.ops.filter(o=>o.date.slice(0,7)===mv);
  const recsDus=D.recs.filter(r=>r.dernierMois!==mc);
  const actifs=D.fours.filter(f=>f.payees<f.nb);
  const foursDus=actifs.filter(f=>f.dernierMois!==mc);
  const mRec=recsDus.reduce((s,r)=>s+r.montant,0);
  const mFour=foursDus.reduce((s,f)=>s+f.total/f.nb,0);
  const epargne=D.goals.reduce((s,g)=>s+g.epargne,0);
  const total=soldeTotal();
  return{
    mv,mc,
    entrees:om.filter(o=>o.type==='in').sort((a,b)=>b.date.localeCompare(a.date)),
    totalIn:om.filter(o=>o.type==='in').reduce((s,o)=>s+o.montant,0),
    totalOut:om.filter(o=>o.type==='out').reduce((s,o)=>s+o.montant,0),
    mRec,mFour,epargne,total,
    reste4x:actifs.reduce((s,f)=>s+(f.nb-f.payees)*(f.total/f.nb),0),
    resteAVivre:total-mRec-mFour-epargne
  };
}
const rienDedans=()=>!D.ops.length&&!D.recs.length&&!D.fours.length&&!D.goals.length
  &&D.comptes.every(c=>c.soldeInitial===0);

/* ------------------------------------------------ actions */
function allerA(t){tab=t;document.getElementById('vue').scrollTop=0;rendre();}
function moisPrec(){dec--;rendre();}
function moisSuiv(){if(dec<0){dec++;rendre();}}
function supprimer(cle,id){D[cle]=D[cle].filter(x=>x.id!==id);maj();}

function payerRec(id){
  const r=D.recs.find(x=>x.id===id); if(!r)return;
  r.dernierMois=moisCourant();
  D.ops.unshift({id:uid(),type:'out',montant:r.montant,libelle:r.libelle,compteId:r.compteId,date:auj()});
  maj();
}
function payerEch(id){
  const f=D.fours.find(x=>x.id===id); if(!f)return;
  f.payees++; f.dernierMois=moisCourant();
  D.ops.unshift({id:uid(),type:'out',montant:f.total/f.nb,
    libelle:f.libelle+' ('+f.payees+'/'+f.nb+')',compteId:f.compteId,date:auj()});
  maj();
}
function deCote(id,m){
  const g=D.goals.find(x=>x.id===id); if(!g)return;
  g.epargne=Math.max(0,g.epargne+m); maj();
}
function renomme(id,v){const c=D.comptes.find(x=>x.id===id);if(c){c.nom=v;sauver();}}
function initial(id,v){const c=D.comptes.find(x=>x.id===id);if(c){c.soldeInitial=nb(v);maj();}}
function nouveauCompte(){
  D.comptes.push({id:uid(),nom:'Nouveau compte',soldeInitial:0,couleur:COUL[D.comptes.length%6]});maj();
}
function toutEffacer(){ if(confirm('Tout effacer et repartir de zéro ?')){D=structuredClone(VIDE);maj();} }

function exemple(){
  const n=new Date(), j=x=>new Date(n.getFullYear(),n.getMonth(),x).toISOString().slice(0,10);
  D={comptes:[{id:'c1',nom:'Compte courant',couleur:'#E0348B',soldeInitial:320},
              {id:'c2',nom:'Livret épargne',couleur:'#00B8D9',soldeInitial:1500}],
     ops:[{id:uid(),type:'in',montant:1850,libelle:'Salaire',compteId:'c1',date:j(2)},
          {id:uid(),type:'in',montant:120,libelle:'Remboursement Léa',compteId:'c1',date:j(9)},
          {id:uid(),type:'out',montant:96.4,libelle:'Courses',compteId:'c1',date:j(5)},
          {id:uid(),type:'out',montant:42,libelle:'Essence',compteId:'c1',date:j(11)},
          {id:uid(),type:'out',montant:28.9,libelle:'Restaurant',compteId:'c1',date:j(14)}],
     recs:[{id:uid(),libelle:'Loyer',montant:620,jour:5,compteId:'c1',dernierMois:null},
           {id:uid(),libelle:'Forfait mobile',montant:19.99,jour:8,compteId:'c1',dernierMois:null},
           {id:uid(),libelle:'Électricité',montant:74,jour:15,compteId:'c1',dernierMois:null}],
     fours:[{id:uid(),libelle:'Casque audio',total:240,nb:4,payees:1,compteId:'c1',dernierMois:null},
            {id:uid(),libelle:'Pneus voiture',total:460,nb:4,payees:2,compteId:'c1',dernierMois:null}],
     goals:[{id:uid(),nom:'Vacances été',cible:900,epargne:350,couleur:'#F5B301'},
            {id:uid(),nom:'Nouveau vélo',cible:600,epargne:120,couleur:'#12B76A'}]};
  maj();
}

