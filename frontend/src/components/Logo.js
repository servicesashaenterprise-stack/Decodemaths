import { Link } from 'react-router-dom';
import DecodeMathsLogo from './DecodeMathsLogo';

export const Logo = ({ className = "", linkTo = "/" }) => {
  return (
    <Link to={linkTo} className={`flex items-center gap-3 ${className}`}>
      <DecodeMathsLogo size={40} />
      <span className="text-2xl font-heading font-bold text-primary">
        DECODE MATHS
      </span>
    </Link>
  );
};

export default Logo;
