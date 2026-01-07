import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import WebSocket from 'ws';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// --- CONFIGURATION ---
const DRY_RUN = true;
const ITEM_LIMIT = 3;
const TARGET_ID = null;

const COMFY_URL = 'http://127.0.0.1:8188';
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR_BASE = path.join(PROJECT_ROOT, 'public');
const WORKFLOW_FILE = path.join(PROJECT_ROOT, 'src/dev_helpers/workflow_api_with_lora.json');
const PROMPT_LOG_FILE = path.join(PROJECT_ROOT, 'prompt_log.jsonl');

// --- COMFYUI NODE MAPPING ---
const NODES = {
	POSITIVE_PROMPT: '6',
	NEGATIVE_PROMPT: '7',
	KSAMPLER: '3',
	SAVE_IMAGE: '9',
	EMPTY_LATENT: '5',
};

// --- OPTIMIZED FOR DREAMSHAPER LIGHTNING ---
const MASTER_STYLE = 'fantasy art, painted illustration, stylized, dramatic lighting';

const GLOBAL_NEGATIVE =
	'photorealistic, realistic, photograph, photo, human proportions, 3d render, blurry, low quality, ugly, deformed, watermark, text, signature';

// --- DATABASE CLIENT ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const workflowRaw = fs.readFileSync(WORKFLOW_FILE, 'utf8');
const workflowTemplate = JSON.parse(workflowRaw);
const generateSeed = () => Math.floor(Math.random() * 100000000000000);

function formatAttributes(attributes) {
	if (!attributes) return '';
	const ignoredKeys = [
		'background_image',
		'map_image',
		'token_image',
		'id',
		'parent_id',
		'campaign_id',
		'created_at',
		'updated_at',
		'notes',
		'gm_notes',
		'metadata',
		'json_data',
	];

	const validParts = [];
	for (const [key, value] of Object.entries(attributes)) {
		if (ignoredKeys.includes(key)) continue;
		if (value === null || value === '' || typeof value === 'object') continue;
		const readableKey = key.replace(/_/g, ' ');
		validParts.push(`${readableKey}: ${value}`);
	}
	return validParts.join(', ');
}

// Parse attributes into structured visual info
function parseVisualAttributes(attributes) {
	if (!attributes) return {};

	const visual = {
		race: null,
		gender: null,
		age: null,
		size: null,
		class: null,
		appearance: [],
	};

	// Common attribute keys to check
	const attrStr = JSON.stringify(attributes).toLowerCase();

	// Extract race
	if (attributes.race) visual.race = attributes.race;

	// Extract gender/sex
	if (attributes.gender) visual.gender = attributes.gender;
	if (attributes.sex) visual.gender = attributes.sex;

	// Extract age
	if (attributes.age) visual.age = attributes.age;

	// Extract size (important for creatures like quicklings)
	if (attributes.size) visual.size = attributes.size;
	if (attributes.height) visual.appearance.push(`${attributes.height} tall`);

	// Extract class
	if (attributes.class) visual.class = attributes.class;
	if (attributes.role) visual.class = attributes.role;

	// Extract visual appearance traits
	const appearanceKeys = ['hair', 'hair_color', 'eye_color', 'eyes', 'skin', 'skin_color', 'build'];
	for (const key of appearanceKeys) {
		if (attributes[key]) {
			visual.appearance.push(`${attributes[key]} ${key.replace('_color', '').replace('_', ' ')}`);
		}
	}

	return visual;
}

function logPrompt(entryId, entryName, prompt, success, mode) {
	const logEntry = {
		timestamp: new Date().toISOString(),
		entry_id: entryId,
		entry_name: entryName,
		prompt: prompt,
		success: success,
		mode: mode,
	};

	try {
		fs.appendFileSync(PROMPT_LOG_FILE, JSON.stringify(logEntry) + '\n');
	} catch (err) {
		console.warn('   └─ [WARN] Could not write to prompt log');
	}
}

// --- SIMPLIFIED CHARACTER PROMPT ---
async function getCharacterPrompt(entryName, description, attributes) {
	console.log('   └─ [STEP 1/2] Extracting key visual elements...');

	// Parse structured attributes
	const visualAttrs = parseVisualAttributes(attributes);
	const attrContext = `
STRUCTURED ATTRIBUTES:
- Race: ${visualAttrs.race || 'unknown'}
- Gender: ${visualAttrs.gender || 'unknown'}
- Size: ${visualAttrs.size || 'medium'}
- Age: ${visualAttrs.age || 'adult'}
- Class/Role: ${visualAttrs.class || 'unknown'}
- Appearance: ${visualAttrs.appearance.join(', ') || 'not specified'}
`;

	const systemPrompt = `You are a prompt optimizer for Stable Diffusion. Extract ONLY the most important visual keywords for a fantasy character.

CRITICAL RULES FOR NON-HUMAN RACES:
- Quickling: MUST include "tiny 2ft tall fey, pale grey skin, very long pointed ears, childlike proportions, motion blur"
- Tiefling: MUST include "red/purple skin, large curved horns, long tail with spade tip"
- Dragonborn: MUST include "dragon head, scales covering body, no hair, reptilian snout"
- Goblin: MUST include "small 3ft, green skin, large pointed ears"
- Half-Orc: MUST include "green-grey skin, tusks, muscular"
- Dwarf: MUST include "short 4-5ft, stocky, thick beard"
- Elf: MUST include "tall slender, pointed ears, graceful"

KEYWORD ORDER (8-12 keywords total):
1. Size descriptor if not medium (tiny, small, large)
2. Race with key features
3. Gender if specified
4. Skin/scale/fur color
5. Hair color/style (if applicable)
6. Eye color (if specified)
7. Most distinctive racial feature
8. Clothing/armor (2-3 words max)
9. Weapon or held item
10. ONE pose keyword

USE THE STRUCTURED ATTRIBUTES PROVIDED - especially race, gender, and size!

EXAMPLES:
Good: "tiny 2ft quickling, male, pale grey skin, white hair, very long pointed ears, motion blur, leather vest, daggers"
Good: "tiefling female, red skin, black hair, curved horns, long tail, leather armor, rogue stance"
Good: "dwarf male, 4ft stocky, brown beard, chainmail armor, battleaxe"
Bad: "A character wearing armor"

OUTPUT FORMAT - keywords only, comma separated:`;

	try {
		const response = await axios.post(
			OLLAMA_URL,
			{
				model: 'llama3.2',
				prompt: `${systemPrompt}\n${attrContext}\n\nCHARACTER NAME: ${entryName}\nDESCRIPTION: ${description.substring(
					0,
					300
				)}`,
				stream: false,
				options: { temperature: 0.2, num_predict: 80 },
			},
			{ timeout: 30000 }
		);

		let keywords = response.data.response
			.trim()
			.replace(/\n/g, ', ')
			.replace(/\s+/g, ' ')
			.replace(/[()[\]{}]/g, '') // Remove all brackets
			.substring(0, 350); // Tighter limit

		console.log('   └─ [STEP 2/2] Keywords extracted:', keywords);

		return keywords;
	} catch (error) {
		console.warn('   └─ [WARN] Using fallback prompt');
		// Enhanced fallback using parsed attributes
		const parts = [
			visualAttrs.size && visualAttrs.size !== 'medium' ? visualAttrs.size : null,
			visualAttrs.race || 'human',
			visualAttrs.gender,
			visualAttrs.appearance.join(', ') || null,
			visualAttrs.class,
			description.substring(0, 50),
		].filter(Boolean);

		return parts.join(', ');
	}
}

// --- SIMPLIFIED LOCATION PROMPT ---
async function getLocationPrompt(entryName, description, attributes) {
	console.log('   └─ [STEP 1/2] Extracting environment keywords...');

	const systemPrompt = `You are a prompt optimizer for Stable Diffusion. Extract ONLY the most important visual keywords for an environment/location.

RULES:
1. Output 10-15 comma-separated keywords maximum
2. Start with location type, then key features
3. Use simple descriptive words, NOT sentences
4. Include architecture style, natural features, atmosphere
5. Add lighting/weather keywords
6. NO weights, NO JSON, NO prose, NO people

EXAMPLES:
Good: "ancient ruins, overgrown temple, moss covered stones, jungle setting, misty, atmospheric lighting"
Bad: "An ancient temple with (moss-covered stones:1.3) set in a dense jungle"

OUTPUT FORMAT - keywords only, comma separated:`;

	try {
		const response = await axios.post(
			OLLAMA_URL,
			{
				model: 'llama3.2',
				prompt: `${systemPrompt}\n\nLOCATION: ${entryName}\nATTRIBUTES: ${attributes}\nDESCRIPTION: ${description.substring(
					0,
					300
				)}`,
				stream: false,
				options: { temperature: 0.3, num_predict: 100 },
			},
			{ timeout: 30000 }
		);

		let keywords = response.data.response
			.trim()
			.replace(/\n/g, ', ')
			.replace(/\s+/g, ' ')
			.replace(/[()[\]{}]/g, '')
			.substring(0, 400);

		console.log('   └─ [STEP 2/2] Keywords extracted:', keywords.substring(0, 100) + '...');

		return keywords;
	} catch (error) {
		console.warn('   └─ [WARN] Using fallback prompt');
		return `fantasy location, ${entryName}, ${description.substring(0, 100)}`;
	}
}

// --- SIMPLIFIED NEGATIVE PROMPT ---
function getSmartNegativePrompt(isCharacter) {
	if (isCharacter) {
		return `${GLOBAL_NEGATIVE}, tall, large, giant, human-sized, adult proportions, extra limbs, bad hands, missing fingers, modern clothing`;
	} else {
		return `${GLOBAL_NEGATIVE}, people, characters, portrait, close-up, faces`;
	}
}

async function validateImage(imageBuffer) {
	try {
		const metadata = await sharp(imageBuffer).metadata();
		if (metadata.width < 1024 || metadata.height < 576) {
			console.warn('   └─ ⚠️  Warning: Low resolution detected');
			return false;
		}
		if (imageBuffer.length < 50000) {
			console.warn('   └─ ⚠️  Warning: Suspiciously small file size');
			return false;
		}
		return true;
	} catch (error) {
		console.warn('   └─ ⚠️  Warning: Could not validate image:', error.message);
		return true;
	}
}

async function generateImage(visualKeywords, filenamePrefix, isCharacter, retryAttempt = 0) {
	const maxRetries = 2;
	const clientId = 'client-' + generateSeed();
	const seed = generateSeed();
	const workflow = JSON.parse(JSON.stringify(workflowTemplate));

	// Build final prompt with strategic weighting ONLY for critical features
	let finalPrompt = '';

	if (isCharacter) {
		// Extract race/size keywords and weight them heavily
		const sizeKeywords = ['tiny', 'small', '2ft', '3ft', '4ft', 'miniature', 'child-sized'];
		const hasSizeKeyword = sizeKeywords.some((k) => visualKeywords.toLowerCase().includes(k));

		if (hasSizeKeyword) {
			// For tiny creatures, heavily emphasize size
			const sizeMatch = visualKeywords.match(/(tiny.*?tall|small.*?tall|2ft.*?tall|miniature.*?proportions)/i)?.[0];
			if (sizeMatch) {
				finalPrompt = `(${sizeMatch}:1.6), (childlike proportions:1.4), ${visualKeywords}, ${MASTER_STYLE}`;
			} else {
				finalPrompt = `(tiny creature:1.5), (small scale:1.4), ${visualKeywords}, ${MASTER_STYLE}`;
			}
		} else {
			finalPrompt = `${visualKeywords}, ${MASTER_STYLE}`;
		}
	} else {
		finalPrompt = `${visualKeywords}, ${MASTER_STYLE}`;
	}

	// Keep under 400 chars
	finalPrompt = finalPrompt.substring(0, 400);

	workflow[NODES.POSITIVE_PROMPT].inputs.text = finalPrompt;
	workflow[NODES.NEGATIVE_PROMPT].inputs.text = getSmartNegativePrompt(isCharacter);
	workflow[NODES.KSAMPLER].inputs.seed = seed;
	workflow[NODES.SAVE_IMAGE].inputs.filename_prefix = filenamePrefix;

	// 16:9 ratio
	if (workflow[NODES.EMPTY_LATENT]) {
		workflow[NODES.EMPTY_LATENT].inputs.width = 1344;
		workflow[NODES.EMPTY_LATENT].inputs.height = 768;
	}

	console.log(`   └─ [FINAL PROMPT] ${finalPrompt}`);

	return new Promise((resolve, reject) => {
		const ws = new WebSocket(`ws://${COMFY_URL.split('//')[1]}/ws?clientId=${clientId}`);
		const timeout = setTimeout(() => {
			ws.close();
			if (retryAttempt < maxRetries) {
				console.log(`\n   └─ Timeout, retrying (${retryAttempt + 1}/${maxRetries})...`);
				resolve(generateImage(visualKeywords, filenamePrefix, isCharacter, retryAttempt + 1));
			} else {
				reject(new Error('Timeout after retries'));
			}
		}, 120000);

		ws.on('open', async () => {
			try {
				await axios.post(`${COMFY_URL}/prompt`, { prompt: workflow, client_id: clientId });
			} catch (err) {
				clearTimeout(timeout);
				if (retryAttempt < maxRetries) {
					resolve(generateImage(visualKeywords, filenamePrefix, isCharacter, retryAttempt + 1));
				} else {
					reject(err);
				}
			}
		});

		ws.on('message', async (data) => {
			const message = JSON.parse(data);
			if (message.type === 'executed' && message.data.node === NODES.SAVE_IMAGE) {
				clearTimeout(timeout);
				const imgData = message.data.output.images[0];
				const imageUrl = `${COMFY_URL}/view?filename=${imgData.filename}&subfolder=${imgData.subfolder}&type=${imgData.type}`;

				try {
					const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
					const imageBuffer = response.data;

					const isValid = await validateImage(imageBuffer);
					if (!isValid && retryAttempt < maxRetries) {
						console.log(`\n   └─ Invalid image, retrying (${retryAttempt + 1}/${maxRetries})...`);
						ws.close();
						resolve(generateImage(visualKeywords, filenamePrefix, isCharacter, retryAttempt + 1));
						return;
					}

					ws.close();
					resolve(imageBuffer);
				} catch (err) {
					clearTimeout(timeout);
					ws.close();
					if (retryAttempt < maxRetries) {
						resolve(generateImage(visualKeywords, filenamePrefix, isCharacter, retryAttempt + 1));
					} else {
						reject(err);
					}
				}
			}
		});

		ws.on('error', (err) => {
			clearTimeout(timeout);
			if (retryAttempt < maxRetries) {
				resolve(generateImage(visualKeywords, filenamePrefix, isCharacter, retryAttempt + 1));
			} else {
				reject(err);
			}
		});
	});
}

async function processTable(tableName, folderPath) {
	console.log(`\n${'='.repeat(80)}`);
	console.log(`🔵 STARTING TABLE: ${tableName.toUpperCase()}`);
	console.log(`${'='.repeat(80)}\n`);

	let query = supabase.from(tableName).select('*');
	if (TARGET_ID) {
		query = query.eq('id', TARGET_ID);
		console.log(`📌 Target ID Filter: ${TARGET_ID}\n`);
	} else {
		query = query.limit(ITEM_LIMIT);
		console.log(`📊 Processing up to ${ITEM_LIMIT} entries\n`);
	}

	const { data: entries, error } = await query;
	if (error) {
		console.error('❌ Database Error:', error);
		return;
	}

	console.log(`✅ Fetched ${entries.length} entries from database\n`);

	let processed = 0;
	let skipped = 0;
	let failed = 0;

	for (const entry of entries) {
		const attrs = entry.attributes || {};
		const title = entry.name || entry.title;
		const descText = entry.description || entry.narrative || entry.gm_notes;

		if (attrs.background_image) {
			console.log(`⏭️  SKIPPED: "${title}" (already has background_image)`);
			skipped++;
			continue;
		}

		if (!descText) {
			console.log(`⏭️  SKIPPED: "${title}" (no description available)`);
			skipped++;
			continue;
		}

		console.log(`\n${'─'.repeat(80)}`);
		console.log(`▶ PROCESSING: "${title}" (ID: ${entry.id})`);
		console.log(`${'─'.repeat(80)}`);

		const isCharacter = tableName === 'npcs';
		console.log(`   └─ [MODE] ${isCharacter ? 'Character Portrait' : 'Location/Environment'}`);

		const attrString = formatAttributes(attrs);
		const visualAttrs = parseVisualAttributes(attrs);
		let visualKeywords;

		try {
			if (isCharacter) {
				visualKeywords = await getCharacterPrompt(title, descText, attrs);
			} else {
				visualKeywords = await getLocationPrompt(title, descText, attrString);
			}
		} catch (error) {
			console.error(`   ❌ PROMPT GENERATION FAILED: ${error.message}`);
			failed++;
			continue;
		}

		console.log(`   └─ [GENERATION] Starting image generation...`);
		try {
			const cleanName = entry.id;
			const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
			const imageBuffer = await generateImage(visualKeywords, `temp_${cleanName}`, isCharacter);
			console.log(`   └─ [GENERATION] ✓ Complete`);

			const campaignFolder = entry.campaign_id || 'shared';
			const relativePath = `images/assets/${folderPath}/${campaignFolder}/${cleanTitle}_${cleanName}.webp`;
			const fullOutputPath = path.join(OUTPUT_DIR_BASE, relativePath);

			if (!fs.existsSync(path.dirname(fullOutputPath))) {
				fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });
			}

			await sharp(imageBuffer)
				.resize({ width: 1600, kernel: sharp.kernel.lanczos3, withoutEnlargement: true })
				.webp({ quality: 85, smartSubsample: true, effort: 6 })
				.toFile(fullOutputPath);

			console.log(`   └─ [SAVE] ✓ ${relativePath}`);

			if (!DRY_RUN) {
				const newAttributes = { ...attrs, background_image: relativePath };
				await supabase.from(tableName).update({ attributes: newAttributes }).eq('id', entry.id);
				console.log(`   └─ [DATABASE] ✓ Updated`);
			} else {
				console.log(`   └─ [DATABASE] ⚠️  DRY RUN - Update skipped`);
			}

			logPrompt(entry.id, title, visualKeywords, true, isCharacter ? 'character' : 'location');
			console.log(`   ✅ SUCCESS`);
			processed++;
		} catch (err) {
			console.error(`   ❌ GENERATION FAILED: ${err.message}`);
			logPrompt(entry.id, title, visualKeywords || 'N/A', false, isCharacter ? 'character' : 'location');
			failed++;
		}
	}

	console.log(`\n${'='.repeat(80)}`);
	console.log(`📊 TABLE "${tableName.toUpperCase()}" SUMMARY:`);
	console.log(`   ✅ Processed: ${processed}`);
	console.log(`   ⏭️  Skipped: ${skipped}`);
	console.log(`   ❌ Failed: ${failed}`);
	console.log(`   📝 Total: ${entries.length}`);
	console.log(`${'='.repeat(80)}\n`);
}

async function main() {
	console.log(`\n${'='.repeat(80)}`);
	console.log(`🎨 D&D ASSET GENERATOR - OPTIMIZED FOR DREAMSHAPER LIGHTNING`);
	console.log(`   - Short, focused prompts (300-500 chars)`);
	console.log(`   - No complex weighting`);
	console.log(`   - Keyword-based approach`);
	console.log(`${'='.repeat(80)}\n`);

	console.log(`⚙️  CONFIGURATION:`);
	console.log(`   - DRY RUN: ${DRY_RUN ? '⚠️  YES (DB updates disabled)' : '✅ NO (Will update DB)'}`);
	console.log(`   - ITEM LIMIT: ${TARGET_ID ? `Single target (${TARGET_ID})` : `${ITEM_LIMIT} per table`}`);
	console.log(`   - COMFY URL: ${COMFY_URL}`);
	console.log(`   - OLLAMA URL: ${OLLAMA_URL}`);
	console.log(``);

	// await processTable('locations', 'locations');
	await processTable('npcs', 'npcs');

	console.log(`\n${'='.repeat(80)}`);
	console.log(`✨ SCRIPT FINISHED`);
	console.log(`${'='.repeat(80)}\n`);
}

main().catch((err) => {
	console.error('\n💥 FATAL ERROR:', err);
	process.exit(1);
});
