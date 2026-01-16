// Handle nav-pills active state and persist selection
document.addEventListener('DOMContentLoaded', function () {
	const links = document.querySelectorAll('#mainNavList .nav-link');
	let stored = localStorage.getItem('activePage');
	// If not stored, infer from current path (useful when landing directly on about.html)
	if (!stored) {
		const path = window.location.pathname || '';
		if (path.endsWith('about.html')) stored = 'about';
		else if (path.endsWith('projects.html')) stored = 'projects';
		else if (path.endsWith('skills.html')) stored = 'skills';
		else if (path.endsWith('contact.html')) stored = 'contact';
	}
	let found = false;
	links.forEach(link => {
		const page = link.dataset.page;
		if (stored && page === stored) {
			link.classList.add('active');
			found = true;
		}
		// If the link points to a real page (href not '#'), ensure clicking sets state and proceeds
		link.addEventListener('click', (e) => {
			const href = link.getAttribute('href');
			if (href && href !== '#') {
				// set state then allow navigation
				localStorage.setItem('activePage', page);
				return;
			}
			e.preventDefault();
			links.forEach(l => l.classList.remove('active'));
			link.classList.add('active');
			localStorage.setItem('activePage', page);
		});
	});
	if (!found && links[0]) links[0].classList.add('active');
});

// Loader hide on full load
window.addEventListener('load', function () {
	const loader = document.getElementById('page-loader');
	if (!loader) return;
	// small delay so the animation is visible even on fast loads
	setTimeout(() => {
		loader.classList.add('loaded');
		setTimeout(() => loader.remove(), 1000);
	}, 1200);
});