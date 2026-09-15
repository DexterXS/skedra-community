import type { UiLocale } from "@/lib/i18n";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocaleStore {
	locale: UiLocale;
	setLocale: (locale: UiLocale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
	persist(
		(set) => ({
			locale: "de",
			setLocale: (locale) => {
				set({ locale });
				document.documentElement.lang = locale;
			},
		}),
		{ name: "skedra-locale" },
	),
);

export function getCurrentLocale() {
	const locale = useLocaleStore.getState().locale;
	return locale === "ru" ? "en" : locale;
}

export function initLocale() {
	document.documentElement.lang = useLocaleStore.getState().locale;
}
