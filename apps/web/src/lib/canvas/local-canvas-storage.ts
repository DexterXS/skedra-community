import { clearPersistedCanvasHistory } from "@/lib/canvas/canvas-history-storage";

/** localStorage-Key fuer den lokalen Gast-Canvas (Excalidraw-aehnlicher Modus). */
const LOCAL_CANVAS_STORAGE_KEY = "skedra-guest-canvas-v1";
const PENDING_TEMPLATE_STORAGE_KEY = "skedra-pending-template-v1";

export function loadLocalCanvasStateBase64() {
	try {
		return localStorage.getItem(LOCAL_CANVAS_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function saveLocalCanvasStateBase64(stateBase64: string) {
	try {
		localStorage.setItem(LOCAL_CANVAS_STORAGE_KEY, stateBase64);
	} catch {
		// Quota ueberschritten oder Storage blockiert — Zeichnen bleibt trotzdem moeglich.
	}
}

export function savePendingTemplateStateBase64(stateBase64: string) {
	try {
		sessionStorage.setItem(PENDING_TEMPLATE_STORAGE_KEY, stateBase64);
	} catch {
		// The public board remains available when session storage is blocked.
	}
}

export function takePendingTemplateStateBase64() {
	try {
		const state = sessionStorage.getItem(PENDING_TEMPLATE_STORAGE_KEY);
		sessionStorage.removeItem(PENDING_TEMPLATE_STORAGE_KEY);
		return state;
	} catch {
		return null;
	}
}

export function clearLocalCanvasState() {
	try {
		localStorage.removeItem(LOCAL_CANVAS_STORAGE_KEY);
		clearPersistedCanvasHistory("local");
	} catch {
		// ignore
	}
}
