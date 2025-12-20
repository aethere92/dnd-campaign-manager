export const generateId = (text) => {
	if (!text) return '';
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove non-word chars
		.replace(/--+/g, '-'); // Replace multiple - with single -
};

// Extracts headers from raw markdown string for the ToC list
export const extractHeaders = (markdown) => {
	if (!markdown) return [];
	const regex = /^(#{1,3})\s+(.+)$/gm;
	const headers = [];
	let match;

	while ((match = regex.exec(markdown)) !== null) {
		headers.push({
			depth: match[1].length, // 1, 2, or 3
			text: match[2].trim(),
			id: generateId(match[2]),
		});
	}
	return headers;
};
