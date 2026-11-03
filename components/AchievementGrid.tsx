"use client";
import { t, type Locale } from "@/lib/healthflow";
type Stats={activities:number;streak:number;steps:number;meals:number;visits:number;points:number;activeDays:number;week:number};
type Badge={title:string;detail:string;value:string;color:string[];unlocked:boolean};
export default function AchievementGrid({locale,stats}:{locale:Locale;stats:Stats}){
 const badges:Badge[]=[
  {title:"Алғашқы қадам",detail:"Белсенді күнді белгіле",value:"1",color:["#b357cf","#7148d8"],unlocked:stats.activeDays>=1},
  {title:"Бірінші жаттығу",detail:"1 белсенділікті аяқта",value:"1",color:["#f2a04c","#d85b3f"],unlocked:stats.activities>=1},
  {title:"Тұрақты ырғақ",detail:"5 белсенділік",value:"5",color:["#57b5e4","#3477c7"],unlocked:stats.activities>=5},
  {title:"Он қадам",detail:"10 белсенділік",value:"10",color:["#a46ceb","#7648cc"],unlocked:stats.activities>=10},
  {title:"Белсенді өмір",detail:"25 белсенділік",value:"25",color:["#42c5ad","#168f80"],unlocked:stats.activities>=25},
  {title:"Үш күн қатарынан",detail:"3 күндік серия",value:"3",color:["#55b5e1","#4f79c9"],unlocked:stats.streak>=3},
  {title:"Апталық әдет",detail:"7 күндік серия",value:"7",color:["#e16aad","#a844a0"],unlocked:stats.streak>=7},
  {title:"10 мың қадам",detail:"Жалпы 10 000 қадам",value:"10K",color:["#5ccc8d","#228a69"],unlocked:stats.steps>=10000},
  {title:"Мәзір шебері",detail:"10 ас жазбасы",value:"10",color:["#ed8e65","#cd554f"],unlocked:stats.meals>=10},
  {title:"Жаңа орын",detail:"1 барған орын",value:"1",color:["#61c4bc","#248f91"],unlocked:stats.visits>=1},
  {title:"Қала зерттеуші",detail:"5 барған орын",value:"5",color:["#aa8be7","#6f5ac3"],unlocked:stats.visits>=5},
 ];
 const unlocked=badges.filter(b=>b.unlocked).length;
 return <section className="panel achievements"><div className="panel-heading"><div><span className="eyebrow">ЖЕКЕ ПРОГРЕСС</span><h2>{t(locale,"Achievements")}</h2><p>{t(locale,"Unlock badges from your activity")}</p></div><span className="count-pill">{unlocked}/{badges.length}</span></div>
  <div className="achievement-stats"><div><b>{stats.points.toLocaleString(locale==="kk"?"kk-KZ":locale==="ru"?"ru-RU":"en-US")}</b><small>{t(locale,"Points")}</small></div><div><b>{stats.streak}</b><small>{t(locale,"Current streak")}</small></div><div><b>{stats.activities}</b><small>{t(locale,"Completed activities")}</small></div><div><b>{stats.week}</b><small>{t(locale,"This week")}</small></div></div>
  <div className="badge-grid">{badges.map((badge,index)=><article className={badge.unlocked?"badge-card":"badge-card locked"} key={badge.title}><svg viewBox="0 0 110 112" aria-hidden="true"><defs><linearGradient id={`badge-${index}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={badge.color[0]}/><stop offset="1" stopColor={badge.color[1]}/></linearGradient></defs><path d="M55 5 96 20v35c0 26-17 41-41 52C31 96 14 81 14 55V20L55 5Z" fill="#222939" stroke={`url(#badge-${index})`} strokeWidth="7"/><path d="M55 14 88 26v28c0 20-13 32-33 42-20-10-33-22-33-42V26l33-12Z" fill={`url(#badge-${index})`}/><path d="m55 26 8 17 19 3-14 13 3 19-16-9-17 9 4-19-14-13 19-3 8-17Z" fill="#fff4ce" stroke="#fff" strokeWidth="2"/><circle cx="82" cy="83" r="19" fill="#f2eee9" stroke={badge.color[1]} strokeWidth="4"/><path d="m73 83 6 6 12-14" fill="none" stroke={badge.color[1]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><text x="82" y="108" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">{badge.value}</text></svg><b>{badge.title}</b><small>{badge.detail}</small></article>)}</div>
 </section>;
}
