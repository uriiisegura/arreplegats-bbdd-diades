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

	function showSeason() {
		const season = document.getElementById('select_temporada').value;
		const diades_divs = document.getElementsByClassName('diada');
		for (let div of diades_divs) {
			if (div.dataset.season === season) div.style.display = 'block';
			else div.style.display = 'none';
		}
	};

	let last_temporada;
	const temporades = [];
	[...Object.values(diades)].forEach(diada => {
		const temporada = getTemporada(diada["info"]["data"]);
		if (temporades.includes(temporada)) return;
		temporades.push(temporada);
		last_temporada = temporada;
	});
	
	return (
		<div id="selector">
			<select id="select_temporada" onChange={showSeason}>
				{
					temporades.map(temporada => {
						return <option value={temporada} selected={temporada === last_temporada}>Temporada {temporada}</option>;
					})
				}
			</select>
		</div>
	);
}

export default Llista;
