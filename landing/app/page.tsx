import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Benefits from '../components/Benefits'
import TestimonialsAndStats from '../components/TestimonialsAndStats'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import StructuredData from '../components/StructuredData'

export default function Home() {
  return (
    <main className="min-h-screen">
      <StructuredData />
      <Navbar />
      <Hero />
      <Features />
      <Benefits />
      <TestimonialsAndStats />
      <Contact />
      <Footer />
    </main>
  )
}
