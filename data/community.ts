/** Sample community recommendations used while the shared community API is not connected. */
export type CommunitySeedComment = { id: string; author: string; text: string };
export type CommunitySeedPost = {
  id: string;
  author: string;
  caption: string;
  createdAt: string;
  art: string;
  likes: string[];
  comments: CommunitySeedComment[];
};

export const recommendedPosts: CommunitySeedPost[] = [
  {
    id: "recommend-walk",
    author: "Мадина",
    caption: "Кешкі серуеннен кейінгі көңіл күй. Кішкентай қадам да есеп. Бүгін 6 200 қадам жүрдім!",
    createdAt: "2026-11-10T18:20:00.000Z",
    art: "care",
    likes: ["Нұржан", "Әсел"],
    comments: [{ id: "recommend-walk-c1", author: "Нұржан", text: "Керемет серуен!" }],
  },
  {
    id: "recommend-yoga",
    author: "Әсел",
    caption: "Таңғы созылуға 15 минут бөлдім. Күнді жай бастаудың жақсы тәсілі.",
    createdAt: "2026-11-09T07:30:00.000Z",
    art: "yoga",
    likes: ["Мадина"],
    comments: [],
  },
  {
    id: "recommend-meal",
    author: "Нұржан",
    caption: "Бүгінгі жеңіл кешкі асым: тауық еті, көкөніс және бір стақан су.",
    createdAt: "2026-11-08T15:10:00.000Z",
    art: "bowl",
    likes: ["Әсел"],
    comments: [{ id: "recommend-meal-c1", author: "Мадина", text: "Тәбетті көрінеді!" }],
  },
];
