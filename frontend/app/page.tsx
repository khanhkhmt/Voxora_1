import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import DemoBox from "@/components/landing/DemoBox";
import Features from "@/components/landing/Features";
import UseCases from "@/components/landing/UseCases";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <DemoBox />
        <Features />
        <UseCases />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
