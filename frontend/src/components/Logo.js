import { Link } from 'react-router-dom';

export const Logo = ({ className = "", linkTo = "/" }) => {
  return (
    <Link to={linkTo} className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/images/logo.png" 
        alt="DECODE MATHS Logo" 
        className="h-12 w-12 object-contain"
        style={{ 
          filter: 'brightness(0) saturate(100%) invert(44%) sepia(87%) saturate(2270%) hue-rotate(200deg) brightness(98%) contrast(92%)'
        }}
      />
      <span className="text-2xl font-heading font-bold text-primary">
        DECODE MATHS
      </span>
    </Link>
  );
};

export default Logo;
