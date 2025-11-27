'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface TestimonialProps {
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialProps }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col"
    >
      {/* Stars */}
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${
              i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 flex-grow leading-relaxed">
        &ldquo;{testimonial.content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {testimonial.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {testimonial.role} at {testimonial.company}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const TestimonialsAndStats = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const testimonials: TestimonialProps[] = [
    {
      name: "Sarah Chen",
      role: "Energy Manager",
      company: "TechCorp Solutions",
      content: "The WattUP platform has revolutionized how we monitor our energy consumption. We've reduced our electricity costs by 35% in just six months while gaining unprecedented visibility into our usage patterns.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Facilities Director",
      company: "GreenSpace Industries",
      content: "Real-time anomaly detection has saved us thousands in potential equipment failures. The predictive analytics are incredibly accurate and the user interface is intuitive for our entire team.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Operations Manager",
      company: "Smart Manufacturing Co",
      content: "Implementation was seamless and the support team is exceptional. The detailed reporting and automated alerts have made energy management effortless across our multiple facilities.",
      rating: 5,
      avatar: "EW"
    },
    {
      name: "David Kim",
      role: "Chief Technology Officer",
      company: "Innovative Systems Ltd",
      content: "The AI-powered insights have helped us optimize our energy usage beyond our expectations. The ROI became apparent within the first quarter of implementation.",
      rating: 5,
      avatar: "DK"
    },
    {
      name: "Lisa Thompson",
      role: "Sustainability Director",
      company: "EcoTech Enterprises",
      content: "Not only have we reduced costs, but we've also significantly decreased our carbon footprint. The environmental impact reporting is comprehensive and helps with our sustainability goals.",
      rating: 5,
      avatar: "LT"
    },
    {
      name: "James Wilson",
      role: "Plant Manager",
      company: "Industrial Solutions Inc",
      content: "The 24/7 monitoring and instant alerts have prevented multiple costly outages. The system pays for itself through operational efficiency improvements alone.",
      rating: 5,
      avatar: "JW"
    }
  ]

  const stats = [
    { value: "10,000+", label: "Devices Successfully Monitored", icon: "📊" },
    { value: "30%", label: "Average Cost Reduction", icon: "💰" },
    { value: "99.9%", label: "System Uptime Reliability", icon: "⚡" },
    { value: "500+", label: "Happy Enterprise Customers", icon: "🏢" },
    { value: "24/7", label: "Expert Support Available", icon: "🛟" },
    { value: "50M+", label: "Data Points Processed Daily", icon: "📈" }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const getVisibleTestimonials = () => {
    const startIndex = currentSlide * 3
    return testimonials.slice(startIndex, startIndex + 3)
  }

  return (
    <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what our customers are saying about their experience with WattUP 
            and the results they&apos;ve achieved.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {getVisibleTestimonials().map((testimonial, index) => (
              <TestimonialCard 
                key={`${currentSlide}-${index}`} 
                testimonial={testimonial} 
              />
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Impact in Numbers
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Trusted by companies of all sizes across various industries
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['TechCorp', 'GreenSpace', 'SmartMfg', 'InnoSys', 'EcoTech', 'IndSol'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-xl font-bold text-gray-500 dark:text-gray-400"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TestimonialsAndStats
