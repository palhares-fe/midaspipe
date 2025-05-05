// frontend/src/App.tsx (Exemplo de modificação)

import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg'; // Se estiver usando Vite >= 4
import './App.css';

// Interface para tipar os dados esperados da API (bom para TypeScript)
interface ApiResponse {
  message: string;
  status: string;
  timestamp: string;
}

function App() {
  const [count, setCount] = useState(0);
  // --- Estados para os dados da API ---
  const [apiData, setApiData] = useState<ApiResponse | null>(null); // Armazena os dados recebidos
  const [loading, setLoading] = useState<boolean>(true); // Indica se estamos carregando
  const [error, setError] = useState<string | null>(null); // Armazena mensagens de erro

  // --- useEffect para buscar dados quando o componente montar ---
  useEffect(() => {
    // Define uma função async dentro do useEffect para poder usar await
    const fetchDataFromApi = async () => {
      setLoading(true); // Inicia o carregamento
      setError(null); // Limpa erros anteriores
      try {
        // Faz a requisição GET para o endpoint do backend
        // Certifique-se que a URL está correta (http, host, porta, caminho)
        const response = await fetch('http://127.0.0.1:5000/api/test/hello');

        // Verifica se a resposta HTTP foi bem-sucedida (status 2xx)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Converte a resposta para JSON
        const data: ApiResponse = await response.json();

        // Atualiza o estado com os dados recebidos
        setApiData(data);

      } catch (err: any) {
        // Se ocorrer um erro (rede, JSON inválido, status não-ok)
        console.error("Erro ao buscar dados da API:", err);
        setError(err.message || 'Ocorreu um erro ao buscar os dados.');
      } finally {
        // Garante que o loading seja desativado, mesmo se der erro
        setLoading(false);
      }
    };

    fetchDataFromApi(); // Chama a função de busca
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez (ao montar)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* --- Seção para exibir dados da API --- */}
      <div className="api-data">
        <h2>Dados da API Flask:</h2>
        {loading && <p>Carregando dados do backend...</p>}
        {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
        {apiData && !loading && !error && (
          <div>
            <p><strong>Mensagem:</strong> {apiData.message}</p>
            <p><strong>Status:</strong> {apiData.status}</p>
            <p><strong>Timestamp:</strong> {apiData.timestamp}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;