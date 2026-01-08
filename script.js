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

// // Page transition: tetris-like falling blocks when navigating from index -> about
// (function () {
// 	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 	function buildPieces(blockSize) {
// 		const cols = Math.ceil(window.innerWidth / blockSize);
// 		const rows = Math.ceil(window.innerHeight / blockSize);
// 		const overlay = document.createElement('div');
// 		overlay.className = 'transition-overlay';
// 		overlay.style.gridTemplateColumns = `repeat(${cols}, ${blockSize}px)`;
// 		overlay.style.gridAutoRows = `${blockSize}px`;

// 		const rowDelay = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-row-delay') || 0.06);

// 		// Tetromino templates (some rotations included). Each template is a list of [r,c] cells
// 		const shapes = [
// 			{ name: 'i', coords: [[0,0],[1,0],[2,0],[3,0]] },
// 			{ name: 'i', coords: [[0,0],[0,1],[0,2],[0,3]] },
// 			{ name: 'o', coords: [[0,0],[0,1],[1,0],[1,1]] },
// 			{ name: 't', coords: [[0,1],[1,0],[1,1],[1,2]] },
// 			{ name: 't', coords: [[0,1],[1,1],[1,2],[2,1]] },
// 			{ name: 's', coords: [[0,1],[0,2],[1,0],[1,1]] },
// 			{ name: 'z', coords: [[0,0],[0,1],[1,1],[1,2]] },
// 			{ name: 'j', coords: [[0,0],[1,0],[2,0],[2,1]] },
// 			{ name: 'l', coords: [[0,1],[1,1],[2,1],[2,0]] }
// 		];

// 		// occupancy grid
// 		const occ = Array.from({length: rows}, () => Array(cols).fill(false));

// 		for (let r = 0; r < rows; r++) {
// 			for (let c = 0; c < cols; c++) {
// 				if (occ[r][c]) continue;
// 				// try random shapes at this origin
// 				let placed = false;
// 				const choices = shapes.slice().sort(() => Math.random() - 0.5);
// 				for (const s of choices) {
// 					// determine bounds
// 					let fits = true;
// 					let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
// 					for (const [sr, sc] of s.coords) {
// 						const rr = r + sr, cc = c + sc;
// 						if (rr < 0 || rr >= rows || cc < 0 || cc >= cols || occ[rr][cc]) { fits = false; break; }
// 						if (rr < minR) minR = rr; if (cc < minC) minC = cc; if (rr > maxR) maxR = rr; if (cc > maxC) maxC = cc;
// 					}
// 					if (!fits) continue;
// 					// mark occupied
// 					for (const [sr, sc] of s.coords) occ[r + sr][c + sc] = true;
// 					// compute span
// 					const w = maxC - minC + 1;
// 					const h = maxR - minR + 1;
// 					const piece = document.createElement('div');
// 					piece.className = `piece piece-${s.name}`;
// 					piece.style.gridColumn = `${c + 1} / span ${w}`;
// 					piece.style.gridRow = `${r + 1} / span ${h}`;
// 					piece.style.transitionDelay = `${r * rowDelay}s`;
// 					overlay.appendChild(piece);
// 					placed = true;
// 					break;
// 				}

// 				if (!placed) {
// 					// fallback single cell
// 					occ[r][c] = true;
// 					const cell = document.createElement('div');
// 					cell.className = 'piece piece-single';
// 					cell.style.gridColumn = `${c + 1} / span 1`;
// 					cell.style.gridRow = `${r + 1} / span 1`;
// 					cell.style.transitionDelay = `${r * rowDelay}s`;
// 					overlay.appendChild(cell);
// 				}
// 			}
// 		}

// 		return { overlay, cols, rows };
// 	}

// 	function playTetrisTransition(href) {
// 		if (prefersReduced) {
// 			localStorage.setItem('activePage', 'about');
// 			window.location.href = href;
// 			return;
// 		}

// 		const blockSize = window.innerWidth > 768 ? 48 : 32;
// 		const { overlay, cols, rows } = buildPieces(blockSize);

// 		document.body.appendChild(overlay);
// 		// Force a reflow to ensure transitions will trigger
// 		overlay.getBoundingClientRect();

// 		// STEP 1: Cover the page by sliding pieces down into place
// 		setTimeout(() => overlay.querySelectorAll('.piece').forEach(p => p.classList.add('cover')), 30);

// 		const rowDelay = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-row-delay') || 0.06);
// 		const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-duration') || 900) / 1000;
// 		const coverTotal = (rows * rowDelay) + duration + 0.15;

// 		// After fully covered, store a flag so the destination page can reveal, then navigate
// 		setTimeout(() => {
// 			sessionStorage.setItem('tetris', 'covered');
// 			// keep background black during navigation so the screen stays covered
// 			document.documentElement.style.backgroundColor = '#000';
// 			localStorage.setItem('activePage', 'about');
// 			window.location.href = href;
// 		}, coverTotal * 1000);
// 	}

// 	function revealOnArrival() {
// 		try {
// 			if (sessionStorage.getItem('tetris') !== 'covered') return;
// 			// if user prefers reduced motion, remove placeholder and skip animation
// 			if (prefersReduced) { sessionStorage.removeItem('tetris'); const fast = document.getElementById('tetris-fast-overlay'); if (fast) fast.remove(); return; }
// 			// consume the flag
// 			sessionStorage.removeItem('tetris');

// 			const blockSize = window.innerWidth > 768 ? 48 : 32;
// 		const { overlay, cols, rows } = buildPieces(blockSize);
// 			// make sure any quick placeholder overlay (inserted by head script) is removed
// 			const fast = document.getElementById('tetris-fast-overlay');
// 			if (fast) fast.remove();

// 			document.body.appendChild(overlay);
// 			// set to covered state immediately (so the overlay starts by hiding the page)
// 		overlay.querySelectorAll('.piece').forEach(p => p.classList.add('cover'));
// 			// Force reflow
// 			overlay.getBoundingClientRect();

// 			// then trigger falling (reveal) top -> bottom
// 			const rowDelay = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-row-delay') || 0.06);
// 			const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--transition-duration') || 900) / 1000;
// 			setTimeout(() => {
// 				overlay.querySelectorAll('.piece').forEach((p) => {
// 					const rowStart = parseInt((p.style.gridRow || '').split('/')[0], 10) - 1 || 0;
// 					p.style.transitionDelay = `${rowStart * rowDelay}s`;
// 					p.classList.add('fall');
// 				});

// 				const total = (rows * rowDelay) + duration + 0.25;
// 				setTimeout(() => {
// 					overlay.remove();
// 					document.documentElement.style.backgroundColor = '';
// 				}, total * 1000);
// 			}, 60);
// 		} catch (e) {
// 			// silent fail — we should not block page load
// 		}
// 	}

// 	document.addEventListener('DOMContentLoaded', function () {
// 		// run reveal if we arrived during a transition
// 		revealOnArrival();

// 		const enter = document.getElementById('enterSite');
// 		if (!enter) return;
// 		enter.addEventListener('click', function (e) {
// 			e.preventDefault();
// 			const href = enter.getAttribute('href') || 'about.html';
// 			playTetrisTransition(href);
// 		});
// 	});
// })();

