function Llista(props) {
	const { diades } = props;

	const getTemporada = (data) => {
		const year = parseInt(data.split('/')[2]);
		if (isFromTemporada(data, year+'-'+(year+1)))
			return year+'-'+(year+1);
		return (year-1)+'-'+year;
	};

	const isFromTemporada = (diada, temporada) => {
		const diadaDate = fromEuropean(diada);
		const start_temporada = new Date(`09/01/${temporada.split('-')[0]}`);
		const end_temporada = new Date(`08/31/${temporada.split('-')[1]}`);
		return start_temporada <= diadaDate && diadaDate <= end_temporada;
	};

	const fromEuropean = (dateString) => {
		const [day, month, year] = dateString.split("/");
		return new Date(`${month}/${day}/${year}`);
	};

	const toString = (date) => {
		return (fromEuropean(date).toLocaleDateString("ca", { month: 'long', day: 'numeric', year: 'numeric' }));
	}

	const getCastellsDiada = (diada) => {
		let castells = "";
		const round = [];
		diada.map(castell => round.push(Object.keys(castell)));
		for (let i = Math.min.apply(null, round); i <= Math.max.apply(null, round); i++) {
			const ronda = [];
			diada.forEach(castell => { if (parseInt(Object.keys(castell)) === i) ronda.push(Object.values(castell)[0]); });
			castells += formatRound(ronda) + ", ";
		}
		return castells.slice(0,-2);
	};

	const formatRound = (castells) => {
		castells = popPd(castells);	
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
			return count + cleanCastells[0] + '+' + weird.join('+');
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

	const actuacions = [...Object.values(diades)];
	let last_temporada;
	if (actuacions[actuacions.length - 1] !== undefined)
		last_temporada = getTemporada(actuacions[actuacions.length - 1]["info"]["data"]);
	return (
		<div id="llista">
			<div className="wrap">
				{
					actuacions.map(diada => {
						const season = getTemporada(diada["info"]["data"]);
						return (
							<div className="diada" data-season={season} style={{display: season !== last_temporada ? 'none' : 'block' }}>
								<span className="nom">{diada["info"]["motiu"] || "Diada ?"}</span><br/>
								<span className="place">{diada["info"]["situació"]}</span><br/>
								<span className="date">{toString(diada["info"]["data"])} a les {diada["info"]["hora"]}</span><br/>
								<span className="castells">{getCastellsDiada(diada["castells"])}</span>
							</div>
						);
					})
				}
			</div>
		</div>
	);
}

export default Llista;
