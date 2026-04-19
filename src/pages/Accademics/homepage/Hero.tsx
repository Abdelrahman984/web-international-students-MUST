import { Link } from "react-router";

export default function Hero() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image Placeholder */}
      <img 
        src="accademics/hero-image.png"
        alt="MUST Campus" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 px-4 text-center mt-20">
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold">
                Academics Student
            </h1>

            <div className="flex items-center space-x-2 text-white/90 text-sm md:text-base font-medium">

                <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
                <span className="text-emerald-500">/</span>

                <Link to="#" className="hover:text-emerald-400 transition-colors">Academics</Link>
                <span className="text-emerald-500">/</span>

                <Link to="/notifications" className="hover:text-emerald-400 transition-colors">Notification</Link>
                <span className="text-emerald-500">/</span>

                <Link to="/resources" className="hover:text-emerald-400 transition-colors">Resources</Link>
            </div>
        </div>
      </div>
  );
}
