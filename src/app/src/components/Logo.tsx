import logoPanda from '@app/assets/logo.svg';
import { Link } from 'react-router-dom';

import './Logo.css';

export default function Logo() {
  return (
    <Link
      to="/"
      className="group hidden shrink-0 items-center px-0 py-1 no-underline perspective-[2000px] min-[360px]:inline-flex sm:px-2"
    >
      <img
        src={logoPanda}
        alt="artef Logo"
        className="logo-icon w-[26px] h-auto transition-transform duration-300 group-hover:scale-105"
      />
      <div className="ml-2 hidden sm:flex items-center gap-2">
        <span className="logo-text font-['Inter',sans-serif] text-base font-bold bg-gradient-to-r from-primary via-indigo-500 to-cyan-500 bg-clip-text text-transparent tracking-tight">
          ARTEF
        </span>
        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 tracking-wider">
          Enterprise
        </span>
      </div>
    </Link>
  );
}
