import { Link } from 'react-router-dom';

export const Logo = ({ className = "", linkTo = "/" }) => {
  return (
    <Link to={linkTo} className={`flex items-center gap-3 ${className}`}>
      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-white font-heading font-bold text-xl">D</span>
      </div>
      <span className="text-2xl font-heading font-bold text-primary">
        DECODE MATHS
      </span>
    </Link>
  );
};

export default Logo;
