import React from 'react';

interface LayoutProps {
	sidebar: React.ReactNode;
	mainContent: React.ReactNode;
}

export function Layout({ sidebar, mainContent }: LayoutProps) {
	return (
		<div className="flex min-h-screen bg-slate-50">
			<aside className="w-80 border-r border-slate-200 bg-white p-6">
				{sidebar}
			</aside>
			<main className="flex-1 p-6 sm:p-10">{mainContent}</main>
		</div>
	);
}
