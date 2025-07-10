import React from "react";
import { Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
const Testimonials: React.FC = () => {
  const testimonials = [{
    quote: "Dr. Fintan's virtual consultation was incredibly convenient and thorough. He took his time to listen to all my concerns and explained everything so clearly. The follow-up was prompt and helpful.",
    author: "Sarah M.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  }, {
    quote: "I was skeptical about virtual healthcare, but Dr. Fintan changed my mind completely. The video quality was excellent, and I received the same level of care as an in-person visit, without the travel time.",
    author: "David L.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  }, {
    quote: "As someone with mobility issues, Dr. Fintan's virtual consultations have been life-changing. I no longer have to struggle to get to appointments. Professional, compassionate care right from my living room.",
    author: "Elena K.",
    image: "https://randomuser.me/api/portraits/women/62.jpg",
    rating: 5
  }];
  return <section className="py-16 bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium inline-block mb-4">
            Patient Stories
          </span>
          <h2 className="text-3xl font-bold mt-2 mb-4 text-white">What Our Patients Say</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Don't just take our word for it. Hear from patients who have experienced Dr. Fintan's virtual care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {testimonials.map((testimonial, index) => <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-medical-warning fill-medical-warning" />)}
                </div>
                <p className="italic mb-6 text-slate-50">"{testimonial.quote}"</p>
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <img src={testimonial.image} alt={testimonial.author} className="h-full w-full object-cover" />
                  </div>
                  <span className="font-medium text-white">{testimonial.author}</span>
                </div>
              </CardFooter>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default Testimonials;