import { useEffect, useState } from "react";
import DataProcessor from './Components/DataProcessor'
import DataBase from './Components/DataBase'
import './style.css'

function App() {
  const [diades, setCastells] = useState({});

  const exports = {
    'diades': diades,
    'setCastells': setCastells
  };

  useEffect(() => {
  }, [diades]);

  return (
    <>
      <DataProcessor {...exports} />
      <DataBase {...exports} />
    </>
  );
}

export default App;
