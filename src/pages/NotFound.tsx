import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import rbuLogo from "@/assets/rbu-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative z-10">
        {/* RBU Logo */}
        <div className="mx-auto mb-8">
          <img 
            src={rbuLogo} 
            alt="Ramdeobaba University Logo" 
            className="h-24 w-24 object-contain mx-auto"
          />
        </div>

        <h1 className="text-8xl font-bold text-primary mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          404
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-white/70 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link to="/">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-sm text-white/50">
          Ramdeobaba University E-Notice Board System
        </p>
      </div>
    </div>
  );
};

export default NotFound;
