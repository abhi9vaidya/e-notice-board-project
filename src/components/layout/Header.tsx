import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import CollegeInfoModal from './CollegeInfoModal';
import { Bell, GraduationCap, Archive, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { faculty } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <button 
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight text-foreground md:text-xl">
                Faculty E-Notice Board
              </h1>
              <p className="hidden text-xs text-muted-foreground md:block">
                RCOEM Nagpur • Click for info
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Archive Link */}
            <Link to="/archive">
              <Button variant="ghost" size="icon" className="h-9 w-9" title="View Archive">
                <Archive className="h-5 w-5" />
              </Button>
            </Link>
            
            {/* Notifications — admin only */}
            {faculty?.role === 'admin' && (
              <button
                className="relative p-1 rounded-md hover:bg-muted transition-colors"
                title="Admin panel"
                onClick={() => navigate('/admin')}
              >
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
            
            <ThemeToggle />
            
            {/* Profile Button - More Prominent */}
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-2 hover:bg-primary/10"
              onClick={() => navigate('/profile')}
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={faculty?.profilePhotoUrl} alt={faculty?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {faculty?.name ? getInitials(faculty.name) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">{faculty?.name || 'Profile'}</span>
                <span className="text-xs text-muted-foreground">View Profile</span>
              </div>
            </Button>
          </div>
        </div>
      </header>

      <CollegeInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
    </>
  );
};

export default Header;
