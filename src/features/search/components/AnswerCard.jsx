import { Sparkles, Calendar, ArrowRight, UserRound } from 'lucide-react';

/**
 * Renders a structured answer to a recognised question (see answerService), rather
 * than a list of search hits. The "Sparkles + composed sentence" framing is what
 * makes it read as if the search understood the question — but every value here
 * came from a plain relational query, not a model.
 */

const AnswerShell = ({ children, onOpenSession, sessionLabel }) => (
	<div className='m-3 rounded-xl border border-primary/30 bg-primary/5 overflow-hidden'>
		<div className='flex items-center gap-2 px-4 py-2 border-b border-primary/20 bg-primary/10'>
			<Sparkles size={13} className='text-primary' />
			<span className='text-[10px] font-bold uppercase tracking-widest text-primary'>Answer</span>
			{sessionLabel && (
				<button
					onClick={onOpenSession}
					className='ml-auto flex items-center gap-1 text-[11px] font-medium text-primary/80 hover:text-primary transition-colors'>
					{sessionLabel} <ArrowRight size={12} />
				</button>
			)}
		</div>
		<div className='p-4'>{children}</div>
	</div>
);

const EventRow = ({ event, onOpen }) => (
	<button onClick={onOpen} className='w-full text-left flex items-start gap-2 py-1.5 group' title='Open session'>
		<span className='mt-1 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 group-hover:bg-primary transition-colors' />
		<div className='min-w-0'>
			<div className='text-sm font-medium text-foreground'>{event.title}</div>
			{event.description && (
				<p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>{event.description}</p>
			)}
		</div>
	</button>
);

// Session title often carries a numeric prefix ("07 - Assault…"); keep it as-is,
// it's how the DM labels them.
const sessionLabelFor = (session) => session?.title || 'Session';

export const AnswerCard = ({ answer, onOpenSession, onOpenEntity }) => {
	if (!answer) return null;

	// --- Couldn't answer: session or entity not found ---
	if (answer.notFound) {
		return (
			<AnswerShell>
				<p className='text-sm text-muted-foreground'>
					Couldn't find <span className='font-semibold text-foreground'>{answer.notFound}</span>. Check the name or
					session number, or try a keyword search.
				</p>
			</AnswerShell>
		);
	}

	const openSession = () => onOpenSession?.(answer.session);

	// --- "What did {entity} do in session N" ---
	if (answer.pattern === 'char-in-session') {
		const { entity, events, session } = answer;
		return (
			<AnswerShell sessionLabel={sessionLabelFor(session)} onOpenSession={openSession}>
				<div className='flex items-center gap-2 mb-2'>
					<UserRound size={14} className='text-muted-foreground' />
					<span className='text-sm'>
						<button
							onClick={() => onOpenEntity?.(entity)}
							className='font-bold text-foreground hover:text-primary transition-colors'>
							{entity.name}
						</button>{' '}
						{events.length > 0 ? (
							<span className='text-muted-foreground'>
								appears in {events.length} event{events.length === 1 ? '' : 's'} of {sessionLabelFor(session)}:
							</span>
						) : (
							<span className='text-muted-foreground'>isn't tagged in any events of {sessionLabelFor(session)}.</span>
						)}
					</span>
				</div>
				<div className='divide-y divide-border/40'>
					{events.map((e) => (
						<EventRow key={e.id} event={e} onOpen={openSession} />
					))}
				</div>
			</AnswerShell>
		);
	}

	// --- "What happened / who was in session N" ---
	if (answer.pattern === 'session-summary') {
		const { session, events, participants } = answer;
		return (
			<AnswerShell sessionLabel={sessionLabelFor(session)} onOpenSession={openSession}>
				<div className='flex items-center gap-2 mb-2 text-sm'>
					<Calendar size={14} className='text-muted-foreground' />
					<span className='text-muted-foreground'>
						{sessionLabelFor(session)} has {events.length} event{events.length === 1 ? '' : 's'}
						{participants.length > 0 &&
							`, involving ${participants.length} character${participants.length === 1 ? '' : 's'}`}
						.
					</span>
				</div>

				{participants.length > 0 && (
					<div className='flex flex-wrap gap-1.5 mb-3'>
						{participants.map((p) => (
							<button
								key={p.id}
								onClick={() => onOpenEntity?.(p)}
								className='text-[11px] font-medium px-2 py-0.5 rounded-full bg-card border border-border hover:border-primary hover:text-primary transition-colors'>
								{p.name}
							</button>
						))}
					</div>
				)}

				<div className='divide-y divide-border/40'>
					{events.map((e) => (
						<EventRow key={e.id} event={e} onOpen={openSession} />
					))}
				</div>
			</AnswerShell>
		);
	}

	return null;
};
