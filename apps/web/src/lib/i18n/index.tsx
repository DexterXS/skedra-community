import { useLocaleStore } from "@/stores/locale";
import { createContext, useContext, useEffect, useState } from "react";
import type { TranslationParams, TranslationTree } from "./messages";

/** Legacy locale used by existing public/SEO code. */
export type Locale = "de" | "en";
/** User-selectable UI locale. Russian falls back to English for legacy content. */
export type UiLocale = Locale | "ru";

type Messages = Partial<Record<UiLocale, TranslationTree>>;
const loadedMessages: Messages = {};
const loadingMessages = new Map<UiLocale, Promise<TranslationTree>>();

const localeLoaders: Record<UiLocale, () => Promise<TranslationTree>> = {
	de: () => import("./messages.de").then((module) => module.deMessages),
	en: () => import("./messages.en").then((module) => module.enMessages),
	ru: () => import("./messages.ru").then((module) => module.ruMessages),
};

async function loadLocaleMessages(locale: UiLocale) {
	if (loadedMessages[locale]) return loadedMessages[locale];
	const existing = loadingMessages.get(locale);
	if (existing) return existing;

	const next = localeLoaders[locale]().then((messages) => {
		loadedMessages[locale] = messages;
		loadingMessages.delete(locale);
		return messages;
	});
	loadingMessages.set(locale, next);
	return next;
}

export async function loadI18nMessages(
	locale: UiLocale = useLocaleStore.getState().locale,
) {
	if (locale === "en") {
		await loadLocaleMessages("en");
	} else {
		await Promise.all([loadLocaleMessages("en"), loadLocaleMessages(locale)]);
	}
	return loadedMessages;
}

interface I18nContextValue {
	/** Normalized locale for legacy code that only supports German/English. */
	locale: Locale;
	/** Actual locale selected by the user. */
	selectedLocale: UiLocale;
	setLocale: (locale: UiLocale) => void;
	t: (key: string, params?: TranslationParams) => string;
}

const globalScope = globalThis as typeof globalThis & {
	__skedraI18nContext?: ReturnType<
		typeof createContext<I18nContextValue | null>
	>;
};

const I18nContext =
	globalScope.__skedraI18nContext ??
	createContext<I18nContextValue | null>(null);

if (!globalScope.__skedraI18nContext) {
	globalScope.__skedraI18nContext = I18nContext;
}

I18nContext.displayName = "SkedraI18nContext";

function setDocumentLocale(locale: UiLocale) {
	document.documentElement.lang = locale;
}

function interpolate(template: string, params: TranslationParams = {}) {
	return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}

function resolveValue(
	tree: Record<string, unknown> | null | undefined,
	key: string,
): unknown {
	if (!tree) return undefined;
	return key.split(".").reduce<unknown>((current, part) => {
		if (
			!current ||
			typeof current === "string" ||
			typeof current === "function"
		)
			return undefined;
		return (current as Record<string, unknown>)[part];
	}, tree);
}

export function translate(
	locale: UiLocale,
	key: string,
	params?: TranslationParams,
) {
	const messages = loadedMessages;
	const localized = resolveValue(messages[locale], key);
	const fallback = resolveValue(messages.en, key);
	const value = localized ?? fallback;

	if (typeof value === "function") return value(params ?? {});
	if (typeof value === "string") return interpolate(value, params);
	return key;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const selectedLocale = useLocaleStore((state) => state.locale);
	const setLocale = useLocaleStore((state) => state.setLocale);
	const [messagesVersion, setMessagesVersion] = useState(0);
	const locale: Locale = selectedLocale === "ru" ? "en" : selectedLocale;

	useEffect(() => {
		let cancelled = false;
		setDocumentLocale(selectedLocale);
		void loadI18nMessages(selectedLocale).then(() => {
			if (!cancelled) setMessagesVersion((version) => version + 1);
		});
		return () => {
			cancelled = true;
		};
	}, [selectedLocale]);

	const contextValue: I18nContextValue = {
		locale,
		selectedLocale,
		setLocale,
		t: (key, params) => {
			void messagesVersion;
			return translate(selectedLocale, key, params);
		},
	};

	return (
		<I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}
