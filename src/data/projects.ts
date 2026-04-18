export type Status = 'ACTIVE' | 'WIP' | 'ARCHIVED';

export interface Project {
  name: string;
  url: string;
  status: Status;
  description: { en: string; zh: string };
  tech?: string;
  updated: string; // YYYY-MM
}

export const PROJECTS: Project[] = [
  {
    name: 'magi',
    url: 'https://magi.moss.sg',
    status: 'ACTIVE',
    description: {
      en: 'Three wise men, one question, zero hallucination tolerance. A MAGI-inspired multi-LLM consensus oracle.',
      zh: '三贤者共识系统 —— 致敬 EVA 的 MAGI。三个 LLM 独立判断，少数服从多数。',
    },
    tech: 'React · Vite · OpenRouter',
    updated: '2026-04',
  },
  {
    name: 'BrewMap',
    url: 'https://brewmap.moss.sg',
    status: 'WIP',
    description: {
      en: "A structured map of Singapore's specialty coffee scene — roasters, beans, and tasting notes.",
      zh: '新加坡精品咖啡豆地图 —— 烘焙商、豆单、风味笔记的结构化索引。',
    },
    tech: 'Astro · TypeScript · Cloudflare Pages',
    updated: '2026-04',
  },
  {
    name: 'sbti',
    url: 'https://sbti.moss.sg',
    status: 'WIP',
    description: {
      en: 'The Sha-Bi Targets initiative. Because the serious one already has a website.',
      zh: '傻逼目标倡议 —— 一本正经地胡说八道。',
    },
    updated: '2026-04',
  },
];
