import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes

function Logo({ className }) {
  return (
    <Link to="/main-page" className={`inline-flex gap-2 ${className}`}>
      <div className="relative h-6 pb-6 w-32 ">
        <img
          src="/images/logo.png"
          alt="Liwan Logo"
          className="object-contain invert dark:invert-0 "
        />
      </div>
    </Link>
  );
}

// Prop validation using PropTypes
Logo.propTypes = {
  className: PropTypes.string, // Validate that className is a string
};

export default Logo;
