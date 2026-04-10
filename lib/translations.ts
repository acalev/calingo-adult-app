export const translations = {
  en: {
    nav: {
      home: "Home",
      schedule: "Schedule",
      study: "Study",
      quizzes: "Quizzes",
      progress: "Progress",
      wallet: "Wallet",
      subscription: "Subscription",
      support: "Support",
      admin: "Admin",
    },
    home: {
      title: "Home",
      selectedLanguage: "Selected interface language",
      welcome: "Welcome to Calingo Adult.",
      level: "Your level",
      nextClass: "Next class",
      weeklyTarget: "Weekly target",
      streak: "Current streak",
      targetText: "Attend 3 classes and complete 2 quizzes",
      streakText: "4 days",
    },
    language: {
      title: "Choose your language",
      subtitle: "Select your native interface language.",
      english: "English",
      russian: "Russian",
    },
  },
  ru: {
    nav: {
      home: "Главная",
      schedule: "Расписание",
      study: "Учёба",
      quizzes: "Квизы",
      progress: "Прогресс",
      wallet: "Кошелёк",
      subscription: "Подписка",
      support: "Поддержка",
      admin: "Админ",
    },
    home: {
      title: "Главная",
      selectedLanguage: "Выбранный язык интерфейса",
      welcome: "Добро пожаловать в Calingo Adult.",
      level: "Ваш уровень",
      nextClass: "Следующий урок",
      weeklyTarget: "Цель на неделю",
      streak: "Текущая серия",
      targetText: "Посетить 3 урока и пройти 2 квиза",
      streakText: "4 дня",
    },
    language: {
      title: "Выберите язык",
      subtitle: "Выберите ваш родной язык интерфейса.",
      english: "English",
      russian: "Русский",
    },
  },
} as const;

export type Language = keyof typeof translations;
