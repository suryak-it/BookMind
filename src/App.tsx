import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import ReadingList from './pages/ReadingList';
import { AuthProvider } from './context/AuthContext';
import { BookListsProvider } from './context/BookListsContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BookListsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/reading-list" element={<ReadingList />} />
              </Routes>
            </div>
          </Router>
        </BookListsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;