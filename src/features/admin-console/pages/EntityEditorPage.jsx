import React from 'react';
import { useParams } from 'react-router-dom';
import AdminForm from '../components/AdminForm'; // Import the form

export default function EntityEditorPage() {
	const { type, id } = useParams();

	return (
		<div className='max-w-5xl mx-auto'>
			{/* Page Header */}
			<div className='mb-6'>
				<h1 className='text-2xl font-serif font-bold text-foreground capitalize'>
					{id ? `Edit ${type}` : `Create New ${type}`}
				</h1>
				<p className='text-sm text-muted-foreground'>
					{id ? `ID: ${id}` : 'Fill in the details below to create a new entry.'}
				</p>
			</div>

			{/* The Dynamic Form */}
			<AdminForm
				type={type}
				id={id}
				key={`${type}-${id || 'new'}`} // <--- This forces a complete rebuild when type changes
			/>
		</div>
	);
}
