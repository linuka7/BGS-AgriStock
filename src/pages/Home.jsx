import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import InventorySection from "../components/home/InventorySection";
import Footer from "../components/home/Footer";
import DashboardShowcase from "../components/home/DashboardShowcase";
import AboutSection from "../components/home/AboutSection";
import CTASection from "../components/home/CTASection";
import ContactSection from "../components/home/ContactSection";

function Home(){

  return(

    <>

      <Navbar />

      <Hero />

      <InventorySection/>

      <Features />

      <DashboardShowcase />

      <AboutSection />

      <ContactSection />

      <CTASection />

      <Footer />

     

    </>

  );

}


export default Home;