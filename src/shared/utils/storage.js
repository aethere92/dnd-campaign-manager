/**
 * Safe localStorage access.
 *
 * Every read/write is guarded: Safari private mode and some embedded browsers
 * throw on localStorage access rather than returning null, which previously
 * meant an unguarded read (useTheme) could break app startup entirely.
 *
 * Falls back to sessionStorage when localStorage is unavailable, so preferences
 * survive at least the current tab.
 */

/** Canonical storage keys — collected here so they can't drift. */
export const STORAGE_KEYS = {
	CAMPAIGN_ID: 'campaignId',
	THEME: 'app-theme',
	RECENT_SEARCHES: 'recent-searches',
};

export const storage = {
	/**
	 * @param {string} key
	 * @param {string|null} [fallback=null]
	 * @returns {string|null}
	 */
	get(key, fallback = null) {
		try {
			const val = localStorage.getItem(key);
			if (val !== null) return val;
		} catch {
			// localStorage blocked — try sessionStorage below.
		}
		try {
			const val = sessionStorage.getItem(key);
			if (val !== null) return val;
		} catch {
			// Both unavailable.
		}
		return fallback;
	},

	/** @returns {boolean} whether the value was persisted anywhere */
	set(key, value) {
		try {
			localStorage.setItem(key, value);
			return true;
		} catch {
			try {
				sessionStorage.setItem(key, value);
				return true;
			} catch {
				return false;
			}
		}
	},

	remove(key) {
		try {
			localStorage.removeItem(key);
		} catch {
			// ignore
		}
		try {
			sessionStorage.removeItem(key);
		} catch {
			// ignore
		}
	},

	/**
	 * JSON-parsing read. Returns `fallback` if absent or malformed.
	 */
	getJSON(key, fallback = null) {
		const raw = this.get(key);
		if (raw === null) return fallback;
		try {
			return JSON.parse(raw);
		} catch {
			return fallback;
		}
	},

	/** @returns {boolean} whether the value was persisted */
	setJSON(key, value) {
		try {
			return this.set(key, JSON.stringify(value));
		} catch {
			return false;
		}
	},
};
