export const DecodeMathsLogo = ({ size = 48, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle/compass border */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        stroke="#3B82F6" 
        strokeWidth="3" 
        fill="none"
      />
      
      {/* Inner geometric design - Triangle representing A */}
      <path 
        d="M50 20 L70 60 L30 60 Z" 
        fill="#3B82F6" 
        opacity="0.2"
      />
      <path 
        d="M50 20 L70 60 L30 60 Z" 
        stroke="#3B82F6" 
        strokeWidth="2.5" 
        fill="none"
      />
      
      {/* Mathematical symbols */}
      {/* Pi symbol */}
      <text 
        x="75" 
        y="30" 
        fontSize="16" 
        fontWeight="bold" 
        fill="#F97316"
        fontFamily="serif"
      >
        π
      </text>
      
      {/* Sigma symbol */}
      <text 
        x="20" 
        y="35" 
        fontSize="16" 
        fontWeight="bold" 
        fill="#10B981"
        fontFamily="serif"
      >
        Σ
      </text>
      
      {/* Square root symbol */}
      <path 
        d="M22 75 L27 82 L32 68 L45 68" 
        stroke="#EF4444" 
        strokeWidth="2" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Compass needle/pointer */}
      <path 
        d="M50 30 L50 55" 
        stroke="#1E40AF" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      <circle 
        cx="50" 
        cy="55" 
        r="3" 
        fill="#1E40AF"
      />
      
      {/* Center dot */}
      <circle 
        cx="50" 
        cy="50" 
        r="4" 
        fill="#3B82F6"
      />
      
      {/* Degree marks around the circle */}
      <line x1="50" y1="8" x2="50" y2="15" stroke="#3B82F6" strokeWidth="2" />
      <line x1="50" y1="85" x2="50" y2="92" stroke="#3B82F6" strokeWidth="2" />
      <line x1="8" y1="50" x2="15" y2="50" stroke="#3B82F6" strokeWidth="2" />
      <line x1="85" y1="50" x2="92" y2="50" stroke="#3B82F6" strokeWidth="2" />
      
      {/* Diagonal marks */}
      <line x1="20" y1="20" x2="25" y2="25" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="80" y1="20" x2="75" y2="25" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="20" y1="80" x2="25" y2="75" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="80" y1="80" x2="75" y2="75" stroke="#3B82F6" strokeWidth="1.5" />
    </svg>
  );
};

export default DecodeMathsLogo;
