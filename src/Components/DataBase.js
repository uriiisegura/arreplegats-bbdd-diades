function Llista(props) {
	const { diades } = props;

	const getTemporada = (data) => {
		const year = data.getFullYear();
		if (isFromTemporada(data, year+'-'+(year+1)))
			return year+'-'+(year+1);
		return (year-1)+'-'+year;
	};

	const isFromTemporada = (date, temporada) => {
		const start_temporada = new Date(`09/01/${temporada.split('-')[0]}`);
		const end_temporada = new Date(`08/31/${temporada.split('-')[1]}`);
		return start_temporada <= date && date <= end_temporada;
	};

	const fromEuropean = (dateString) => {
		const [day, month, year] = dateString.split("/");
		return new Date(`${month}/${day}/${year}`);
	};

	const fromAmerican = (dateString) => {
		const [year, month, day] = dateString.split("-");
		return new Date(`${month}/${day}/${year}`);
	};

	const getCastellsDiada = (diada) => {
		const castells = [];
		const round = [];
		diada.map(castell => round.push(Object.keys(castell)));
		for (let i = Math.min.apply(null, round); i <= Math.max.apply(null, round); i++) {
			const ronda = [];
			diada.forEach(castell => { if (parseInt(Object.keys(castell)) === i) ronda.push(Object.values(castell)[0]); });
			const formated = formatRound(ronda);
			if (formated !== false)
				castells.push(formated);
		}
		return castells;
	};

	const formatRound = (castells) => {
		castells = popPd(castells);	
		if (castells.length < 1) return false;
		switch (castells.length) {
			case 1:
				return castells[0];
			case 2:
				if (castells.includes('3d7') && castells.includes('4d7'))
					return '3i4d7sim';
				break;
			case 3:
				if (castells.includes('Pd5') && countInArray(castells, 'Pd4') === 2)
					return 'Vd5';
				if (castells.includes('Pd6f') && countInArray(castells, 'Pd5') === 2)
					return 'Vd6f';
				break;
			default:
		}

		if (allEqual(castells))
			return castells.length + castells[0];
		const cleanCastells = [];
		castells.forEach(castell => cleanCastells.push(getClean(castell)));
		if (allEqual(cleanCastells)) {
			let count = 0;
			const weird = [];
			castells.forEach((castell, i) => { if (castell === cleanCastells[i]) count += 1; else weird.push(castell) });
			return (count > 1 ? count : '') + cleanCastells[0] + '+' + weird.join('+');
		}
		// console.log(castells);
		return castells.join('+');
	};

	const getClean = (castell) => {
		if (castell.includes('id')) return castell.replace('id', '');
		if (castell.includes('i')) return castell.replace('i', '');
		if (castell.includes('C')) return castell.replace('C', '');
		return castell;
	};

	const popPd = (castells) => {
		const noPd = [];
		castells.forEach(castell => { if (castell.indexOf('pd') === -1) noPd.push(castell); });
		return noPd;
	};

	const allEqual = (arr) => {
		return arr.every(v => v === arr[0]);
	};

	const countInArray = (array, value) => {
		let count = 0;
		for (const e of array)
			if (e === value) count += 1;
		return count;
	};

	const getPoblacions = (diades) => {
		const poblacions = [];
		const poblacionsHTML = [];
		diades.forEach(diada => {
			const poblacio = diada['info']['ciutat'].trim();
			if (!poblacions.includes(poblacio))
				poblacions.push(poblacio);
		});
		poblacions.sort();
		poblacionsHTML.push(<option value="none">--- TOTES LES POBLACIONS ---</option>);
		poblacions.forEach(city => {
			poblacionsHTML.push(<option value={city}>{city}</option>);
		});
		return poblacionsHTML;
	}

	const getCastells = (diades) => {
		const castells = [];
		const castellsHTML = [];
		diades.forEach(diada => {
			const actuacio = getCastellsClean(diada['castells']);
			actuacio.forEach(cast => {
				if (!castells.includes(cast))
					castells.push(cast);
			});
		});
		castells.sort();
		castellsHTML.push(<option value="none">--- TOTS ELS CASTELLS ---</option>);
		castells.forEach(cast => {
			castellsHTML.push(<option value={cast}>{cast}</option>);
		});
		return castellsHTML;
	}

	const getCastellsClean = (diada) => {
		const castells = [];
		const round = [];
		diada.map(castell => round.push(Object.keys(castell)));
		for (let i = Math.min.apply(null, round); i <= Math.max.apply(null, round); i++) {
			let ronda = [];
			diada.forEach(castell => { if (parseInt(Object.keys(castell)) === i) ronda.push(Object.values(castell)[0]); });
			ronda = popPd(ronda);
			ronda.forEach(cast => {
				castells.push(getClean(cast));
			});
		}
		return castells;
	};

	const loadDiades = () => {
		let results = 0;

		const date_from = fromAmerican(document.getElementById('date_from').value);
		const date_to = fromAmerican(document.getElementById('date_to').value);
		const poblacio = document.getElementById('poblacio').value;
		const castell = document.getElementById('castell').value;

		const table = document.getElementById('results');
		const help = document.getElementById('help');
		const noResults = document.getElementById('no-results');
		table.className = '';
		help.className = 'hidden';
		noResults.className = 'hidden';
		for (var i = 1; i < table.rows.length; i++) {
			const date = fromEuropean(table.rows[i].cells[0].innerHTML);
			if (date_from > date || date > date_to) {
				table.rows[i].className = 'hidden';
				continue;
			}
			if (poblacio !== 'none') {
				const city = table.rows[i].cells[3].innerHTML;
				if (city !== poblacio) {
					table.rows[i].className = 'hidden';
					continue;
				}
			}
			if (castell !== 'none') {
				const diada_hash = table.rows[i].cells[0].innerHTML + ' - ' + table.rows[i].cells[2].innerHTML;
				if (!getCastellsClean(diades[diada_hash]['castells']).includes(castell)) {
					table.rows[i].className = 'hidden';
					continue;
				}
			}
			table.rows[i].className = '';
			results += 1;
		}

		if (results === 0) {
			table.className = 'hidden';
			noResults.className = '';
		}
	};

	const [year1, year2] = getTemporada(new Date()).split('-');
	const actuacions = [...Object.values(diades)];
	return (
		<div id="bbdd">
			<div className="filters">
				<div className="container">
					<label htmlFor="date_from">Des de:</label>
					<input type="date" id="date_from" defaultValue={year1+"-09-01"}/>
				</div>
				<div className="container">
					<label htmlFor="date_to">Fins a:</label>
					<input type="date" id="date_to" defaultValue={year2+"-08-31"}/>
				</div>
				<div className="container">
					<label htmlFor="poblacio">Població:</label>
					<select type="text" id="poblacio">
						{getPoblacions(actuacions)}
					</select>
				</div>
				<div className="container">
					<label htmlFor="castell">Castell:</label>
					<select type="text" id="castell">
						{getCastells(actuacions)}
					</select>
				</div>
				<div className="container">
					<button onClick={loadDiades}>Filtrar</button>
				</div>
			</div>
			<h1>Actuacions</h1>
			<h3 id="help">Utilitza els filtres de dalt per a buscar diades.</h3>
			<h3 id="no-results" className="hidden">No s'han trobat resultats per a aquesta búsqueda.</h3>
			<table id="results" className="hidden">
				<thead>
					<tr>
						<th>Data</th>
						<th>Hora</th>
						<th>Actuació</th>
						<th>Població</th>
						<th>Castells</th>
					</tr>
				</thead>
				<tbody>
					{
						actuacions.map(diada => {
							const castells = getCastellsDiada(diada['castells']);
							return (
								<tr className="hidden">
									<td>{diada['info']['data']}</td>
									<td>{diada['info']['hora']}</td>
									<td>{diada['info']['motiu']}</td>
									<td>{diada['info']['ciutat']}</td>
									<td>{castells.join(', ')}</td>
								</tr>
							);
						})
					}
				</tbody>
			</table>
		</div>
	);
}

export default Llista;
