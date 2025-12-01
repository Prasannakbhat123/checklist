import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import GeneratePage from './pages/GeneratePage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/generate" element={<GeneratePage />} />
      </Routes>
    </Router>
  );
}

export default App;
