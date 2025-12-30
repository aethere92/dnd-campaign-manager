import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import EntityIcon from '@/domain/entity/components/EntityIcon';
import { useEntityIndex } from '@/features/smart-text/useEntityIndex';
import { resolveImageUrl, parseAttributes } from '@/shared/utils/imageUtils';

// Utility to calculate brightness from an image
const getImageBrightness = (imageUrl) => {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = 'Anonymous';

		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				canvas.width = 100;
				canvas.height = 100;

				ctx.drawImage(img, 0, 0, 100, 100);
				const imageData = ctx.getImageData(0, 0, 100, 100);
				const data = imageData.data;

				let totalBrightness = 0;
				let pixelCount = 0;

				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];
					const a = data[i + 3];

					if (a < 125) continue;

					const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
					totalBrightness += brightness;
					pixelCount++;
				}

				const avgBrightness = totalBrightness / pixelCount;
				resolve(avgBrightness);
			} catch (e) {
				resolve(200);
			}
		};

		img.onerror = () => {
			resolve(200);
		};

		img.src = imageUrl;
	});
};

export const EntityEmbed = ({ id, type, label }) => {
	const navigate = useNavigate();
	// FIX: Destructure the 'map' from the new hook signature
	const { map: entityMap } = useEntityIndex();

	// FIX: Use .get() (O(1) speed) instead of .find()
	const entity = entityMap.get(id);
	const resolvedLabel = label || entity?.name || 'Unknown Entity';

	// Resolve Images
	const attributes = parseAttributes(entity?.attributes);
	const customIcon = entity?.iconUrl || resolveImageUrl(attributes, 'icon');
	const bgImage = resolveImageUrl(attributes, 'background');

	// State for brightness detection
	const [isDarkBackground, setIsDarkBackground] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(!!bgImage);

	// Analyze background image brightness
	useEffect(() => {
		if (!bgImage) {
			setIsAnalyzing(false);
			return;
		}

		setIsAnalyzing(true);

		getImageBrightness(bgImage).then((brightness) => {
			setIsDarkBackground(brightness < 127.5);
			setIsAnalyzing(false);
		});
	}, [bgImage]);

	// Border Color Logic (Left Side Only)
	const getBorderColor = () => {
		switch (type) {
			case 'encounter':
				return 'border-l-red-600';
			case 'quest':
				return 'border-l-blue-600';
			case 'location':
				return 'border-l-emerald-600';
			default:
				return 'border-l-amber-600';
		}
	};

	const getActionLabel = () => {
		switch (type) {
			case 'encounter':
				return 'View Encounter';
			case 'quest':
				return 'View Quest';
			case 'location':
				return 'View Map';
			default:
				return 'View Entity';
		}
	};

	return (
		<span
			role='button'
			onClick={(e) => {
				e.preventDefault();
				navigate(`/wiki/${type}/${id}`);
			}}
			className={clsx(
				// Layout & Base (Changed to flex to behave like block context within span)
				'group relative w-full h-[30px] my-4 cursor-pointer select-none overflow-hidden',
				'flex rounded-md transition-all duration-200',

				// Borders
				'border border-border/60 border-l-[3px]',
				getBorderColor(),

				// Background (Default White if no image)
				!bgImage && 'bg-background hover:bg-muted/30',

				// Hover Effects
				'hover:shadow hover:border-l-4'
			)}>
			{/* BACKGROUND IMAGE LAYER */}
			{bgImage && (
				<span
					className='absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-500 block'
					style={{ backgroundImage: `url('${bgImage}')` }}
				/>
			)}

			{/* CONTENT LAYER */}
			<span className='relative z-10 flex items-center gap-2 pl-2 pr-3 h-full w-full'>
				{/* Icon - Adaptive color, no background */}
				<span
					className={clsx(
						'shrink-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-all duration-200',
						isAnalyzing ? 'opacity-0' : 'opacity-100'
					)}
					style={{
						filter: bgImage
							? isDarkBackground
								? 'brightness(0) invert(1)' // White for dark backgrounds
								: 'brightness(0)' // Black for light backgrounds
							: 'none',
					}}>
					<EntityIcon
						type={type}
						customIconUrl={customIcon}
						size={16}
						inline={true}
						className='object-cover rounded-full'
					/>
				</span>

				{/* Label */}
				<span
					className={clsx(
						'font-serif font-bold text-[12px] truncate leading-none flex-1 pt-0.5 block',
						'transition-colors duration-200',
						isAnalyzing ? 'opacity-0' : 'opacity-100',
						bgImage ? (isDarkBackground ? 'text-white' : 'text-black') : 'text-foreground'
					)}>
					{resolvedLabel}
				</span>

				{/* Right Side Action */}
				<span
					className={clsx(
						'text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors',
						isAnalyzing ? 'opacity-0' : 'opacity-100',
						bgImage
							? isDarkBackground
								? 'text-white/90 group-hover:text-white'
								: 'text-black/90 group-hover:text-black'
							: 'text-muted-foreground/60 group-hover:text-amber-700'
					)}>
					{getActionLabel()} <ArrowRight size={10} />
				</span>
			</span>
		</span>
	);
};
