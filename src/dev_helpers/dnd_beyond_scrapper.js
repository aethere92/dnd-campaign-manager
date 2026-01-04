// D&D Beyond Character Sheet Data Extractor
// Paste this script into the browser console on a D&D Beyond character sheet page

(function extractCharacterData() {
	const data = {
		speed: '',
		skills: [],
		languages: '',
		'hit points': '',
		initiative: '',
		'armor class': '',
		proficiency: '',
		'saving throw': [],
		'ability score': [],
		'additional senses': [],
	};

	// Extract Ability Scores
	const abilityContainers = document.querySelectorAll('.ct-quick-info__ability .ddbc-ability-summary');
	abilityContainers.forEach((container) => {
		const abbr = container.querySelector('.ddbc-ability-summary__abbr')?.textContent.trim().toUpperCase();
		const modifier = container.querySelector('.ddbc-ability-summary__primary')?.textContent.trim();
		const score = container.querySelector('.ddbc-ability-summary__secondary')?.textContent.trim();

		if (abbr && modifier && score) {
			data['ability score'].push(`${abbr} ${score} (${modifier})`);
		}
	});

	// Extract Saving Throws
	const savingThrowContainers = document.querySelectorAll('.ddbc-saving-throws-summary__ability');
	savingThrowContainers.forEach((container) => {
		const abbr = container.querySelector('.ddbc-saving-throws-summary__ability-name')?.textContent;
		const modifierEl = container.querySelector('.ddbc-saving-throws-summary__ability-modifier');

		if (abbr && modifierEl) {
			const modifier = modifierEl.textContent.trim();
			const abbrShort = abbr.substring(0, 3).toUpperCase();
			data['saving throw'].push(`${abbrShort} ${modifier}`);
		}
	});

	// Extract Health Points
	const maxHP = document.querySelector('[data-testid="max-hp"]')?.textContent.trim();
	data['hit points'] = maxHP || '0';

	// Extract Armor Class
	const ac = document.querySelector('[data-testid="armor-class-value"]')?.textContent.trim();
	data['armor class'] = ac || '0';

	// Extract Walking Speed
	const speedEl = document.querySelector('.ct-speed-box__box-value');
	if (speedEl) {
		const speedNum = speedEl.querySelector('span:first-child')?.textContent.trim();
		const speedUnit = speedEl.querySelector('.styles_label__L8mZK')?.textContent.trim();
		data.speed = `${speedNum}${speedUnit}` || '30ft.';
	}

	// Extract Initiative
	const initiativeEl = document.querySelector('.ct-combat__summary-group--initiative');
	data.initiative = initiativeEl?.textContent.trim().replace('InitiativeInitiative', '') || '+0';

	// Extract Proficiency Bonus
	const profBonusEl = document.querySelector('.ct-proficiency-bonus-box__value');
	data.proficiency = profBonusEl?.textContent.trim() || '+0';

	// Extract Senses
	const senseCallouts = document.querySelectorAll('.ct-senses__callout');
	senseCallouts.forEach((callout) => {
		const value = callout.querySelector('.ct-senses__callout-value')?.textContent.trim();
		const label = callout.querySelector('.ct-senses__callout-label')?.textContent.trim();
		if (value && label) {
			data['additional senses'].push(`${label} ${value}`);
		}
	});

	// Extract Languages
	const profGroups = document.querySelectorAll('.ct-proficiency-groups__group');
	profGroups.forEach((group) => {
		const label = group.querySelector('.ct-proficiency-groups__group-label')?.textContent.trim();
		if (label && label.toLowerCase() === 'languages') {
			const items = Array.from(group.querySelectorAll('.ct-proficiency-groups__group-item'))
				.map((item) => item.textContent.replace(/,\s*$/, '').trim())
				.filter(Boolean);
			data.languages = items.join(', ');
		}
	});

	// Extract Skills
	const skillRows = document.querySelectorAll('.ct-skills__item');
	skillRows.forEach((row) => {
		const skillName = row.querySelector('.ct-skills__col--skill')?.textContent.trim();
		const bonusEl = row.querySelector('.ct-skills__col--modifier');

		if (skillName && bonusEl) {
			const bonus = bonusEl.textContent.trim();
			data.skills.push(`${skillName} (${bonus})`);
		}
	});

	// Output the data
	console.log('Character Data Extracted:');
	console.log(JSON.stringify(data, null, 2));

	// Copy to clipboard if available
	if (navigator.clipboard) {
		navigator.clipboard
			.writeText(JSON.stringify(data, null, 2))
			.then(() => console.log('✓ Data copied to clipboard!'))
			.catch(() => console.log('Manual copy required - see output above'));
	}

	return data;
})();
