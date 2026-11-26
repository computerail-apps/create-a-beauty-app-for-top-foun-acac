import { Palette, Bookmark, Search } from 'lucide-react';
import { Nav, NavLink, Container } from '@/lib/ui';
import { useRoute, navigate } from '@/lib/router';
import { Matcher } from '@/components/Matcher';
import { ProductPage } from '@/components/ProductPage';
import { Shelf } from '@/components/Shelf';

export default function App() {
  const route = useRoute();
  const product = route.match(/^\/product\/([^/]+)/);
  const onShelf = route.startsWith('/shelf');
  const onMatcher = !product && !onShelf;

  return (
    <div className="min-h-screen">
      <Nav
        brand={
          <span className="inline-flex items-center gap-2">
            <Palette size={20} />Undertone
          </span>
        }
        actions={
          <div className="flex items-center gap-1">
            <NavLink href="#/" active={onMatcher} onClick={() => navigate('/')}>
              <Search size={14} className="mr-2" />Matcher
            </NavLink>
            <NavLink href="#/shelf" active={onShelf} onClick={() => navigate('/shelf')}>
              <Bookmark size={14} className="mr-2" />Shelf
            </NavLink>
          </div>
        }
      />
      <main className="py-8 md:py-12">
        <Container>
          {product ? <ProductPage code={decodeURIComponent(product[1])} /> : onShelf ? <Shelf /> : <Matcher />}
        </Container>
      </main>
    </div>
  );
}
