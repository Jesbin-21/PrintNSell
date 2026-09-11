
// import "./About.css";

function About() {
  return (
    <div className="aboutPage">
      <div className="aboutContainer">
        <h1>About PrintNSell</h1>

        <p className="aboutIntro">
          PrintNSell is a marketplace where 3D printing enthusiasts can
          discover and buy unique 3D printed products.
        </p>

        <div className="aboutSection">
          <h2>What We Do</h2>
          <p>
            We connect customers with 3D printer owners and makers who create
            and sell their own products.
          </p>
        </div>

        <div className="aboutSection">
          <h2>Our Goal</h2>
          <p>
            Our goal is to make 3D printed products easy to discover, buy,
            and sell while helping makers turn their creativity into
            opportunities.
          </p>
        </div>

        <div className="aboutSection">
          <h2>Why PrintNSell?</h2>
          <p>
            From useful everyday products to creative designs, PrintNSell
            brings makers and customers together in one simple marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;

