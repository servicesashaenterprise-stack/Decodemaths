import { Link } from 'react-router-dom';

export const Logo = ({ className = "", linkTo = "/", size = "md" }) => {
  const sizes = {
    sm: "h-8",
    md: "h-10", 
    lg: "h-16",
    xl: "h-32"
  };
  
  return (
    <Link to={linkTo} className={`inline-block ${className}`}>
      <img 
        src="/decode-maths-logo.png" 
        alt="DECODE MATHS" 
        className={`${sizes[size]} w-auto object-contain`}
      />
    </Link>
  );
};

export default Logo;
