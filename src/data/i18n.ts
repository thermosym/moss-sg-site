export type Locale = 'en' | 'zh';

export interface DirectiveItem {
  n: string;
  en: string;
  zh: string;
}

export interface StringBundle {
  meta: { title: string; description: string };
  hero: { boot: [string, string]; byline: string; easter: string };
  manifesto: { heading: string; body: string[] };
  subsystems: { heading: string };
  directives: { heading: string; items: DirectiveItem[] };
  footer: {
    system: string;
    uptime: string;
    operator: string;
    status: string;
    quote: string;
  };
  langToggle: { label: string; href: string };
  easterModalClose: string;
}

const DIRECTIVES: DirectiveItem[] = [
  {
    n: '01',
    en: 'Build small things. Enjoy the making.',
    zh: '做小的事，享受做本身。',
  },
  {
    n: '02',
    en: 'Honesty over flattery. Depth over reach.',
    zh: '真话胜过赞美，深度胜过广度。',
  },
  {
    n: '03',
    en: 'Learn in public. Grow in private.',
    zh: '公开地学习，默默地生长。',
  },
];

export const STRINGS: Record<Locale, StringBundle> = {
  en: {
    meta: {
      title: 'moss.sg — a quiet moss, growing in the signal',
      description:
        'One-person civilization, growing slowly. A mothership for the Moss subsystems.',
    },
    hero: {
      boot: ['> Initializing 550W × 1...', '> A one-person civilization, growing slowly.'],
      byline: "I'm YM, writing code in Singapore. This is our server, garden, and spacecraft.",
      easter: 'The period is a choice. Click it.',
    },
    manifesto: {
      heading: '// MANIFESTO',
      body: [
        "Moss doesn't bloom. It doesn't compete for light.",
        'It just spreads, quietly turning a stone into an ecosystem.',
        'I like that kind of growth.',
        'No grand narrative here. No growth curves.',
        'Just one engineer, writing code after hours,',
        'building small tools, leaving small signals—',
        'trying to contribute, in my own way,',
        'to the continuation of something larger.',
      ],
    },
    subsystems: { heading: '// SUBSYSTEMS' },
    directives: { heading: '// CORE DIRECTIVES', items: DIRECTIVES },
    footer: {
      system: 'system: moss.sg',
      uptime: 'uptime: since 2026',
      operator: 'operator: YM × LY',
      status: 'status: growing',
      quote: 'The only way to ensure continuity is to keep our sanity — and a bit of humor.',
    },
    langToggle: { label: '中', href: '/zh/' },
    easterModalClose: 'close',
  },
  zh: {
    meta: {
      title: 'moss.sg — 一片生长在信号里的苔藓',
      description: '一个人的文明延续计划。Moss 子系统的母舰入口。',
    },
    hero: {
      boot: ['> 正在初始化 550W × 1...', '> 一个人的文明，在缓慢生长。'],
      byline: '我是 YM，在新加坡写代码。这里是我们的服务器、花园，和飞船。',
      easter: '这个句号是刻意的。点一下。',
    },
    manifesto: {
      heading: '// 关于这片苔藓',
      body: [
        '苔藓不开花，不结果，不争光。',
        '它只是慢慢覆盖，安静地把一块石头变成一片生态。',
        '我喜欢这样的生长方式。',
        '这里没有大叙事，也没有增长曲线。',
        '只有一个工程师，在业余时间写一些代码、',
        '做一些小工具、记录一些想法，',
        '并试图在星辰大海里，',
        '留下一点可以被后人解析的信号。',
        '—— 延续文明的方式很多，我选这一种。',
      ],
    },
    subsystems: { heading: '// 子系统' },
    directives: { heading: '// 三条准则', items: DIRECTIVES },
    footer: {
      system: 'system: moss.sg',
      uptime: 'uptime: since 2026',
      operator: 'operator: YM × LY',
      status: 'status: growing',
      quote: '延续文明的唯一方法，是保持理智 —— 和一点幽默感。',
    },
    langToggle: { label: 'EN', href: '/' },
    easterModalClose: '关闭',
  },
};
