import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <Navbar/>
      </div>
      <main className='flex-grow container mx-auto px-4 py-6' style={{ paddingTop: '80px' }}>
        <Outlet/>
      </main>
      <Footer/>
    </div>
  );
};

export default UserLayout;
