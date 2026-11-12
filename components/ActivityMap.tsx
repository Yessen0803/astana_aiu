"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { t, type Locale } from "@/lib/healthflow";
import AppIcon from "@/components/AppIcon";

type Spot = { id: string; kind: string; name: string; area: string; description: string; icon: string; x: number; y: number };
const data: Record<string, Spot[]> = {
  astana: [
    {id:"ast-gym",kind:"Gym",name:"Aspan Fitness",area:"Есіл ауданы",description:"Зал және күш жаттығулары",icon:"🏋️",x:20,y:39},
    {id:"ast-yoga",kind:"Yoga",name:"Satti Yoga",area:"Есіл ауданы",description:"Йога және тыныс тәжірибесі",icon:"🧘",x:58,y:31},
    {id:"ast-dance",kind:"Dance",name:"Qadam Dance",area:"Сарыарқа ауданы",description:"Заманауи би сабақтары",icon:"💃",x:41,y:67},
    {id:"ast-swim",kind:"Swimming",name:"Aqua Step",area:"Алматы ауданы",description:"Бассейн және еркін жүзу",icon:"🏊",x:77,y:69},
    {id:"ast-pilates",kind:"Pilates",name:"Balance Studio",area:"Байқоңыр ауданы",description:"Пилатес және созылу",icon:"🤸",x:64,y:20},
    {id:"ast-outdoor",kind:"Outdoor",name:"River Walk Club",area:"Есіл жағалауы",description:"Топтық серуен бағыты",icon:"🚶",x:31,y:49},
    {id:"ast-strength",kind:"Gym",name:"Nomad Strength",area:"Алматы ауданы",description:"Функционал жаттығу",icon:"💪",x:84,y:51},
    {id:"ast-rhythm",kind:"Dance",name:"Pulse Movement",area:"Нұра ауданы",description:"Би және ырғақ сабақтары",icon:"🎶",x:50,y:84},
  ],
  almaty: [
    {id:"alm-gym",kind:"Gym",name:"Alma Motion",area:"Бостандық ауданы",description:"Жалпы дене дайындығы",icon:"🏋️",x:62,y:35},
    {id:"alm-yoga",kind:"Yoga",name:"Flow Yoga Almaty",area:"Медеу ауданы",description:"Йога және тыныс тәжірибесі",icon:"🧘",x:77,y:24},
    {id:"alm-dance",kind:"Dance",name:"Rhythm House",area:"Алмалы ауданы",description:"Би сабақтары",icon:"💃",x:38,y:55},
    {id:"alm-swim",kind:"Swimming",name:"Tau Swim Club",area:"Әуезов ауданы",description:"Бассейн және жүзу",icon:"🏊",x:30,y:73},
    {id:"alm-pilates",kind:"Pilates",name:"Form Pilates",area:"Бостандық ауданы",description:"Пилатес және мобилити",icon:"🤸",x:70,y:63},
    {id:"alm-outdoor",kind:"Outdoor",name:"Park Run Almaty",area:"Орталық саябақ маңы",description:"Жүгіру және серуен тобы",icon:"🚶",x:48,y:36},
  ],
  shymkent: [
    {id:"shy-gym",kind:"Gym",name:"Shym Fit Space",area:"Әл-Фараби ауданы",description:"Зал және топтық жаттығулар",icon:"🏋️",x:62,y:35},
    {id:"shy-yoga",kind:"Yoga",name:"Ainalayyn Yoga",area:"Қаратау ауданы",description:"Йога және икемділік",icon:"🧘",x:77,y:50},
    {id:"shy-dance",kind:"Dance",name:"Jas Dance",area:"Еңбекші ауданы",description:"Би және хореография",icon:"💃",x:39,y:62},
    {id:"shy-swim",kind:"Swimming",name:"Tulpar Aqua",area:"Қаратау ауданы",description:"Бассейн және жүзу",icon:"🏊",x:27,y:39},
    {id:"shy-pilates",kind:"Pilates",name:"Qanat Pilates",area:"Әл-Фараби ауданы",description:"Пилатес және созылу",icon:"🤸",x:68,y:75},
    {id:"shy-outdoor",kind:"Outdoor",name:"Dendro Walk",area:"Дендросаябақ маңы",description:"Серуен және жеңіл жүгіру",icon:"🚶",x:46,y:27},
  ],
  karaganda: [
    {id:"kar-gym",kind:"Gym",name:"Saryarka Gym",area:"Қазыбек би ауданы",description:"Күш және функционал тренинг",icon:"🏋️",x:62,y:40},
    {id:"kar-yoga",kind:"Yoga",name:"Inner Flow",area:"Қазыбек би ауданы",description:"Йога және тыныс тәжірибесі",icon:"🧘",x:77,y:28},
    {id:"kar-dance",kind:"Dance",name:"Pulse Dance",area:"Майқұдық ауданы",description:"Би студиясы",icon:"💃",x:35,y:61},
    {id:"kar-swim",kind:"Swimming",name:"Aqua Life",area:"Оңтүстік-Шығыс ауданы",description:"Бассейн және жүзу",icon:"🏊",x:72,y:72},
    {id:"kar-pilates",kind:"Pilates",name:"Qaz Pilates",area:"Қазыбек би ауданы",description:"Пилатес және мобилити",icon:"🤸",x:45,y:35},
    {id:"kar-outdoor",kind:"Outdoor",name:"Central Run Club",area:"Орталық саябақ маңы",description:"Серуен және жүгіру тобы",icon:"🚶",x:30,y:29},
  ],
};
const cityNames: Record<string,string> = { astana:"Астана", almaty:"Алматы", shymkent:"Шымкент", karaganda:"Қарағанды" };
const categories = ["Gym","Yoga","Dance","Swimming","Pilates","Outdoor"];
export default function ActivityMap({ locale, onPlan, onVisit, onCity }: { locale: Locale; onPlan: (name:string)=>void; onVisit: (id:string)=>void; onCity?: (city:string)=>void }) {
  const [city,setCity]=useState("astana"),[filter,setFilter]=useState("All"),[selected,setSelected]=useState<string|null>(null),[visited,setVisited]=useState<string[]>([]),[favorites,setFavorites]=useState<string[]>([]);
  useEffect(()=>{try{setCity(localStorage.getItem("hf:city")||"astana");setVisited(JSON.parse(localStorage.getItem("hf:visited")||"[]"));setFavorites(JSON.parse(localStorage.getItem("hf:favorites")||"[]"));}catch{}},[]);
  const spots=useMemo(()=>((data[city]||data.astana).filter(item=>filter==="All"||item.kind===filter)),[city,filter]);
  function chooseCity(value:string){setCity(value);setSelected(null);try{localStorage.setItem("hf:city",value);}catch{}onCity?.(value);}
  function visit(spot:Spot){const next=visited.includes(spot.id)?visited:[...visited,spot.id];setVisited(next);try{localStorage.setItem("hf:visited",JSON.stringify(next));}catch{}onVisit(spot.id);}
  function favorite(id:string){const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];setFavorites(next);try{localStorage.setItem("hf:favorites",JSON.stringify(next));}catch{}}
  const active=spots.find(item=>item.id===selected);
  return <div className="map-panel">
    <div className="panel-heading"><div><span className="eyebrow">ҚАЛАҢДАҒЫ БЕЛСЕНДІЛІК</span><h2>{t(locale,"City activity map")}</h2></div><label className="select-label">{t(locale,"Choose a city")}<select value={city} onChange={e=>chooseCity(e.target.value)}>{Object.entries(cityNames).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>
    <div className="filter-row"><button className={filter==="All"?"filter active":"filter"} onClick={()=>setFilter("All")}>{t(locale,"All")}</button>{categories.map(category=><button key={category} className={filter===category?"filter active":"filter"} onClick={()=>setFilter(category)}>{t(locale,category)}</button>)}</div>
    <div className="city-map" aria-label={`${cityNames[city]} · ${t(locale,"City activity map")}`}><svg viewBox="0 0 900 430" aria-hidden="true"><path className="park" d="M20 52Q80 12 170 48T260 115Q220 176 130 164T22 104ZM650 260Q720 212 870 250V405H705Q640 352 650 260ZM382 280Q430 240 500 270T548 350Q480 390 410 358Z"/><path className="river" d="M-10 370C170 300 205 390 360 330S580 260 900 300"/><path className="road" d="M-20 120C130 180 210 42 360 110S590 200 920 75M-20 315C130 250 200 390 360 315S620 238 930 350M170 -20C230 95 150 190 250 460M540 -20C490 80 600 180 535 460M760 -20C670 100 830 180 730 460M-10 225C180 205 280 230 430 210S720 200 920 230"/></svg><div className="map-pins">{spots.map((spot,index)=><button type="button" key={spot.id} className={selected===spot.id?"map-pin selected":"map-pin"} style={{left:`${spot.x}%`,top:`${spot.y}%`}} onClick={()=>setSelected(spot.id)} title={spot.name}>{index+1}</button>)}</div><div className="map-caption"><span>●　{t(locale,"Sample locations · map is schematic")}</span><b>{cityNames[city]}</b></div></div>
    {active&&<div className="selected-place"><span className="place-emoji"><AppIcon name={active.icon}/></span><div className="selected-place-copy"><b>{active.name}</b><small>{t(locale,active.kind)} · {active.area}</small><small>{active.description}</small></div><div className="place-actions"><button className="button primary small" onClick={()=>onPlan(`${active.name} · ${t(locale,active.kind)}`)}>{t(locale,"Add to plan")}</button><button className="button small" onClick={()=>visit(active)}>{visited.includes(active.id)?t(locale,"Visited"):t(locale,"Mark visited")}</button><button className="icon-button" aria-label="Favorite" onClick={()=>favorite(active.id)}><AppIcon name={favorites.includes(active.id)?"♥":"♡"}/></button></div></div>}
    <div className="spot-grid">{spots.map(spot=><button className={selected===spot.id?"spot-card selected":"spot-card"} key={spot.id} onClick={()=>setSelected(spot.id)}><span><AppIcon name={spot.icon}/></span><b>{spot.name}</b><small>{t(locale,spot.kind)} · {spot.area}</small><small>{spot.description}</small></button>)}</div>
    <p className="local-note">{t(locale,"Sample locations · map is schematic")}. Бұл каталогтағы орындар — прототипке арналған үлгі дерек.</p>
  </div>;
}
