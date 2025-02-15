import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="headerContainer">
        <p className="headerTitle">
          Bus Tracker
        </p>
        <ul className="headerLinks">
          <li>
            <a href="https://github.com/" rel="noreferrer">
            help
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
