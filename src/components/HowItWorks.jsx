import "./HowItWokrs.css";
import { motion, useScroll, useTransform } from "motion/react";
import { Store, Box, Printer } from "lucide-react";
import { useState, useEffect } from "react";

function HowItWorks() {
  const { scrollYProgress } = useScroll();

  const scale = useTransform(scrollYProgress, [0.1, 1], [1, 1.2]);
  const x1 = useTransform(scrollYProgress, [0.1, 0.6], [-400, 0]);
  const x2 = useTransform(scrollYProgress, [0, 0.6], [300, 0]);
  const rotate = useTransform(scrollYProgress, [0.2, 0.8], [90, 0]);

  // Detect mobile — disable scroll-driven motion on small screens
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = [
    {
      number: "01",
      title: "Create your shop",
      description:
        "Set up your own storefront and show customers what you can make.",
      icon: <Store />,
    },
    {
      number: "02",
      title: "Print & list",
      description:
        "Upload your products, add photos, choose your price, and publish.",
      icon: (
        <div className="step-icon">
          <Printer />
        </div>
      ),
    },
    {
      number: "03",
      title: "Make a sale",
      description:
        "Customers discover your products. You print them and deliver the order.",
      icon: <Box />,
    },
  ];

  return (
    <section className="how-section">
      <div className="how-container">

        {/* Heading */}
        <div className="how-heading">
          <span className="how-label">HOW IT WORKS</span>

          <motion.h2 style={isMobile ? {} : { scale, x: x1 }}>
            From your printer
            <br />
            <span>to someone's doorstep.</span>
          </motion.h2>

          <motion.p style={isMobile ? {} : { x: x2 }}>
            You don't need a factory. Turn your 3D printer,
            creativity, and spare time into a real business.
          </motion.p>
        </div>

        {/* Steps */}
        <motion.div style={isMobile ? {} : { x: x1 }} className="steps">

          {steps.map((step, index) => (
            <motion.div
              style={isMobile ? {} : { rotate }}
              className="step-card"
              key={step.number}
            >
              <div className="step-top">
                <span className="step-number">{step.number}</span>
                <span className="step-icon">{step.icon}</span>
              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              {index < steps.length - 1 && (
                <div className="step-arrow">→</div>
              )}
            </motion.div>
          ))}

        </motion.div>

        {/* Bottom CTA */}
        <div className="how-bottom">
          <span>Got a 3D printer?</span>

          <button>
            Create your shop
            <span>↗</span>
          </button>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;