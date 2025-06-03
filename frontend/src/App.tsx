// frontend/src/App.tsx (Exemplo de modificação)

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import WorkflowDesigner from './components/WorkflowDesigner/WorkflowDesigner';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journey/:id" element={<WorkflowDesigner />} />
          <Route path="/journey/new" element={<WorkflowDesigner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;