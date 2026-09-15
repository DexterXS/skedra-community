import { enMessages } from "./messages.en";
import type { TranslationTree } from "./messages";

/**
 * Russian translation.
 *
 * The English catalogue is used as a safe fallback for keys that have not yet
 * been translated. This keeps the UI complete while allowing the Russian
 * catalogue to grow incrementally.
 */
export const ruMessages = {
	...enMessages,
	common: {
		...enMessages.common,
		cancel: "Отмена",
		save: "Сохранить",
		copy: "Копировать",
		copied: "Скопировано",
		delete: "Удалить",
		create: "Создать",
		edit: "Изменить",
		close: "Закрыть",
		profile: "Профиль",
		settings: "Настройки",
		dashboard: "Главная",
		workspace: "Рабочее пространство",
		projects: "Проекты",
		user: "Пользователь",
		language: "Язык",
		german: "Немецкий",
		english: "Английский",
		back: "Назад",
		none: "Нет",
		default: "По умолчанию",
		transparent: "Прозрачный",
		logout: "Выйти",
		personalSettings: "Личные настройки",
		systemSettings: "Системные настройки",
		workspaceSettings: "Настройки пространства",
		loading: "Загрузка...",
	},
	boardCreation: {
		...enMessages.boardCreation,
		title: "Как зашифровать доску?",
		description:
			"Оба варианта сохраняют доску на вашем сервере Skedra и синхронизируют изменения в реальном времени. Выберите подходящий уровень защиты.",
		serverTitle: "Шифрование на стороне сервера",
		serverDescription:
			"Ваш сервер Skedra шифрует данные и автоматически предоставляет доступ авторизованным пользователям и MCP.",
		serverDetails:
			"API шифрует все данные холста перед сохранением. Сервер может расшифровать их для авторизованного доступа; отдельный ключ доски не требуется.",
		e2eeTitle: "Сквозное шифрование",
		e2eeDescription:
			"Максимальная конфиденциальность: содержимое могут читать только клиенты, у которых есть ключ доски.",
		e2eeDetails:
			"Сервер никогда не видит незашифрованные данные. Для MCP требуется отдельный ключ доски.",
		permanentHint:
			"Режим шифрования закрепляется за этой доской и не может быть изменён без переноса данных.",
		continue: "Подтвердить выбор",
	},
	apiErrors: {
		...enMessages.apiErrors,
		common: {
			...enMessages.apiErrors.common,
			badRequest: "Не удалось обработать запрос.",
			forbidden: "У вас нет прав для этого действия.",
			notFound: "Запрошенный объект не найден.",
			internalServerError: "На сервере произошла непредвиденная ошибка.",
		},
		auth: {
			...enMessages.apiErrors.auth,
			unauthorized: "Войдите в систему снова.",
			INVALID_EMAIL: "Неверный адрес электронной почты.",
			INVALID_PASSWORD: "Неверный пароль.",
			INVALID_EMAIL_OR_PASSWORD: "Неверный адрес электронной почты или пароль.",
			PASSWORD_TOO_SHORT: "Пароль слишком короткий.",
			PASSWORD_TOO_LONG: "Пароль слишком длинный.",
			USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
				"Аккаунт с этим адресом электронной почты уже существует.",
			INVALID_TOKEN: "Ссылка или токен недействительны либо срок их действия истёк.",
			EMAIL_NOT_VERIFIED: "Сначала подтвердите адрес электронной почты.",
			SESSION_EXPIRED: "Сеанс истёк. Войдите снова.",
			USER_NOT_FOUND: "Пользователь не найден.",
			INVALID_CODE: "Неверный код.",
			OTP_HAS_EXPIRED: "Срок действия одноразового кода истёк.",
			TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE:
				"Слишком много попыток. Запросите новый код.",
			TWO_FACTOR_NOT_ENABLED:
				"Двухфакторная аутентификация не включена для этого аккаунта.",
		},
		upload: {
			...enMessages.apiErrors.upload,
			UNAUTHORIZED: "Войдите в систему снова.",
			FILE_REQUIRED: "Выберите файл.",
			UPLOAD_FAILED: "Не удалось загрузить файл.",
		},
		workspace: {
			...enMessages.apiErrors.workspace,
			notFound: "Рабочее пространство не найдено.",
			accessDenied: "У вас нет доступа к этому рабочему пространству.",
			memberNotFound: "Участник не найден.",
			invalidInviteCode: "Код приглашения недействителен.",
		},
		project: {
			...enMessages.apiErrors.project,
			notFound: "Проект не найден.",
			accessDenied: "У вас нет доступа к этому проекту.",
			memberNotFound: "Участник не найден.",
			invalidInviteCode: "Ссылка-приглашение в проект недействительна.",
		},
		whiteboard: {
			...enMessages.apiErrors.whiteboard,
			notFound: "Доска не найдена.",
			accessDenied: "У вас нет доступа к этой доске.",
			memberNotFound: "Участник доски не найден.",
		},
	},
	dialog: {
		...enMessages.dialog,
		close: "Закрыть",
	},
	header: {
		...enMessages.header,
		toggleTheme: "Сменить тему",
		switchToGerman: "Переключить на немецкий",
		switchToEnglish: "Переключить на английский",
	},
	publicSite: {
		...enMessages.publicSite,
		navigationLabel: "Основная навигация",
		productOverview: "Продукт",
		pricing: "Тарифы",
		openSource: "Открытый исходный код",
		existingCloudAccount: "Вход в облако",
		freeWhiteboard: "Бесплатная доска",
		openMenu: "Открыть меню",
		closeMenu: "Закрыть меню",
		footerDescription:
			"Бесплатная доска для быстрых идей с дополнительной зашифрованной облачной совместной работой.",
		product: "Продукт",
		legal: "Правовая информация",
		privacy: "Конфиденциальность",
		terms: "Условия",
		imprint: "Выходные данные",
		copyright: "© {year} Skedra. Все права защищены.",
	},
	pricingPage: {
		...enMessages.pricingPage,
		badge: "Начните просто. Платите только тогда, когда понадобится облако.",
		title: "Ваши идеи бесплатны.",
		titleAccent: "Облако — по желанию.",
		description:
			"Рисуйте бесплатно без аккаунта. Переходите в Skedra Cloud, когда захотите хранить доски постоянно, организовывать командную работу и безопасно сотрудничать.",
		monthly: "Ежемесячно",
		yearly: "Ежегодно",
		freeEyebrow: "Локально и без аккаунта",
		freePeriod: "навсегда",
		freeDescription: "Полный редактор для быстрых идей, эскизов и локальных файлов.",
		drawNow: "Начать рисовать",
		cloudEyebrow: "Для постоянной работы",
		cloudYearlyPeriod: "в год / за человека",
		cloudMonthlyPeriod: "в месяц / за человека",
		cloudDescription: "Зашифрованные облачные доски, совместная работа и управление командой.",
		subscribe: "Подключить Skedra Cloud",
		recommended: "Рекомендуем",
		existingSubscription: "Уже есть активная подписка?",
		existingSubscriptionAction: "Войти в существующий облачный аккаунт",
		feature: "Функция",
		faqTitle: "Часто задаваемые вопросы",
	},
} satisfies TranslationTree;
