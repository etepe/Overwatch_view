import { Globe } from './components/Globe';
import { Header } from './components/Header';
import { LayerPanel } from './components/LayerPanel';
import { SearchBar } from './components/SearchBar';

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Globe />
      <Header />
      <SearchBar />
      <LayerPanel />
    </div>
  );
}
