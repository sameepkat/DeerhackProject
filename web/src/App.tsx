import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ClipboardSync from './pages/ClipboardSync';
import SlideControl from './pages/SlideControl';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Clipboard Sync', path: '/clipboard' },
  { name: 'Slide Control', path: '/slide-control' },
];

function Sidebar() {
  const location = useLocation();
  return (
    <div className="h-screen w-56 bg-gray-900 text-white flex flex-col p-4">
      <div className="text-2xl font-bold mb-8">LAN Controller</div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => {
          const selected = location.pathname === item.path || (item.path === '/' && location.pathname === '');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={
                `px-3 py-2 rounded transition-colors ` +
                (selected
                  ? 'bg-white text-gray-900 font-bold shadow'
                  : 'hover:bg-gray-700')
              }
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clipboard" element={<ClipboardSync />} />
            <Route path="/slide-control" element={<SlideControl />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
