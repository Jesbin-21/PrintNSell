import Button from "../components/Button";
import HowItWorks from "../components/HowItWorks";
import { useState, useEffect } from "react";
import Lenis from "lenis";
import benchy from "../assets/benchy.png"; 
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import "./Home.css";
import ProductCard from "../components/ProductCard";
import Godzilla from "../assets/3d.png"
import About from "./About";
function Home() {
   const [latestProducts, setLatestProducts] = useState([]);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll();



  const x1 = useTransform(
    scrollYProgress, [0, 0.6], [-400, 0]
  )
  const x2 = useTransform(
    scrollYProgress, [0, 0.6], [300, 0]
  )

    const scale = useTransform(
    scrollYProgress, [0.04, 0.2], [1, 0.67]
  )

      const scale1 = useTransform(
    scrollYProgress, [0, 0.3], [1.5, 1]
  )


      const x3= useTransform(
    scrollYProgress, [0, 1], [0, 500]
  )

    const y = useTransform(
    scrollYProgress, [0, 0.5], [0, -100]
  )


   useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/allproducts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // newest 5 products
          const latest = [...data.products]
            .sort(
              (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(0, 5);

          setLatestProducts(latest);
        }
      })
      .catch((error) => {
        console.log("LATEST PRODUCTS ERROR:", error);
      });
  }, []);





  return (
    <div>
      <div className="home">
        <div className="home-left">
          <div className="one">Marketplace for physical prints</div>
          <motion.div style={{scale}} className="two">Sell what you print</motion.div>
          <motion.div style={{scale}} className="three">
            SpooL is the home for 3D-printed physical goods. Upload your
            creation, set a price, and start selling to a community that gets
            it.
          </motion.div>
          <div className="btns">
            <Button
              text="Upload a Product"
              variant="sell"
              onClick={() => navigate("/seller")}
            />
            <Button
              text="Brows marketplace"
              onClick={() => navigate("/showcase")}
            />
          </div>
          <motion.div style={{x:x3}} className="count">
            <div className="listed">
              <h1>12k+</h1>
              <p>Prints listed</p>
            </div>
            <div className="listed">
              <h1>3.4k</h1>
              <p>Active makers</p>
            </div>
            <div className="listed">
              <h1>92</h1>
              <p>Countries served</p>
            </div>
          </motion.div>
        </div>
        
      </div>
       <motion.div style={{scale:scale1}} className="latest-products">

        <h2>Latest Products</h2>

        <div className="latest-products-grid">

          {latestProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}

        </div>

      </motion.div>
      <HowItWorks />
    </div>


  );
}

export default Home;
//============
