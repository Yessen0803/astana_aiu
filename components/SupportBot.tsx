"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { t, type Locale } from "@/lib/healthflow";

type Message = { id: string; role: "user" | "bot"; text: string };

const replies: Record<Locale, Record<string, string>> = {
  kk: {
    hello: "Сәлем",
    intro: "HealthFlow AI көмекшісімін. Тамақ, калория, қадам, ұйқы, әдеттер, достар, фото жариялау, бронь немесе баптаулар туралы сұрай бер.",
    nutrition: "Тамақтану бөлімінен ай мен күнді таңда да, таңғы ас, түскі ас және кешкі асқа пайдалы тағам қос. Порция грамы мен калориясы автоматты есептеліп, күндік мақсатпен салыстырылады.",
    calories: "Күндік калория мақсатын Тамақтану бөліміндегі мақсат өрісінен өзгерте аласың. Тағамның калориясы рецепт дерегіне негізделген шамамен мән; мақсаттан асса, күндік көрсеткіш ескерту береді.",
    movement: "Қозғалыс бөлімінде жаттығуды жоспарлап, орындағаныңды белгілей аласың. Қадам санын Бүгін бетінде енгізіп, «Қадамды сақтау» батырмасын бас. Апталық және айлық ритм Прогресс бөлімінде көрінеді.",
    sleep: "Күтім бөлімінде күнді таңдап, ұйықтаған және оянған уақытыңды енгізіп, сақта. Айлық ұйқы ұзақтығы мен алдыңғы күндермен салыстыру сонда көрсетіледі.",
    habits: "Бүгін бетіндегі күнделікті әдеттерді түртіп белгіле. Жаңа әдет қосу үшін төмендегі атау өрісіне жазып, «Әдет қосу» батырмасын бас.",
    profile: "Профиль бөліміне өтіп, суретті ауыстыруды басып фото таңда. Атыңды, қалаңды, сипаттамаңды, тілді және ақ/қара тақырыпты да осы жерден өзгертесің.",
    friends: "Достар бөлімінде атты енгізіп, дос қосуға болады. Карточкасын бассаң, оның статистикасы мен жетістіктері бөлек терезеде ашылады. Қазір профильдер осы браузерде сақталатын демо өгейлер.",
    community: "Қауымдастық бөлімінде фото таңдап, сипаттама жазып жарияла. Жазбаларға лайк басып, пікір қалдыруға болады; демо деректер осы браузерде сақталады.",
    restaurants: "Пайдалы ас бөлімінде мейрамхананы таңдап, үстел бронда. Қазір бұл жергілікті демо бронь; төлем қолданбада алынбайды, орынға барғанда жасалады.",
    settings: "Профиль → Баптаулар бөлімінен қазақша, орысша немесе ағылшынша тілді, ақ немесе қара тақырыпты таңдауға болады.",
    notifications: "Жоғарғы жақтағы қоңырауды бассаң, хабарландырулар ашылады. Хабарламаны басқанда толық нұсқасы жеке терезеде көрсетіледі; оқылған деп белгілеуге де болады.",
    admin: "Әкімші демосын Профиль → Әкімші демосы арқылы ашуға болады. Admin панелінде осы браузердегі қауымдастық жазбаларын өшіріп, жергілікті статистиканы қарай аласың. Бұл әлі сервермен қорғалмаған демо.",
    greeting: "Сәлем",
    fallback: "Мен HealthFlow мүмкіндіктері бойынша көмектесемін. Мысалы: «калорияны қалай есептеймін?», «қадамды қайда жазамын?», «ұйқыны қалай белгілеймін?», «суретті қалай саламын?» деп сұра."
  },
  ru: {
    hello: "Привет",
    intro: "Я AI-помощник HealthFlow. Спрашивай про питание, калории, шаги, сон, привычки, друзей, фото, бронирование и настройки.",
    nutrition: "В разделе «Питание» выбери месяц и день, затем добавь полезные блюда на завтрак, обед и ужин. Граммы порции и калории пересчитываются автоматически и сравниваются с дневной целью.",
    calories: "Дневную цель калорий можно изменить в поле цели в разделе «Питание». Калорийность — примерная, по данным рецепта; при превышении цели появится отметка.",
    movement: "В разделе «Движение» запланируй тренировку и отметь её выполнение. Шаги введи на главной странице и нажми «Сохранить шаги». Недельный и месячный ритм смотри в «Прогрессе».",
    sleep: "В разделе «Уход» выбери дату, укажи время сна и пробуждения и сохрани. Там отображаются длительность сна за месяц и сравнение с предыдущими днями.",
    habits: "Отмечай привычки на главной странице. Чтобы добавить новую, введи название в поле внизу и нажми «Добавить привычку».",
    profile: "Открой «Профиль» и нажми смену фото, чтобы загрузить изображение. Там же можно поменять имя, город, описание, язык и светлую или тёмную тему.",
    friends: "В разделе «Друзья» введи имя и добавь друга. Нажми его карточку, чтобы открыть отдельное окно со статистикой и достижениями. Сейчас это демо-профили, сохранённые в браузере.",
    community: "В «Сообществе» выбери фото, добавь подпись и опубликуй. Можно ставить лайки и оставлять комментарии; демо-данные хранятся в этом браузере.",
    restaurants: "В разделе «Полезная еда» выбери ресторан и забронируй столик. Сейчас это локальное демо-бронирование; оплата в приложении не проходит, рассчитаться можно в заведении.",
    settings: "Открой «Профиль» → «Настройки», чтобы выбрать русский, казахский или английский язык, а также светлую или тёмную тему.",
    notifications: "Нажми колокольчик сверху, чтобы открыть уведомления. Нажатие на сообщение открывает полный текст в отдельном окне; там же его можно отметить прочитанным.",
    admin: "Демо администратора можно открыть в «Профиле» через пункт админ-демо. Панель позволяет удалять публикации и смотреть локальную статистику. Пока это демо без защиты сервером.",
    greeting: "Привет",
    fallback: "Я помогаю с функциями HealthFlow. Например, спроси: «как считать калории?», «где записать шаги?», «как отметить сон?» или «как загрузить фото?»."
  },
  en: {
    hello: "Hi",
    intro: "I’m the HealthFlow AI assistant. Ask about meals, calories, steps, sleep, habits, friends, photos, reservations, or settings.",
    nutrition: "In Nutrition, choose a month and date, then add healthy breakfast, lunch, and dinner meals. Portion grams and calories update automatically and are compared with your daily target.",
    calories: "Change your daily calorie target in the goal field in Nutrition. Food calories are estimates based on recipe data; the page flags days that go over the target.",
    movement: "Plan a workout and mark it complete in Movement. Enter your steps on the Today page and press Save steps. Check weekly and monthly rhythms in Progress.",
    sleep: "In Care, choose a date, enter when you went to sleep and woke up, then save. The page shows monthly sleep duration and comparisons with previous days.",
    habits: "Tap daily habits on the Today page to mark them done. To add one, enter a name in the field below and press Add habit.",
    profile: "Open Profile and choose Change profile photo to upload an image. You can also update your name, city, bio, language, and light or dark theme there.",
    friends: "In Friends, enter a name and add someone. Click their card to open a separate profile window with stats and achievements. These are currently demo profiles stored in this browser.",
    community: "In Community, choose a photo, add a caption, and publish. You can like posts and comment; demo data stays in this browser.",
    restaurants: "In Healthy food, choose a restaurant and reserve a table. Reservations are currently a local demo; payment is not processed in the app and happens at the venue.",
    settings: "Open Profile → Settings to choose Kazakh, Russian, or English, and switch between light and dark themes.",
    notifications: "Click the bell at the top to open notifications. Clicking a message opens its full content in a separate window, where you can also mark it as read.",
    admin: "Open the admin demo from Profile → Admin demo. The panel can remove community posts and show local stats. It is currently a browser demo without server security.",
    greeting: "Hi",
    fallback: "I can help with HealthFlow features. Try asking: “how do I track calories?”, “where do I enter steps?”, “how do I log sleep?”, or “how do I upload a photo?”"
  }
};

function answer(text: string, locale: Locale, name: string) {
  const value = text.toLocaleLowerCase().replace(/[’']/g, "'");
  const reply = replies[locale];
  const firstName = name.trim().split(/\s+/)[0] || name;
  const patterns: [RegExp, keyof typeof reply][] = [
    [/(сәлем|салем|ассала|привет|здравствуй|добрый день|доброе утро|hello|^hi\b|^hey\b|қайырлы)/, "greeting"],
    [/(күндік норма|нормадан|цель калор|лимит|артық калор|калорий.*(есеп|норма)|calorie target|calorie goal)/, "calories"],
    [/(калор|ккал|калория|пп|грамм|таңғы ас|завтрак|түскі ас|обед|кешкі ас|ужин|тамақ|питани|еда|meal|food|nutrition|breakfast|lunch|dinner)/, "nutrition"],
    [/(қадам|шаг|жүріс|жаттығ|спорт|қозғал|движ|трениров|activity|steps|workout|movement|exercise|run|walk)/, "movement"],
    [/(ұйқы|ұйық|сон|спать|сна|sleep|bedtime|wake)/, "sleep"],
    [/(әдет|привыч|habit|routine)/, "habits"],
    [/(профил|сурет|фото|аватар|загруз|фотограф|profile|photo|picture|avatar|upload)/, "profile"],
    [/(дос|достар|друг|друз|friend)/, "friends"],
    [/(қауым|пост|лайк|пікір|коммент|сообщ|community|post|like|comment)/, "community"],
    [/(мейрам|ресторан|брон|стол|оплат|restaurant|reserve|booking|payment)/, "restaurants"],
    [/(тіл|язык|тема|тақырып|настрой|баптау|settings|language|theme|dark mode|light mode)/, "settings"],
    [/(уведом|хабарлан|қоңырау|колоколь|notification|bell)/, "notifications"],
    [/(админ|әкімші|admin|администратор)/, "admin"]
  ];
  const matched = patterns.find(([pattern]) => pattern.test(value));
  if (matched?.[1] === "greeting") return `${reply.hello}, ${firstName}! ${reply.intro}`;
  const response = matched ? reply[matched[1]] : reply.fallback;
  return `${firstName}, ${response}`;
}

export default function SupportBot({ locale, name }: { locale: Locale; name: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const messageBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setMessages(JSON.parse(localStorage.getItem("hf:support") || "[]")); }
    catch { setMessages([]); }
  }, []);
  useEffect(() => { messageBox.current?.scrollTo({ top: messageBox.current.scrollHeight, behavior: "smooth" }); }, [messages, open]);

  function persist(next: Message[]) {
    setMessages(next);
    try { localStorage.setItem("hf:support", JSON.stringify(next)); } catch { /* Keep the conversation usable if storage is full. */ }
  }
  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", text };
    const next = [...messages, userMessage].slice(-30);
    persist(next);
    setDraft("");
    window.setTimeout(() => {
      let current = next;
      try { current = JSON.parse(localStorage.getItem("hf:support") || "[]"); } catch { /* Use in-memory messages. */ }
      const botMessage: Message = { id: `a-${Date.now()}`, role: "bot", text: answer(text, locale, name) };
      persist([...current, botMessage].slice(-30));
    }, 180);
  }

  const shortcuts = locale === "ru" ? ["Как считать калории?", "Как записать сон?"] : locale === "en" ? ["How do I track calories?", "How do I log sleep?"] : ["Калорияны қалай есептеймін?", "Ұйқыны қалай белгілеймін?"];
  const title = locale === "ru" ? "AI-чат" : locale === "en" ? "AI chat" : "AI чат";
  const firstName = name.trim().split(/\s+/)[0] || name;
  const greeting = `${replies[locale].hello}, ${firstName}! ${replies[locale].intro}`;

  return <div className="support-widget"><button className="support-launch" onClick={() => setOpen(!open)} aria-expanded={open}>✦ {title}</button>{open&&<section className="support-window"><header><div><b>HealthFlow AI</b><small>{locale === "ru" ? "Помощник по приложению" : locale === "en" ? "HealthFlow assistant" : "HealthFlow көмекшісі"}</small></div><button className="icon-button" onClick={() => setOpen(false)} aria-label={t(locale,"Close")}>×</button></header><div className="support-messages" ref={messageBox} aria-live="polite">{messages.length?messages.map(item=><p className={`chat-bubble ${item.role}`} key={item.id}>{item.text}</p>):<p className="chat-bubble bot">{greeting}</p>}</div><div className="support-shortcuts">{shortcuts.map(item=><button key={item} onClick={()=>setDraft(item)}>{item}</button>)}</div><form onSubmit={send}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={locale === "ru" ? "Спроси HealthFlow AI…" : locale === "en" ? "Ask HealthFlow AI…" : "HealthFlow AI-дан сұра…"} maxLength={500}/><button type="submit">{t(locale,"Send")}</button></form></section>}</div>;
}
